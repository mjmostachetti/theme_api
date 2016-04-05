# Sass Theme Api Middleware
 
This [express middleware](http://expressjs.com/en/guide/using-middleware.html) allows you to create an api that returns
dynamic and custom css based on the url of the request and Sass stylesheets. Variables are included in the url, e.g.

`/urlBase/primaryColor/blue/secondaryColor/red` will pass the following sass to node-sass:

```
$primaryColor: red;
$secondaryColor: blue;
```
 
## Usage
 
This middleware must be placed upstream from your static middleware. This is to allow the middleware to check if the
sass needs to be recompiled.

## Options

* `urlBase` : string, to remove from beginning of url path that is not a var/value pair
* `publicDir` : string, absolute path to public dir where compiled css is to be stored
* `includePaths` : array of strings, absolute paths of where sass imports will look
* `beforeUrlVars` : `function(queryParams)` callback function that is passed the url query parameters that should return a string to be added to sass before url vars, e.g. default palette import
* `afterUrlVars` : `function(filename)` callback function that is passed the filename of the css file requested in the url that should return a string to be added to sass after url vars, e.g. main import

## Thanks

Heavily inspired by [node-sass-middleware](https://github.com/sass/node-sass-middleware) 
