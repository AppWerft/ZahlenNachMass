module.exports = function() {
	var opts = {
		title : 'Konto'
	};
	if (Ti.Android) {
		opts.buttonNames = [ 'Konto ausloggen', 'Abbruch' ];
	} else {
		opts.options = [ 'Confirm', 'Help', 'Cancel' ];
	}
	var dialog = Ti.UI.createOptionDialog(opts);
	dialog.addEventListener("click", function(e) {
		if (e.index == 0) {
			Ti.App.Properties.removeProperty("ACCOUNT");
			Ti.App.Properties.removeProperty("FINGERPRINT	");
			require("ui/activating.window")(require("ui/list.window"));
			e.source.window.close();
		}
	});
	dialog.show();
};