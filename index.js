var sass = require('node-sass'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    express = require('express'),
    execSync = require('child_process').execSync,
    path = require('path'),
    autoprefixer = require('autoprefixer'),
    postcss = require('postcss');

module.exports = expressDynamicThemer;

/**
 * Express middleware to dynamically create stylesheets based on variables in the url.
 * @param options
 *      *  sassRoot - the directory the file referenced in the url will be searched for
 *      *  [any sass options to pass through] - options passed through to sass - (data is created dynamically by the middleware)
 * @returns {expressDynamicThemerMiddleware}
 */
function expressDynamicThemer(options) {
    // assumtions
    // User has allready added the static middleware
    // scss main file names mirror the requested styles file names

    return function expressDynamicThemerMiddleware(req, res, next) {

        var pathName= req.path,
            sassRoot = options.sassRoot || function() {
                    throw new Error('You must define options.sassRoot to use the sass-theme-api-middleware')
                };

        if(path.extname(pathName) === '.css') {
            var sassVars = _getScssVariables(pathName),
                filename = path.basename(pathName, '.css'),
                stylesheet = `${ sassVars } @import '${ sassRoot }/${ filename }'`;
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

                        // TODO: figure out where to write this if incoming url has %23, etc in it
                        fs.writeFileSync(filename, postResult.css);
                    });
                }
            });
        } else {
            next();
        }
        // is file a css file?
        // look at route, build obj from key value scss var pairs
        // using the path besides the actual file name, using options.basePath and the final stylesheet name / extension.
        // run scss like normal.
    };

    function _getScssVariables(pathString) {
        var string = '',
            name = true,
            pathArray;

        pathString = path.dirname(pathString);
        pathString = pathString.replace(options.basePath, '').replace(/^\//,'');
        pathArray = pathString.split('/');

        pathArray.forEach(function(part) {
            if (name) {
                string += `$${ part } : `;
            } else {
                console.log('decoded', decodeURIComponent(part));
                string += `${ decodeURIComponent(part) };\n`;
            }
            name = !name;
        });

        return string;
    }
}




app.listen(3000, function () {
    console.log('Test http://localhost:3000/portal/styles/proschools?color1=red&color2=blue&color3=purple')
});

// http://localhost:3000/portal/styles/proschools?color1=red&color2=blue&color3=purple
return;
app.get('/portal/styles/:customer/color1/:color1/color2/:color2/color3/:color3/style.css', function (req, res) {


});

