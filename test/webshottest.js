var webshot = require('webshot');

webshot('<html><body>Hello World</body></html>', 'hello_world.png', {siteType:'html'}, function(err) {
  // screenshot now saved to hello_world.png
});