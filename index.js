'use strict';

var sass = require('node-sass'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    autoprefixer = require('autoprefixer'),
    postcss = require('postcss');

module.exports = expressDynamicThemer;

/**
 * Express middleware to dynamically create stylesheets based on variables in the url.
 * @param options
 *      *  publicDir - the directory to write the compiled css to
 *      *  includePaths - array of dirs to pass to node-sass
 *      *  urlBase - base of path to remove from url that is not meant to be a sass variable name/value pair
 *      *  beforeUrlVars - function to pass themer to add sass before the url vars
 *      *  afterUrlVars - function to pass themer to add sass after the url vars
 * @returns {expressDynamicThemerMiddleware}
 */
function expressDynamicThemer(options) {
    
    return function expressDynamicThemerMiddleware(req, res, next) {
        var pathName = req.path,
            publicDir = options.publicDir || '',
            includePaths = options.includePaths || [],
            urlBase = options.urlBase || '';

        if (path.extname(pathName) === '.css') {
            var beforeUrlVars = options.beforeUrlVars ? options.beforeUrlVars(req.query) : '',
                filename = path.basename(pathName, '.css'),
                afterUrlVars = options.afterUrlVars ? options.afterUrlVars(filename) : '';

            sass.render({
                data : beforeUrlVars + _getScssVariables(pathName) + afterUrlVars,
                includePaths : includePaths
            }, function(error, result) {
                if (error) {
                    res.end('sass compile error: ' + error);
                } else {
                    postcss([ autoprefixer ]).process(result.css)
                        .then(function(postResult) {
                            var filename =  path.join(publicDir,pathName.slice(1));
    
                            postResult.warnings().forEach(function(warn) {
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

        function _getScssVariables(pathString) {
            var string = '',
                name = true;

            pathString = path.dirname(pathString);
            pathString = pathString.replace(urlBase, '').replace(/^\//,'');

            if (pathString) {
                pathString.split('/').forEach(function(part) {
                    if (name) {
                        string += `$${ part } : `;
                    } else {
                        string += `${ decodeURIComponent(part) };\n`;
                    }
                    name = !name;
                });
            }

            return string;
        }
    };
}

