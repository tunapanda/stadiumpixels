#!/usr/bin/env node

var fs = require("fs");
var PNG = require('pngjs2').PNG;
var minimist = require("minimist");
var swig = require("swig");
var webshot = require('webshot');
var async = require('async');

function pngReadPixelRgb(png, x, y) {
	return {
		r: png.data[(y * png.width + x) * 4],
		g: png.data[(y * png.width + x) * 4 + 1],
		b: png.data[(y * png.width + x) * 4 + 2],
	};
}

function pngReadPixelBool(png, x, y) {
	var rgb = pngReadPixelRgb(png, x, y);

	return ((rgb.r + rgb.g + rgb.b) / 3) > 127;
}

function range(numItems) {
	var res = [];

	for (var i = 0; i < numItems; i++)
		res.push(i);

	return res;
}

var targetWidth = 48;
var targetHeight = 20;
var argv = minimist(process.argv.slice(2));

if (!argv._.length) {
	console.log("Usage: stadiumpixels <files...>");
	process.exit(1);
}

var images = [];

for (var i = 0; i < argv._.length; i++) {
	var data = fs.readFileSync(argv._[i]);
	var png = PNG.sync.read(data);
	if (png.width != targetWidth || png.height != targetHeight) {
		console.log("wrong size, expected " + targetWidth + "x" + targetHeight);
		process.exit(1);
	}

	images.push(png);
}

var outPrefix = "out/test";
var templateFile = "tpl/leaflet.tpl";
var index = 0;
var pageNum = 0;
var vars = {
	pages: []
};

async.eachSeries(range(targetHeight), function(y, yCallback) {

	async.eachSeries(range(targetWidth), function(x, xCallback) {
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

			var content = swig.renderFile(templateFile, vars);
			console.log("creating page " + pageNum);

			webshot(content, outPrefix + pageNum + '.png', options,
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
	}, yCallback);
});

/*for (y = 0; y < targetHeight; y++) {
	for (x = 0; x < targetWidth; x++) {
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
			console.log("rendering " + index);

			var options = {
				siteType: 'html',
				screenSize: {
					width: 670,
					height: 870
				}
			}

			var content = swig.renderFile(templateFile, vars);
			webshot(content, outPrefix + '0' + '.png', options,
				function(err) {
					process.exit(0);
				});
		}
	}
}*/