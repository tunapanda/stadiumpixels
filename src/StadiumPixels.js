var fs = require("fs");
var PNG = require('pngjs2').PNG;
var swig = require("swig");
var webshot = require('webshot');
var async = require('async');
var Thenable = require("tinp");

function StaduimPixels() {
	this.targetWidth = 48;
	this.targetHeight = 20;

	this.imageFileNames = [];
	this.images = [];
	this.outPrefix = null; //"out/test";
	this.templateFile = __dirname + "/../tpl/leaflet.tpl";
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

function range(numItems) {
	var res = [];

	for (var i = 0; i < numItems; i++)
		res.push(i);

	return res;
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

StaduimPixels.prototype.run = function() {
	this.runThenable = new Thenable();

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
	var pageNum = 0;
	var vars = {
		pages: []
	};

	async.eachSeries(range(this.targetHeight), function(y, yCallback) {
		async.eachSeries(range(this.targetWidth), function(x, xCallback) {
			var page = {};

			page.instructions = [];
			page.row = (y + 1);
			page.seat = (x + 1);

			for (i = 0; i < images.length; i++) {
				var image = images[i];

				page.instructions.push({
					program: (i + 1),
					value: pngReadPixelBool(image, x, y)
				});
			}

			vars.pages.push(page);

			index++;

			if (index == 4) {
				var options = {
					siteType: 'html',
					screenSize: {
						width: 670,
						height: 870
					}
				}

				var content = swig.renderFile(this.templateFile, vars);
				console.log("creating page " + pageNum);

				webshot(content, this.outPrefix + pageNum + '.png', options,
					function(err) {
						if (err)
							console.log(err);

						index = 0;
						pageNum++;
						vars = {
							pages: []
						};
						xCallback();
					});
			} else {
				xCallback();
			}
		}.bind(this), yCallback);
	}.bind(this), this.runThenable.resolve.bind(this.runThenable));

	return this.runThenable;
}

module.exports = StaduimPixels;