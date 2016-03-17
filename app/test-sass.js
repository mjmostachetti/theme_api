var sass = require('node-sass'),
	fs = require('fs'),
	express = require('express'),
	autoprefixer = require('autoprefixer'),
	postcss = require('postcss');

var app = express();

// http://localhost:3000/portal/styles/proschools?color1=red&color2=blue&color3=purple

app.get('/portal/styles/:customer', function (req) {
	var colorsObj = req.query,
		customer = req.params.customer,
		// assuming we get all three colors
		sassVariables = `$dark : ${colorsObj.color1}; \n$medium : ${colorsObj.color2} ; \n$light : ${colorsObj.color1};\n`,
		// get main scss file
		stylesheet = fs.readFileSync('sass/style.scss', { encoding : 'utf8' }),
		// concat variables to main
		concatVariablesWithStylesheet = sassVariables + stylesheet;

	// append the string to an empty scss file
	fs.appendFileSync('sass/output.scss', concatVariablesWithStylesheet);

	sass.render({
		file : 'sass/output.scss'
	}, function(error, result) { // node-style callback from v3.0.0 onwards
		if(!error){
			postcss([ autoprefixer ]).process(result.css).then(function (postResult) {
				postResult.warnings().forEach(function (warn) {
					console.warn(warn.toString());
				});
				console.log(postResult.css);
				// No errors during the compilation, write this result on the disk
				fs.writeFile(customer + '.css', postResult.css, function(err){
					if(!err){
						//file written on disk
					}
				});
			});
		}
	});
});

app.listen(3000, function () {
	console.log('Test http://localhost:3000/portal/styles/proschools?color1=red&color2=blue&color3=purple')
});