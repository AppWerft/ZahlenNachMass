var propertyKeys = [ "FINGERPRINT", "SOUND", "VIBRATION", "DELETEAFTER",
		"VALIDATION", "ONLYWIFI" ];

var Moment = require("lib/moment");
var abx = require("com.alcoapps.actionbarextras");
Moment.locale('de');
var Adapter = require("model/index");
var ZoomView = require("org.iotashan.TiTouchImageView");
var TouchId = require('ti.touchid');
var QRreader = require('com.acktie.mobile.android.qr');

!function() {
	require("ui/activating.window")(require("ui/list.window"));
}();
