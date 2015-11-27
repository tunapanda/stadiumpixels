stadiumpixels
=============

Generate leaflets for human pixels in a stadium.

Installation
------------

```
npm install -g stadiumpixels
```

Usage
-----

```
stadiumpixels - Generate leaflets for human pixels in a stadium.

Usage:
  stadiumpixels [options] <files...>

Note, the input files must match the targetWidth and targetHeight exactly!

Options:
  --outPrefix=<prefix>      - Specify out prefix for generated files.
  --targetWidth=<width>     - Seats per row in the stadium.
  --targetHeight=<height>   - Rows in the stadium.
  --templateFile=<file>     - Swig template for generating leaflets.
  --mask=<file>             - Seat mask.
  --combine=<file.pdf>      - Combine all pages to a pdf.
```
