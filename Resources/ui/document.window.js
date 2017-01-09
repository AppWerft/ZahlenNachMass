var DatePicker = require("ui/datepicker.widget");
const
MENU_ITEM_TRASH = 1, MENU_ITEM_UPLOAD = 0;

var Module = function(_id) {
	var id = (_id) ? _id : undefined;
	var Xhr;
	var set = Adapter.getReceipt(_id);
	if (set && set.done) {
		alert("Beleg ist weg, kann nicht weiter bearbeitet werden.");
		return;
	}
	var $ = Ti.UI.createWindow({
		title : "ZahlenNachMaß",
		exitOnClose : false,
	});
	if (set)
		$.add(require("de.marcelpociot.autofocus").createView());
	$.container = Ti.UI.createScrollView({
		top : 0,
		scrollType : "vertical",
		layout : "vertical",
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		contentWidth : Ti.UI.FILL,
		contentHeight : Ti.UI.SIZE,
	});
	$.add($.container);
	setTimeout(function() {
		$.imageViewLabel = Ti.UI.createLabel({
			left : 15,
			top : 10,
			right : 15,
			text : "Beleg",
			font : {
				fontSize : 10
			}
		});
		$.imageView = ZoomView.createView({
			left : 15,
			top : 5,
			zoom : 2,
			right : 15,
			borderWidth : 1,
			borderColor : "silver",
			width : Ti.UI.Fill,
			image : set ? set.image : "/assets/logo.png",
			height : 320,
		});
		$.bookingdateViewLabel = Ti.UI.createLabel({
			left : 15,
			top : 10,
			right : 15,
			text : "Belegdatum:",
			font : {
				fontSize : 10
			}
		});
		$.bookingdateView = Ti.UI.createLabel({
			left : 15,
			top : 0,
			right : 15,
			cdateM :  set ? set.cdateM : Moment(),
			text : set ? set.cdateLL : "",
			color : "#195797",
			font : {
				fontSize : 30,
				fontWeight : "bold"
			}
		});
		$.bookingdateView.addEventListener("click", function(e) {
			DatePicker(id, e.source.cdateM, function(cdateM) {
				e.source.setText(cdateM.format("LL"));
				e.source.cdateM = cdateM;
				
			});
		});

		$.amountViewLabel = Ti.UI.createLabel({
			left : 15,
			top : 10,
			right : 15,
			text : "Betrag (in EUR):",
			font : {
				fontSize : 10
			}
		});

		$.amountView = Ti.UI.createTextField({
			left : 15,
			top : 0,
			height : 70,
			clearOnEdit : set ? false : true,
			width : 150,
			right : 15,
			textAlign : "left",
			autocorrect : false,
			maxLength : 6,
			hintTextColor : "#ddd",
			hintText : set ? undefined : "0.00 €",
			color : "#195797",
			value : set ? set.amount : undefined,
			font : {
				fontSize : 30,
				fontWeight : "bold"
			},
			keyboardType : Ti.UI.KEYBOARD_TYPE_DECIMAL_PAD
		});
		$.vatViewLabel = Ti.UI.createLabel({
			left : 15,
			top : 10,
			right : 15,
			text : "Mehrwertsteuer:",
			font : {
				fontSize : 10
			}
		});
		$.vatView = Ti.UI.createView({
			top : 15,
			left : 10,
			right : 10,
			height : 50
		});

		$.vatView.add(require("ui/seekbar.widget")(id,
				(set) ? set.vat : undefined));

		$.container.add($.vatViewLabel);
		$.container.add($.vatView);
		$.container.add($.bookingdateViewLabel);
		$.container.add($.bookingdateView);
		// $.container.add($.imageViewLabel);
		$.container.add($.imageView);
		$.container.add($.amountViewLabel);
		$.container.add($.amountView);

		$.amountView.blur();
		$.amountView.addEventListener("return", function(e) {
			e.source.setValue(parseFloat(e.value).toFixed(2));
			Adapter.setAmount(id, parseFloat(e.value).toFixed(2));
		});
	}, 0);
	var onOpenHandler = function(event) {
		$.removeEventListener("open", onOpenHandler);
		if (!Ti.Android)
			return;

		var onUploadHandler = function() {
			var ProgressWindow = new require("ui/progress.widget")();
			ProgressWindow.init();
			Xhr = new Adapter.uploadReceipt(id, {
				onprogress : function(progress) {
					if (progress % 10 == 0)
						console.log(progress);
					ProgressWindow.update(progress);
					if (progress == 100) {
						ProgressWindow.close();
						$.close();
						Adapter.setDone(id,true);
					}
				},
				onload : function(result) {
					ProgressWindow.close();
					$.close();
					Adapter.setDone(id,true);
				}
			});
		};
		var onTrashHandler = function() {
			var dialog = Ti.UI.createAlertDialog({
				cancel : 1,
				buttonNames : [ 'Ja', 'Nein' ],
				message : 'Wollen Sie den Beleg tatsächlich löschen?',
				title : 'Belegverwurf'
			});
			dialog.addEventListener('click', function(e) {
				if (e.index !== e.source.cancel) {
					Adapter.deleteReceipt(id);
					win.close();
				}
			});
			dialog.show();
		};
		abx.subtitle = set ? "Erfasster Beleg über " + set.amount + "€"
				: "Neuer Beleg";
		abx.titleColor = "#ccc";
		abx.subtitleColor = "#ccc";
		var win = event.source;
		win.getActivity().actionBar.setDisplayHomeAsUp(true);
		win.getActivity().onCreateOptionsMenu = function(e) {
			e.menu.clear();
			e.menu.add({
				itemId : MENU_ITEM_TRASH,
				title : 'Weg damit!',
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
				icon : "/assets/trash.png"
			}).addEventListener("click", onTrashHandler);
			e.menu.add({
				title : 'Hoch damit!',
				itemId : MENU_ITEM_UPLOAD,
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
				icon : "/assets/upload.png"
			}).addEventListener("click", onUploadHandler);
		};
		win.getActivity().actionBar.onHomeIconItemSelected = function() {
			win.close();
		};

		if (!set) {
			Ti.Media.showCamera({
				mediaTypes : [ Ti.Media.MEDIA_TYPE_PHOTO ],
				whichCamera : Ti.Media.CAMERA_REAR,
				allowEditing : false,
				success : function(event) {
					if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
						$.imageView.image = event.media;
						id = Moment().format("X");
						Adapter.createReceipt({
							id : id,
							image : event.media
						});
						DatePicker(id, Moment(), function(cdateM) {
							$.bookingdateView.setText(cdateM.format("LL"));
							$.bookingdateView.cdateM = cdateM;
						});
					}
				},
				cancel : function() {
					$.close();
				}
			}); // of camera
		} // of !id
	}; // and of onOpenhandler
	$.addEventListener("open", onOpenHandler);
	$.addEventListener("close", function() {
		if (Xhr)
			Xhr.abort();
	});

	$.open();
};
module.exports = Module;
