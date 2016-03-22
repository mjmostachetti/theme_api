'use strict';

var sass = require('node-sass'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    express = require('express'),
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
    
    return function expressDynamicThemerMiddleware(req, res, next) {
        var pathName= req.path,
            sassRoot = options.sassRoot || function() {
                throw new Error('You must define options.sassRoot to use the sass-theme-api-middleware')
            };

        if (path.extname(pathName) === '.css') {
            var sassVars = _getScssVariables(pathName),
                filename = path.basename(pathName, '.css'),
                stylesheet = `${ sassVars } @import '${ sassRoot }/${ filename }'`;

            sass.render({
                data : stylesheet,
                includePaths : [ 'sass/']
            }, function(error, result) {
                if(!error){
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

                        // cache file
                        mkdirp.sync(path.dirname(filename));
                        fs.writeFileSync(filename, postResult.css);
                    });
                }
            });
        } else {
            next();
        }
    };
}

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