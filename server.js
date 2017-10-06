// See LICENSE.MD for license information.

'use strict';

/********************************
Dependencies
********************************/
var express = require('express'),// server middleware
    bodyParser = require('body-parser'),// parse HTTP requests
    expressValidator = require('express-validator'), // validation tool for processing user input
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    https = require('http'),
    cfenv = require('cfenv'),// Cloud Foundry Environment Variables
    appEnv = cfenv.getAppEnv(),// Grab environment variables
    User = require('./server/models/user.model'),
    uuid = require('node-uuid'),
    request = require('request'),
    dbOps = require('./server/routes/dbOperation.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(expressValidator()); // must go directly after bodyParser

if(appEnv.isLocal){
    require('dotenv').load();// Loads .env file into environment
}

app.enable('trust proxy');
// Use SSL connection provided by Bluemix. No setup required besides redirecting all HTTP requests to HTTPS
if (!appEnv.isLocal) {
    app.use(function (req, res, next) {
        if (req.secure) // returns true is protocol = https
            next();
        else
            res.redirect('https://' + req.headers.host + req.url);
    });
}
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'this_is_a_default_session_secret_in_case_one_is_not_defined',
    resave: true, /*
    store: new MongoStore({
        url: sessionDB,
        autoReconnect: true
    }),*/
    saveUninitialized : false,
    cookie: { secure: true }
}));

/********************************
 Routing
 ********************************/

// Home
app.get('/', function (req, res){
    res.sendfile('index.html');
});

app.get('/getUUID', function (req, res){
    res.send(uuid.v4());
});

// Home
app.get('/query/dropdowns', dbOps.dropdowns());
app.get('/query/codes', dbOps.codes());

app.post('/update/addimportcode', dbOps.addimportcode());


app.post('/create',function (req, res) {
  console.log(JSON.stringify(req.body));
  console.log(JSON.stringify(req.headers));
  console.log(JSON.stringify('Z~~~~~~~~~~'+req.headers.userid));
  request.post({
    headers: {'content-type' : 'application/json',
              'X-User-Id' : req.headers.userid
    },
    url:     'http://184.173.1.19:30055/v1/declaration/submit'+"?action="+req.headers.action,
    body:    JSON.stringify(req.body),
      }, function(error, response, body){
        res.end(JSON.stringify(response));
      });
});

app.put('/statusupdate',function (req, res) {
  console.log(JSON.stringify(req.body));
  console.log(JSON.stringify(req.headers));
  request.put({
    headers: {'content-type' : 'application/json'},
    url:     'http://184.173.1.19:30055/v1/declaration/status/'+req.headers.caseid+"?status="+req.headers.status,
    body:    JSON.stringify(req.body),
      }, function(error, response, body){
        res.end(JSON.stringify(response));
      });
});

app.post('/srupdate',function (req, res) {
  console.log(JSON.stringify(req.body));
  console.log(JSON.stringify(req.headers));
  request.post({
    headers: {'content-type' : 'application/json'},
    url:     'http://184.173.1.19:30055/v1/ServiceRequest',
    body:    JSON.stringify(req.body),
      }, function(error, response, body){
        res.end(JSON.stringify(response));
      });
});


app.get('/track',function (req, res) {
  //var propertiesObject = {agent_id:req.headers.agentId, role:agent_id:req.headers.role};
  console.log(JSON.stringify(req.headers));
  console.log(JSON.stringify(req.headers.agentid));
  console.log(JSON.stringify(req.headers.role));
  request.get({
    headers: {'content-type' : 'application/json'},
    url:     'https://api.au.apiconnect.ibmcloud.com/senthilkumardinibmcom-dev/sb/v1/declaration/list'+'?agent_id='+req.headers.agentid+'&role='+req.headers.role}, function(error, response, body){
    //url:     'http://184.173.1.19:30055/v1/declaration/list'+'?agent_id="'+req.headers.agentid+'"&role="'+req.headers.role+'"'}, function(error, response, body){
        console.log(JSON.stringify(response));
        res.end(JSON.stringify(response));
      });
});

app.get('/caseview',function (req, res) {
  //var propertiesObject = {agent_id:req.headers.agentId, role:agent_id:req.headers.role};
  console.log(JSON.stringify(req.headers));
  console.log(JSON.stringify(req.headers.caseid));
  request.get({
    headers: {'content-type' : 'application/json'},
    url:     'http://173.193.102.125:30081/v1/declaration/'+req.headers.caseid+'?caseType="declaration"'}, function(error, response, body){
        console.log(JSON.stringify(response));
        res.end(JSON.stringify(response));
      });
});

app.get('/comments',function (req, res) {
  //var propertiesObject = {agent_id:req.headers.agentId, role:agent_id:req.headers.role};
  console.log(JSON.stringify(req.headers));
  console.log(JSON.stringify(req.headers.caseid));
  request.get({
    headers: {'content-type' : 'application/json'},
    url:     'https://api.au.apiconnect.ibmcloud.com/senthilkumardinibmcom-dev/sb/v1/declaration/observations?caseId='+req.headers.caseid}, function(error, response, body){
        console.log(JSON.stringify(response));
        res.end(JSON.stringify(response));
      });
});

app.post('/ChangeStatus',function (req, res) {
  request.post({
    headers: {'content-type' : 'application/json'},
    url:     'http://184.173.1.19:30055/v1/declaration/submit', //Update change status URL zac TBD
    body:    JSON.stringify(req.body),
      }, function(error, response, body){
        res.end(JSON.stringify(response));
      });
});


// login
app.get('/userlogin', function (req, res){performRequest(req.headers, function(data){
    res.status(200).send(JSON.stringify(data));
  })
});

function performRequest(data, success) {
  //dbOps.getRestParms(data.cat_type,data.func_type);
  var options = {
    host : '184.173.1.19',
    port : 30882,
    path : '/caps/login/validate',
    method : 'GET',
    headers : {'userid':data.username,
               'password':data.password}
             };
  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');
    var responseString = '';
    res.on('data', function(data) {
      responseString += data;
    });
    res.on('end', function() {
      var responseObject = JSON.parse(responseString);
      success(responseObject);
    });
  });
  req.write('ok');
  req.end();
}


// Account logout
app.get('/logout', function(req,res){

    // Destroys user's session
    if (!req.user)
        res.status(400).send('User not logged in.');
    else {
        req.session.destroy(function(err) {
            if(err){
                res.status(500).send('Sorry. Server error in logout process.');
                console.log("Error destroying session: " + err);
                return;
            }
            res.status(200).send('Success logging user out!');
        });
    }
});

// Custom middleware to check if user is logged-in
function authorizeRequest(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.status(401).send('Unauthorized. Please login.');
    }
}

// Protected route requiring authorization to access.
app.get('/protected', authorizeRequest, function(req, res){
    res.send("This is a protected route only visible to authenticated users.");
});

/********************************
Ports
********************************/
app.listen(appEnv.port, appEnv.bind, function() {
  console.log("Node server running on " + appEnv.url);
});
