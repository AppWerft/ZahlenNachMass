module.exports = function(options, callbacks) {
	var start = new Date().getTime();
	if (!TouchId.isSupported()) {
	//	alert("This device doesn't support fingerprint sensor");
		return;
	}
	var dialog = null;
	if (Ti.Platform.osname == "android") {
		var timer = 0;
		var cronHandler = function() {
			timer++;
			if (timer == 600) {
				clearInterval(cron);
			} else {
				// fingerprintView.backgroundImage = "/assets/fingerprint"
				// + timer % 9 + '.png';
				progress.setValue(timer);
			}
		};
		var cron = setInterval(cronHandler, 100);
		var $ = Ti.UI.createWindow({
			theme : "Theme.FingerprintDialog",
			backgroundColor : 'transparent',
			width : Ti.UI.FILL,
			height : Ti.UI.FILL,
			fullscreen : true
		});
		$.add(Ti.UI.createView({
			width : Ti.UI.FILL,
			height : Ti.UI.FILL,
			backgroundColor : "#c333"
		}));
		var container = Ti.UI.createView({
			width : "75%",
			height : 300
		});
		$.add(container);
		var androidView = Ti.UI.createView({
			top : 50,
			backgroundColor : "#fff",
		});

		var fingerprintView = Ti.UI.createView({
			width : 120,
			top : 0,
			height : 120,
			zIndex : 9999,
			backgroundImage : "/assets/fp.png"
		});
		container.add(fingerprintView);
		androidView.add(Ti.UI.createLabel({
			left : 20,
			right : 20,
			bottom : 70,
			color : '#333',
			text : options.message
		}));
		var progress = Ti.UI.createProgressBar({
			width : Ti.UI.FILL,
			bottom : 10,
			left : 10,
			right : 10,
			min : 0,
			max : 600
		});
		var cancel = Ti.UI.createButton({
			width : 100,
			bottom : 10,
			title : "Abbruch",
			right : 10,
		});
		var errormessage = Ti.UI.createLabel({
			left : 20,
			right : 20,
			top : 135,
			color : "#8c00",
			textAlign : "center",
			horizontalWrap : false,
			wordWrap : false,
			ellipsize : Ti.UI.TEXT_ELLIPSIZE_TRUNCATE_MARQUEE,
			height : 25
		});

		androidView.add(progress);

		//androidView.add(cancel);
		cancel.addEventListener("click", function() {
			$.close();
			callbacks.onerror();
		});
		progress.show();
		container.add(androidView);
		$.open();
		$.addEventListener("android:back", function(_e) {
			_e.cancelBubble = true;
			$.close();
			callbacks.onerror();
			return false;
		});

	}
	TouchId.authenticate({
		reason : options.message,
		callback : function(e) {
			if (e.help) {
				Ti.UI.createNotification({
					message : e.help
				}).show();
			} else if (e.success == true) {
				$.close();
				callbacks.onsuccess();
			}
		}
	});

};