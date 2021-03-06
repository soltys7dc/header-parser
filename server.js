'use strict';

const fs = require('fs');
const express = require('express');
const app = express();
const langParser = require('accept-language-parser');

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })

app.route('/api/whoami')
    .get((req,res) => {
      const ipRegexp = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
      const uaRegexp = /\(([^)]+)\)/;
      let ip = req.ip.match(ipRegexp)[0];
      let software =  req.headers['user-agent'].match(uaRegexp)[1];
      let language = langParser.parse(req.headers['accept-language'])[0].code;
      let response = {"ipaddress": ip, "language": language, "software": software};
      res.json(response);
    });

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

