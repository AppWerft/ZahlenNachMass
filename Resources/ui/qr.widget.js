var ldf = Ti.Platform.displayCaps.logicalDensityFactor || 1;

var Module = function(width) {
	this.width = width;
	// https://www.nayuki.io/page/qr-code-generator-library
	// https://github.com/AppWerft/TiJSPDF/blob/master/Resources/app.js
	var $ = Ti.UI.createView({
		width : width,
		height : width,
		opacity : 0.1
	});
	var canvasView = require("com.wwl.canvas").createCanvasView({
		width : width,
		height : width
	});
	$.add(canvasView);
		$.animate({
			opacity : 1.0,
		});
	function update(code) {
		var matrix = new (require('lib/de.appwerft.qrgenerator'))(code,
				[ "M" ], 5, true, false).getData();
		// canvasView.clear();
		var W = parseFloat(width / matrix.length * ldf);
		canvasView.beginPath();
		matrix.forEach(function(rowdata, y) {
			rowdata.forEach(function(point, x) {
				canvasView.fillStyle = point ? '#195797' : "#fff";
				canvasView.fillRect(x * W, y * W, W + 1, W + 1);
			});
		});
	}
	canvasView.update = update;
	return canvasView;
};
module.exports = Module;
