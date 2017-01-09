var IF = require("ti.imagefactory");
const
DB = "DB3", FOLDER = "receiptcache", THUMB = "thumb.png";
var counter = 0;

var link = Ti.Database.open(DB);
if (link) {
	link
			.execute('CREATE TABLE IF NOT EXISTS "receipts" ("id" INTEGER UNIQUE, "amount" TEXT, "comment" TEXT, "cdate" TEXT, "done" INTEGER,"category" INTEGER,"saved" INTEGER,"vat" INTEGER);');
	link.close();
}

var DEPOT = Ti.Filesystem.applicationDataDirectory;
var folder = Ti.Filesystem.getFile(DEPOT, FOLDER);
if (!folder.exists()) {
	folder.createDirectory();
}

// default of configKeys:
propertyKeys.forEach(function(k) {
	if (!Ti.App.Properties.hasProperty(k))
		Ti.App.Properties.setBool(k, true);
});

function createThumb(id) {
	var file = Ti.Filesystem.getFile(DEPOT, FOLDER, id);
	var thumb = Ti.Filesystem.getFile(DEPOT, FOLDER, id + THUMB);
	if (!thumb.exists()) {
		var thumbBlob = IF.imageAsThumbnail(file.read(), {
			size : 90,
			format : IF.PNG
		});
		thumb.write(thumbBlob);
		// https://github.com/ricardoalcocer/AndroidRotateImage
		/*
		 * if (Ti.Platform.osname == "android")
		 * require("fh.imagefactory").rotateResizeImage(thumb.nativePath, 100,
		 * 80);
		 */
	}
	return thumb;
}
function setImage(id, fooBlob) {
	var foo = Ti.Filesystem.getFile(DEPOT, FOLDER, id);
	foo.write(fooBlob); // for getting dimensions
	console.log("WIDTH=" + fooBlob.getWidth() + "x" + fooBlob.getHeight());
	return;
	var barBlob = IF.imageAsResized(fooBlob, {
		width : fooBlob.getWidth() / 2,
		height : fooBlob.getHeight() / 2,
		format : IF.PNG
	});
	Ti.Filesystem.getFile(DEPOT, FOLDER, id).write(barBlob);
}

var Module = {
	createReceipt : function(data) {
		var link = Ti.Database.open(DB);
		if (data.image && data.id) {
			setImage(data.id, data.image);
			createThumb(data.id);
		}
		link.execute('INSERT INTO receipts VALUES (?,?,?, ?,?,?,?,?)', //
		data.id, //
		data.amount || "0", // 
		data.comment || "", // 
		data.cdate || "", // 
		0, // 
		0,//
		0, 19);

		link.close();
	},
	setAmount : function(id, amount) {
		var link = Ti.Database.open(DB);
		var res = link.execute('UPDATE receipts SET amount=? WHERE id=?',
				amount, id);
		link.close();
	},
	setDone : function(id, done) {
		var link = Ti.Database.open(DB);
		console.log("done=" + done);
		var res = link.execute('UPDATE receipts SET done=? WHERE id=?',
				done ? 1 : 0, id);
		link.close();
	},
	setVAT : function(id, value) {
		var link = Ti.Database.open(DB);
		var res = link.execute('UPDATE receipts SET vat=? WHERE id=?', value,
				id);
		link.close();
	},
	setDate : function(id, cdate) {
		if (cdate && id) {
			var link = Ti.Database.open(DB);
			var res = link.execute('UPDATE receipts SET cdate=? WHERE id=?',
					cdate, id);
			link.close();
		}
	},
	listReceipts : function() {
		var link = Ti.Database.open(DB);
		var done = Ti.App.Properties.getBool("DELETEAFTER") ? " WHERE done=0 "
				: "";
		var res = link
				.execute('SELECT * from receipts "+done+" ORDER BY id DESC');
		var list = [];
		while (res.isValidRow()) {
			var id = res.getFieldByName('id');
			var thumb = createThumb(id);
			var image = Ti.Filesystem.getFile(DEPOT, FOLDER, id);
			list.push({
				done : (res.getFieldByName('done') == 1) ? true : false,
				amount : res.getFieldByName('amount'),
				cdateLL : Moment(res.getFieldByName('cdate')).format("LL"),
				cdateM : Moment(res.getFieldByName('cdate')),
				id : res.getFieldByName('id'),
				vat : res.getFieldByName('vat'),
				thumb : thumb.nativePath,
				size : image.getSize()
			});
			res.next();
		}
		res.close();
		link.close();
		return list;
	},
	getReceipt : function(id) {
		if (!id)
			return null;
		var link = Ti.Database.open(DB);
		var res = link.execute('SELECT * from receipts WHERE id=?', id);
		var bar = {};
		var found = false;
		if (res.isValidRow()) {
			var image = Ti.Filesystem.getFile(DEPOT, FOLDER, id);
			found = true;
			bar = {
				done : (res.getFieldByName('done') == 1) ? true : false,
				id : res.getFieldByName('id'),
				amount : res.getFieldByName('amount'),
				cdateLL : Moment(res.getFieldByName('cdate')).format("LL"),
				cdateM : Moment(res.getFieldByName('cdate')),
				vat : res.getFieldByName('vat'),
				image : image.read(),
				account : Ti.App.Properties.getString("ACCOUNT"),
				size : image.getSize()
			};
		}
		res.close();
		link.close();
		return found ? bar : null;
	},
	deleteReceipt : function(id) {
		console.log("id for deleting=" + id);
		if (!id)
			return null;
		var link = Ti.Database.open(DB);
		var res = link.execute('DELETE  from receipts WHERE id=?', id);
		link.close();
		var file = Ti.Filesystem.getFile(DEPOT, FOLDER, id);
		var thumb = Ti.Filesystem.getFile(DEPOT, FOLDER, id + THUMB);
		thumb.deleteFile();
		file.deleteFile();
		file = null;
	},
	uploadReceipt : function(id, callbacks) {
		console.log("counter=" + (counter++) + "     id=" + id);
		var payload = Module.getReceipt(id);
		payload.hash = Ti.Utils.md5HexDigest("" + Math.random());
		payload.counter = counter;
		var start = new Date().getTime();
		var lastprogress = 0;
		var xhr = Ti.Network.createHTTPClient({
			onload : function(e) {
				var end = new Date().getTime();
				try {
					var json = JSON.parse(this.responseText);
					json.duration = end - start;
					callbacks.onload(json);
				} catch (e) {
					console.log("json error");
				}
			},
			onerror : function(err) {
				console.log(err);
			},
			onreadystatechange : function(e) {
				switch (this.readyState) {
				case 0:
					// after HTTPClient declared, prior to open()
					// though Ti won't actually report on this readyState
					Ti.API.info('case 0, readyState = ' + this.readyState);
					break;
				case 1:
					// open() has been called, now is the time to set headers
					Ti.API.info('case 1, readyState = ' + this.readyState);
					break;
				case 2:
					// headers received, xhr.status should be available now
					Ti.API.info('case 2, readyState = ' + this.readyState);
					break;
				case 3:
					// data is being received, onsendstream/ondatastream being
					// called now
					Ti.API.info('case 3, readyState = ' + this.readyState);
					break;
				case 4:
					// done, onload or onerror should be called now
					Ti.API.info('case 4, readyState = ' + this.readyState);
					break;
				}
			},
			onsendstream : function(e) {
				var floor = Math.floor(e.progress * 100);
				if (floor > lastprogress) {
					lastprogress = floor;
					callbacks.onprogress(floor);
				}
			}
		});
		xhr.open("POST", "http://tools.webmasterei.com/zahlennachmass/?" + "_="
				+ payload.hash.substr(0, 4) + "_&amount=" + payload.amount);
		xhr.send(payload);
		callbacks.onprogress(lastprogress);
		return xhr;
	}
};
module.exports = Module;