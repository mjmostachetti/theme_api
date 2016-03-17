var sass = require('node-sass'),
	fs = require('fs'),
    mkdirp = require('mkdirp'),
	express = require('express'),
    execSync = require('child_process').execSync,
    path = require('path'),
	autoprefixer = require('autoprefixer'),
	postcss = require('postcss');

execSync('rm -r public/portal || echo "nothing to clean"', { stdio : 'inherit' });


var app = express();
app.use(express.static('public'));

// http://localhost:3000/portal/styles/proschools?color1=red&color2=blue&color3=purple

app.get('/portal/styles/:customer/color1/:color1/color2/:color2/color3/:color3/style.css', function (req, res) {
	var colorsObj = req.query,
		customer = req.params.customer,
        stylesheet = `$dark : ${req.params.color1}; 
                $medium : ${req.params.color2}; 
                $light : ${req.params.color3};
                @import 'sass/style'`;
		// assuming we get all three colors

    console.log(`stylesheet: ${stylesheet}`);

	sass.render({
        data : stylesheet,
        includePaths : [ 'sass/']
	}, function(error, result) { // node-style callback from v3.0.0 onwards
		console.log('error', error);
		if(!error){
			console.log('returnging');
			postcss([ autoprefixer ]).process(result.css).then(function (postResult) {
                var filename =  path.join('public',req.path.slice(1));
				postResult.warnings().forEach(function (warn) {
					console.warn(warn.toString());
				});

				res.writeHead(200, {
					'Content-Type': 'text/css',
					'Cache-Control': 'max-age=0'
				});

				res.end(postResult.css);
                mkdirp.sync(path.dirname(filename));
                fs.writeFileSync(filename, postResult.css);
			});
		}
	});
});

app.listen(3000, function () {
	console.log('Test http://localhost:3000/portal/styles/proschools?color1=red&color2=blue&color3=purple')
});