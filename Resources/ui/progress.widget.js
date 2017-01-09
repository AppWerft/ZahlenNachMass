var ldf = Ti.Platform.displayCaps.logicalDensityFactor || 1;


var Module = function(options, callbacks) {
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
		opacity : 0.99,
		backgroundImage : "/assets/bb.png"
	}));
	var container = Ti.UI.createView({
		width : 240,
		height : 240
	});
	$.add(container);
	$.init = function() {
		$.progressView = require('de.appwerft.waterwaveprogress').createView({
			showWater : true,
			touchEnabled : false,
			waterColor : "#195797",
			waterBgColor : "#55000A4A",
			showRing : true,
			ringWidth : 20,
			ring2WaterWidth : 10,
			ringColor : "#5593D3",
			maxProgress : 100.0,
			ringBgColor : "#0fff",
			showNumerical : true,
			fontSize : 40*ldf,
			textColor : "#fff",
		});
		container.add($.progressView);
		$.open();
	};
	$.update = function(progress) {
		$.progressView.setProgress(progress * 100);
	};
	return $;
};

module.exports = Module;