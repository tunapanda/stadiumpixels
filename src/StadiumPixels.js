var fs = require("fs");
var PNG = require('pngjs2').PNG;
var swig = require("swig");
var webshot = require('webshot');
var async = require('async');
var Thenable = require("tinp");
var os = require("os");

function StaduimPixels() {
	this.targetWidth = 48;
	this.targetHeight = 20;

	this.imageFileNames = [];
	this.images = [];
	this.outPrefix = os.tmpdir() + "/stadiumpixels";
	this.templateFile = __dirname + "/../tpl/leaflet.tpl";
	this.maskImageFileName = null;
}

function pngReadPixelRgb(png, x, y) {
	return {
		r: png.data[(y * png.width + x) * 4],
		g: png.data[(y * png.width + x) * 4 + 1],
		b: png.data[(y * png.width + x) * 4 + 2],
	};
}

function pngReadPixelBool(png, x, y) {
	var rgb = pngReadPixelRgb(png, x, y);

	return ((rgb.r + rgb.g + rgb.b) / 3) < 128;
}

function pngIsRowUsed(png, y) {
	for (var x = 0; x < png.width; x++) {
		if (pngReadPixelBool(png, x, y))
			return true;
	}

	return false;
}

function range(numItems) {
	var res = [];

	for (var i = 0; i < numItems; i++)
		res.push(i);

	return res;
}

StaduimPixels.prototype.setMaskImageFile = function(fn) {
	this.maskImageFileName = fn;
}

StaduimPixels.prototype.addImageFile = function(fn) {
	this.imageFileNames.push(fn);
}

StaduimPixels.prototype.setOutPrefix = function(prefix) {
	this.outPrefix = prefix;
}

StaduimPixels.prototype.setTargetWidth = function(v) {
	this.targetWidth = parseInt(v);
}

StaduimPixels.prototype.setTargetHeight = function(v) {
	this.targetHeight = parseInt(v);
}

StaduimPixels.prototype.setTemplateFile = function(v) {
	this.templateFile = v;
}

StaduimPixels.prototype.generatePages = function(pages) {
	var vars = {
		pages: pages
	};

	var options = {
		siteType: 'html',
		screenSize: {
			width: 670,
			height: 870
		}
	}

	var content = swig.renderFile(this.templateFile, vars);
	console.log("Creating page " + this.pageNum);

	var doneThenable = new Thenable();

	webshot(content, this.outPrefix + this.pageNum + '.png', options,
		function(err) {
			if (err) {
				console.log(err);
				process.exit(1);
			}

			this.pageNum++;

			doneThenable.resolve();
		}.bind(this));

	return doneThenable;
}

StaduimPixels.prototype.getNumPages = function() {
	return this.pageNum;
}

StaduimPixels.prototype.getOutPrefix = function() {
	return this.outPrefix;
}

StaduimPixels.prototype.run = function() {
	this.runThenable = new Thenable();

	this.maskImage = null;

	if (this.maskImageFileName) {
		var data = fs.readFileSync(this.maskImageFileName);
		this.maskImage = PNG.sync.read(data);
	}

	var images = [];

	if (!this.outPrefix) {
		this.runThenable.reject("outPrefix needs to be specified.");
		return this.runThenable;
	}

	for (var i = 0; i < this.imageFileNames.length; i++) {
		var data = fs.readFileSync(this.imageFileNames[i]);
		var png = PNG.sync.read(data);
		/*if (png.width != this.targetWidth || png.height != this.targetHeight) {
			var e = "wrong size, expected " + this.targetWidth + "x" + this.targetHeight;
			this.runThenable.reject(e);
			return this.runThenable;
		}*/

		images.push(png);
	}

	var index = 0;
	this.pageNum = 0;
	var pages = [];
	var maxRow = 0;
	var customRows = "ABCDEFGHJKLMNPQRSTUVWXYZ";

	for (var y = 0; y < this.targetHeight; y++) {
		if (!this.maskImage || pngIsRowUsed(this.maskImage, y))
			maxRow = y;
	}

	console.log("max row: " + maxRow);

	async.eachSeries(range(this.targetHeight), function(y, yCallback) {
		var useX = 0;

		var pixelsOnRow = 0;

		for (x = 0; x < this.targetWidth; x++) {
			if (!this.maskImage || pngReadPixelBool(this.maskImage, x, y)) {
				pixelsOnRow++;
			}
		}

		console.log("row: " + String.fromCharCode(65 + (maxRow - y)) + " custom: " + customRows[maxRow - y]);

		//console.log("pixels on row: " + pixelsOnRow);

		async.eachSeries(range(this.targetWidth), function(x, xCallback) {
			var page = {};

			page.instructions = [];
			page.row = (y + 1);
			page.seat = (useX + 1);
			page.reverseSeat = (pixelsOnRow - useX);
			page.reverseRow = ((maxRow - y) + 1);
			page.reverseRowAlpha = String.fromCharCode(65 + (maxRow - y));
			page.reverseRowCustom = customRows[maxRow - y];

			for (i = 0; i < images.length; i++) {
				var image = images[i];

				page.instructions.push({
					program: (i + 1),
					value: pngReadPixelBool(image, x, y)
				});
			}

			if (!this.maskImage || pngReadPixelBool(this.maskImage, x, y)) {
				pages.push(page);

				index++;
				useX++;

				if (index == 4) {
					this.generatePages(pages).then(function() {
						index = 0;
						pages = [];
						xCallback();
					}.bind(this));
				} else {
					xCallback();
				}
			} else {
				xCallback();
			}
		}.bind(this), yCallback);
	}.bind(this), function() {
		if (pages.length) {
			this.generatePages(pages).then(function() {
				this.runThenable.resolve();
			}.bind(this));
		} else {
			this.runThenable.resolve();
		}
	}.bind(this));

	return this.runThenable;
}

module.exports = StaduimPixels;