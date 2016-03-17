var thematic = require('sass-thematic');

var fun = thematic.renderCSSSync({
	file: 'sass/style.scss',
	varsFile: 'sass/_theme.scss',
	themeData: '$color1: red;'
}, function(err, cssString) {
	console.log(cssString);
});

console.log(fun);