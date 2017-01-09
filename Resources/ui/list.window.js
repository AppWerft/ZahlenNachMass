module.exports = function() {
	var $ = Ti.UI.createWindow({
		title : "ZahlenNachMaß",
		exitOnClose : true,

	});
	var granted = false;
	$.add(Ti.UI.createTableView());
	$.children[0].addEventListener("click", function(e) {
		require("ui/document.window")(e.rowData.id);
	});
	var updateUI = function() {
		if (granted == true)
			$.children[0]
					.setData(Adapter.listReceipts().map(require("ui/row")));
	};
	var onOpenHandler = function(e) {

		if (!Ti.Android)
			return;
		var abx = require("com.alcoapps.actionbarextras");
		abx.subtitle = "Belegübersicht";
		abx.titleColor = "#ccc";
		abx.subtitleColor = "#ccc";
		var win = e.source;
		if (Ti.App.Properties.hasProperty("FINGERPRINT")
				&& Ti.App.Properties.getBool("FINGERPRINT") == true) {
			require("ui/fingerprint.dialog")
					(
							{
								title : "Zugangskontrolle",
								message : "Fingersensor für Freizuschaltung des Zugangs.\n\nBitte legen Sie Ihren Finger auf den Sensor."
							}, {
								onerror : function() {
									//alert("Zugang nicht möglich.");
									win.close();
								},
								onsuccess : function() {
									Ti.Media.createSound({
										url : "/assets/door_lock.mp3"
									}).play();
									granted = true;
									Ti.Media.vibrate([ 0, 10, 50, 20 ]);
									updateUI();
								}
							});
		} else {
			Ti.Media.createSound({
				url : "/assets/door_lock.mp3"
			}).play();
			granted = true;
			updateUI();
		}

		win.getActivity().onCreateOptionsMenu = function(e) {
			e.menu.clear();
			var configMenuItem = e.menu.add({
				title : 'Conf',
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
				icon : "/assets/config.png"
			});
			configMenuItem.addEventListener("click", function(e) {
				require("ui/config.dialog")();
			});
			var accountMenuItem = e.menu.add({
				title : 'exit',
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
				icon : "/assets/logout.png"
			});
			accountMenuItem.window = win;
			accountMenuItem.addEventListener("click", function(e) {
				require("ui/logout.dialog")(e);
			});
			e.menu.add({
				title : 'Scan',
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
				icon : "/assets/quittung.png"
			}).addEventListener("click", require("ui/document.window"));
		};
		win.getActivity().invalidateOptionsMenu();

	};

	$.addEventListener("open", onOpenHandler);
	$.addEventListener("focus", updateUI);
	$.open();
	$.addEventListener("android:back", function(_e) {
		$.close();
		return true;
	});
};