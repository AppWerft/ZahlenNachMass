module.exports = function(event) {
	var Dialogs = require("yy.tidialogs");
	var selected = propertyKeys.filter(function(k) {
		return Ti.App.Properties.hasProperty(k)
				&& Ti.App.Properties.getBool(k, false) ? true : false;
	});
	var picker = Dialogs.createMultiPicker({
		title : "Einstellungen",
		options : propertyKeys.map(function(k) {
			return L(k);
		}),
		selected : selected.map(function(k) {
			return L(k);
		}),
		okButtonTitle : "Amen", // <-- optional
		cancelButtonTitle : "Abbruch" // <-- optional
	});
	var onClick = function(evt) {
		picker.removeEventListener("click", onClick);
		evt.result.forEach(function(res, i) {
			Ti.App.Properties.setBool(propertyKeys[i], res ? true : false);
		});
	};
	var onCancel = function(evt) {
		picker.removeEventListener("cancel", onCancel);
	};
	var onChange = function(evt) {
		console.log(evt.index + " " + evt.checked);
	};
	picker.addEventListener("click", onClick);
	picker.addEventListener("change", onChange);
	picker.addEventListener("cancel", onCancel);
	picker.show();
};