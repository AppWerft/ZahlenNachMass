const
PADDING = 15;
module.exports = function(_onsuccess, _onerror) {
	if (Ti.App.Properties.hasProperty("ACCOUNT")) {
		_onsuccess();
		return;
	} else
		var $ = Ti.UI.createWindow({
			title : "ZahlenNachMaß",
			backgroundImage : "/assets/bb.png",
			exitOnClose : true,
		});

	var onOpenHandler = function() {
		if (Ti.Android) {
			var abx = require("com.alcoapps.actionbarextras");
			abx.subtitle = "Kunden-Aktivierung";
			abx.titleColor = "#ccc";
			abx.subtitleColor = "#ccc";
		}
		$.scanintro = Ti.UI.createLabel({
			top : PADDING,
			right : PADDING,
			left : PADDING,
			color : "gray",
			font : {
				fontSize : 22,
				fontWeight : "bold"
			},
			opacity : 0.3,
			text : L("SCAN_INTRO")
		});
		$.scanhint = Ti.UI.createLabel({
			bottom : PADDING,
			right : PADDING,
			left : PADDING,
			font : {
				fontSize : 14
			},
			text : L("SCAN_HINT"),
			horizontalWrap : false,
			wordWrap : false,
			backgroundColor : 'white',
			ellipsize : Ti.UI.TEXT_ELLIPSIZE_TRUNCATE_MARQUEE,

		});
		var i = 0;
		$.qr = new require("ui/qr.widget")(300);
		$.qr.opacity = 0.1;
		$.qr.animate({
			opacity : 1
		});
		var cron = setInterval(function() {
			$.qr.update("znm://" + Ti.Utils.md5HexDigest("" + i));
			i++;
		}, 700);

		$.addEventListener("click", function() {
			clearInterval(cron);
			$.remove($.hand);
			require("ui/barcodescan.widget")($, _onsuccess, _onerror);
		});
		$.add($.scanintro);
		$.add($.qr);

		$.hand = Ti.UI.createImageView({
			image : "/assets/hand.png",
			width : 240,
			opacity : 0.95,
			bottom : -290,
		});
		setTimeout(function() {
			$.hand.animate({
				bottom : 0,
				duration : 800
			});
		}, 1000);
		$.add($.hand);
		$.add($.scanhint);
		$.scanintro.animate({
			opacity : 1,
			duration : 1000
		});
		
		var m= Ti.UI.create2DMatrix();
		$.qr.transform=m;
		//Ti.Accelerometer.addEventListener("update", function(e) {
		//	m.translate(1,e.x);
		//});
	};
	$.addEventListener("open", onOpenHandler);
	$.open();
	$.addEventListener("android:back", function(_e) {// listen for the
		// back-button-tap event
		_e.cancelBubble = true;
		var intent = Ti.Android.createIntent({
			action : Ti.Android.ACTION_MAIN,
			flags : Ti.Android.FLAG_ACTIVITY_NEW_TASK
		});
		intent.addCategory(Ti.Android.CATEGORY_HOME);
		// Ti.Android.currentActivity.startActivity(intent);
		$.close();
		return true;
	});
	
};