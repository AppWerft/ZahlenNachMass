const
VALS = [ 0, 7, 19 ];

module.exports = function(id, vat) {
	if (vat == undefined)
		vat = VALS[2];
	function onStop(e) {
		e.source.removeEventListener("stop", onStop);
		setTimeout(function() {
			e.source.addEventListener("stop", onStop);
		}, 500);
		if (e.value < 4) {
			val = VALS[0];
		} else if (e.value < 14) {
			val = VALS[1];
		} else
			val = VALS[2];
		e.source.setValue(val);
		Adapter.setVAT(id, val);
		Ti.Media.createSound({
			url : "/assets/switch.mp3"
		}).play();
	}
	function onChange(e) {

	}
	var $ = Ti.UI.createView({
		height : 50
	});
	$.slider = Titanium.UI.createSlider({
		top : 0,
		min : VALS[0],
		max : VALS[2],
		value : vat,
		width : "100%",font : {
			fontSize : 14
		}
	});
	$.add(Ti.UI.createLabel({
		left : 10,
		text : VALS[0] + "%",font : {
			fontSize : 14
		}
	}));
	$.add(Ti.UI.createLabel({
		right : 10,
		text : VALS[2] + "%",
		font : {
			fontSize : 14
		}
	}));
	$.add(Ti.UI.createLabel({
		left : "36%",
		text : VALS[1] + "%"
	}));
	$.slider.addEventListener("change", onChange);
	$.slider.addEventListener("stop", onStop);
	$.add($.slider);
	$.slider.show();
	return $;

};