/**  Declare constant port 8000, used later to dictate which port to listen to (8000 because required by goker)*/
const port = 8000; 

/** Require the express module and put it in a constant*/
const express = require('express')

/** Require the body-parser module and put it in a constant, */
const bodyParser = require('body-parser')

/** Require the path module and put it in a constant, the path module is used to handle and transform files paths */
const path = require('path')

/** Calls the express function "express()" and puts new Express application inside the app variable (to start a new Express application) */
const app = express()

/** app-use loads a function to be used as middleware. 
 *  express.static() is a function that takes a path, and returns a middleware that give access all files in that path 
 *  will serve all files inside of the 'static' directory, and have them accessible through /static 
 * kind of redirect from /static to the physical (and long) path */
app.use('/static', express.static(path.join(__dirname, 'static')))

/** 
 * bodyparser extracts the entire body portion of an incoming request stream and exposes it on req.body as something easier to interface with
 * bodyParser.json allow to support parsing of application/json type post data, it parses the text as JSON and exposes the resulting object on req.body
*/
app.use(bodyParser.json({limit: '500mb'}))

/** Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST) 
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}))

/** app.use loads a function to be used as middleware. 
 * intercept every request and modify the request header to allow cors (cross origin resurce sharing)
 * then proceed to the next middelware
*/
app.use(function(req,res,next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
  next();
});
/**
 * app.get handle all the GET requests and route them vy using the middelware function(req,res)
 * sendFile transfers the file at the given path, sets the Content-Type response HTTP header field based on the filename’s extension. 
 * Unless the root option is set in the options object, path must be an absolute path to the file because is indipendent from express.static
 */
app.get('/*', function(req,res) {
  if(req.path == '/' || req.path == '/browser.html' || req.path == '/browser'){
    res.sendFile(path.join(__dirname, 'browser.html'))
  }
  else if(req.path == '/editor.html' || req.path == '/editor' ){
    res.sendFile(path.join(__dirname, 'editor.html')) 
  } else {
    res.sendFile(path.join(__dirname, 'browser.html'))
  }
})
/**
 * Listen for connections on port 8000.
 */
app.listen(port, ()=>{
  console.log(`Running on port ${port}`);
});











