# Sass Theme Api Middleware
 
This [express middleware](http://expressjs.com/en/guide/using-middleware.html) allows you to create an api that returns
 dynamic and custom css based on the url of the request and Sass stylesheets. Variables are included in the url.
 
## Usage
 
This middleware must be placed upstream from your static middleware. This is to allow the middleware to checke if the
sass needs to be recompiled.

## Thanks

Heavily inspired by [node-sass-middleware](https://github.com/sass/node-sass-middleware) 
