

module.exports = function($, _onsuccess, _onerror) {
	if (Ti.Android) {
		abx.subtitle = "QR-Code einlesen";
	}
	function successHandler(res) {
		if (res != undefined && res.data != undefined
				&& res.data == "mnz://698d51a19d8a121ce581499d7b701668") {
			Ti.App.Properties.setString("ACCOUNT", res.data.split("//")[1]);
			Ti.Media.vibrate([0, 10,50,10]);
			if (TouchId.deviceCanAuthenticate().canAuthenticate == true) {
				var dialog = Ti.UI
						.createAlertDialog({
							cancel : 1,
							buttonNames : [ "Ja (sicher)", 'Nein (bequem)' ],
							message : 'Möchten Sie die Transaktionen mit Ihrem Fingerabdruck sichern?',
							title : 'Zugang zum Konto'
						});
				dialog.addEventListener('click', function(e) {
					require("ui/list.window")();
					$.close();
					if (e.index === e.source.cancel) {
						Ti.API.info('The cancel button was clicked');
						Ti.App.Properties.setBool("FINGERPRINT", false);
					} else
						Ti.App.Properties.setBool("FINGERPRINT", true);
				});
				dialog.show();
			} else {
				_onsuccess();
				$.close();
			}
		} else
			alert("Keine gültiger Kunden-Code.");
	}
	function cancelHandler() {
		alert("Cancelled");
	}
	var perms = [ "android.permission.CAMERA",
			"android.permission.WRITE_EXTERNAL_STORAGE", "USE_FINGERPRINT",
			"VIBRATE" ];
	require("lib/permissions").requestPermissions(perms,
			function(wasSuccessful) {
				if (wasSuccessful == true) {
					$.scanintro.setText(L("SCAN_HELP"));
					$.scanhint.setText("");
					qrCodeView = QRreader.createQRCodeView({
						width : Ti.UI.FILL,
						left : 15,
						right : 15,
						height : 300,
						useFrontCamera : false,
						success : successHandler,
						cancel : cancelHandler
					});
					$.qr.backgroundImage = "/assets/frame.png";

					$.add(qrCodeView);
				} else
					alert("Sie müssen zustimmen die Kamera zu nutzen.");
			});

};