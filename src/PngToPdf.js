var qsub = require("qsub");
var Thenable = require("tinp");
var async = require("async");

function range(numItems) {
	var res = [];

	for (var i = 0; i < numItems; i++)
		res.push(i);

	return res;
}

function PngToPdf() {
	this.numImages = 0;
	this.outputFileName = "out.pdf";
	this.prefix = "";
}

module.exports = PngToPdf;

PngToPdf.prototype.setPrefix = function(prefix) {
	this.prefix = prefix;
}

PngToPdf.prototype.setNumImages = function(numImages) {
	this.numImages = numImages;
}

PngToPdf.prototype.setOutputFileName = function(outputFileName) {
	this.outputFileName = outputFileName;
}

PngToPdf.prototype.run = function() {
	this.runThenable = new Thenable();

	async.eachSeries(range(this.numImages), function(index, cb) {
		var sub = qsub("convert")
		sub.arg(this.prefix + index + ".png");
		sub.arg(this.prefix + index + ".pdf");
		sub.show();
		sub.expect(0);
		sub.run().then(cb, function(e) {
			console.log(e);
			this.runThenable.reject(e)
		}.bind(this));
	}.bind(this), function() {
		var sub = qsub("pdftk");

		for (var i = 0; i < this.numImages; i++)
			sub.arg(this.prefix + i + ".pdf");

		sub.arg("output");
		sub.arg(this.outputFileName);
		sub.show();
		sub.expect(0);

		sub.run().then(this.runThenable.resolve);
	}.bind(this));

	return this.runThenable;
}