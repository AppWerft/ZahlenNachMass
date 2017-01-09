module.exports = function(set) {
	var $ = Ti.UI.createTableViewRow({
		height : 90,
		id : set.id
	});
	$.add(Ti.UI.createView({
		left : 0,
		top : 0,
		width : 90,
		touchEnabled : false,
		transform : Ti.UI.create2DMatrix({
			rotate : 90
		}),
		backgroundImage : set.thumb,
		height : 90
	}));
	$.add(Ti.UI.createImageView({
		left : 100,
		visible : set.done,
		bottom : 5,
		width : 30,
		
		image : "/assets/done.png",
		touchEnabled : false,
	}));

	$.add(Ti.UI.createLabel({
		right : 20,
		left : 100,
		width : Ti.UI.FILL,
		color : "#333",
		textAlign : "right",
		text : set.amount + "€",
		top : 5,
		touchEnabled : false,
		font : {
			fontSize : 30,
			fontWeight : "bold"
		},
	}));
	$.add(Ti.UI.createLabel({
		right : 20,
		left : 100,
		color : "#333",
		width : Ti.UI.FILL,
		textAlign : "right",
		touchEnabled : false,
		text :set.cdateLL,
		bottom : 5,
		font : {
			fontSize : 20,
			fontWeight : "bold"
		},
	}));
	return $;
};