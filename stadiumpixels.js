#!/usr/bin/env node

var fs = require("fs");
var PNG = require('pngjs2').PNG;
var minimist = require("minimist");
var swig = require("swig");
var webshot = require('webshot');

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

var outPrefix = "test";
var templateFile = "tpl/leaflet.tpl";
var index = 0;

var vars = {};
vars.pages = [];

for (y = 0; y < targetHeight; y++) {
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
}
/*console.log(pngReadPixelBool(png, 19, 4));
console.log(pngReadPixelBool(png, 5, 5));*/