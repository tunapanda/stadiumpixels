#!/usr/bin/env node

function usage() {
	console.log("stadiumpixels - Generate leaflets for human pixels in a stadium.");
	console.log("");
	console.log("Usage:");
	console.log("  stadiumpixels [options] <files...>");
	console.log("");
	console.log("Options:");
	console.log("  --outPrefix=<prefix>      - Specify out prefix for generated files.");
	console.log("  --targetWidth=<width>     - Seats per row in the stadium.");
	console.log("  --targetHeight=<height>   - Rows in the stadium.");
	console.log("  --templateFile=<file>     - Swig template for generating leaflets.");
	console.log("  --mask=<file>             - Seat mask.")
	process.exit(1);
}

var minimist = require("minimist");
var StadiumPixels = require("../src/StadiumPixels");

var argv = minimist(process.argv.slice(2));

if (!argv._.length) {
	console.log("Usage: stadiumpixels <files...>");
	process.exit(1);
}

var stadiumPixels = new StadiumPixels();

for (k in argv) {
	var v = argv[k];

	switch (k) {
		case "outPrefix":
			stadiumPixels.setOutPrefix(v);
			break;

		case "targetWidth":
			stadiumPixels.setTargetWidth(v);
			break;

		case "targetHeight":
			stadiumPixels.setTargetHeight(v);
			break;

		case "templateFile":
			stadiumPixels.setTemplateFile(v);
			break;

		case "_":
			break;

		default:
			console.log("Unknown option: " + k);
			process.exit(1);
			return;
	}
}

for (var i = 0; i < argv._.length; i++)
	stadiumPixels.addImageFile(argv._[i]);

stadiumPixels.run().then(function() {
	console.log("Complete!");
}, function(e) {
	console.log(e);
	process.exit(1);
});