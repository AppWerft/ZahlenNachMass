var Moment = require("lib/moment");
Moment.locale('de');
var Adapter = require("model/index");

module.exports = function(id, cdateM, callback) {
	var date = cdateM ? cdateM.toDate() : Moment().toDate();
	console.log(cdateM);
	var picker = Ti.UI.createPicker({
		type : Ti.UI.PICKER_TYPE_DATE,
		minDate : new Date(2009, 0, 1),
		maxDate : Moment().toDate(),
		value : date,
		locale : 'de-DE'
	});
	picker.showDatePickerDialog({
		value : date,
		callback : function(e) {
			if (!e.cancel) {
				var cdateM = Moment(e.value);
				Adapter.setDate(id,cdateM.format()); // iso format
				callback(cdateM);
			}
		}
	});
};