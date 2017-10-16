// See LICENSE.MD for license information.

'use strict';

/********************************
Dependencies
********************************/
var express = require('express'),// server middleware
    bodyParser = require('body-parser'),// parse HTTP requests
    expressValidator = require('express-validator'), // validation tool for processing user input
    cookieParser = require('cookie-parser'),
    bcrypt = require('bcrypt'),
    session = require('express-session'),
    https = require('http'),
    cfenv = require('cfenv'),// Cloud Foundry Environment Variables
    appEnv = cfenv.getAppEnv(),// Grab environment variables
    request = require('request'),
    dbOps = require('./server/routes/dbOperation.js'),
    mysql = require('mysql');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(expressValidator()); // must go directly after bodyParser

//if(appEnv.isLocal){
//    require('dotenv').load();// Loads .env file into environment
//}

var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'au-cdbr-sl-syd-01.cleardb.net',
    port     : '3306',
    user     : 'b57f89cb8a87b8',
    password : 'dfa08984',
    database : 'ibmx_6ffa3de40a923fc',
    debug    :  false
});

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
/*
app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true,
  saveUninitialized: true,
  resave: true
}));

/*app.use(function(req, res, next) {
  if (req.session && req.session.user) {
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user;  //refresh the session value
        res.locals.user = user;
      }
  } else {
    res.redirect('/login');
  }
});

/********************************
 Routing
 ********************************/
var resp = {};

//Logout
app.get('/logout', function(req, res) {
//  req.session.reset();
  res.redirect('/login');
});

// Home
app.get('/', function (req, res){
    res.sendfile('index.html');
});

app.post('/registration', function (req, res){

  pool.getConnection(function(err,connection){
    if (err) {
      connection.release();
      resp.appcode="900";
      resp.appmsg="Connection to database failed";
      res.status(500).send(resp);
    } // End of if (err)
    var id=-1;
    connection.query("SELECT count(*)+1 as id FROM users", function (err,rows) {
      if (!err) {
        if (rows.length>0) {
          id=rows[0].id;
          var email=req.headers.email;
          var fname=req.headers.fullname;
          var uname=req.headers.username;
          var hash = bcrypt.hashSync(req.headers.password,2);
          var role='user';
          var status=1;
          connection.query("INSERT INTO users VALUES ("+id+",'"+uname+"','"+hash+"','"+fname+"','"+role+"',"+status+",'"+email+"')",function(err,rows){
            connection.release();
            if (!err) {
              resp.appcode="100";
              resp.appmsg="OK";
              res.status(200).send(resp);
            } //End of if (!err)
            else {
              resp.appcode="902";
              resp.appmsg="DB insert returned error";
              res.status(500).send(resp);
            } //End of else (!err)
          }) //End of connection.query */
        } else {
          connection.release();
          resp.appcode="901";
          resp.appmsg="Query for new ID returned error";
          res.status(500).send(resp);
        }
      }
      else {
        connection.release();
        resp.appcode="901";
        resp.appmsg="Query for new ID returned error";
        res.status(500).send(resp);
      }
    })

    connection.on('error', function(err) {
      connection.release();
      resp.appcode="900";
      resp.appmsg="Connection to database failed";
      res.status(500).send(resp);
    }) //End of connection.on('error')
  }) // End of getConnection

})

app.get('/validate', function (req, res){
  pool.getConnection(function(err,connection){
    if (err) {
      connection.release();
      resp.appcode="900";
      resp.appmsg="Connection to database failed";
      res.status(500).send(resp);
    } // End of if (err)
    connection.query("select id, fullname, userrole, email, password from users where status=1 AND username='"+req.headers.username+"'",function(err,rows){
      connection.release();
      if (!err) {
        if (rows.length>0) {
          bcrypt.compare(req.headers.password,  rows[0].password, function(err, val) {
           if (val===true) {
              //req.session.user = rows[0];
              resp.appcode="100";
              resp.appmsg="OK";
              resp.body=rows[0];
              res.status(200).send(resp);
            } //End of If (compare passwords)
            else {
              resp.appcode="200";
              resp.appmsg="Username and password not matched";
              res.status(200).send(resp);
            } //End of else (compare passwords)
          }) // End of async bcrypt
        } //End of if (rows.length>0)
        else {
          resp.appcode="202";
          resp.appmsg="User not found / inactive";
          res.status(200).send(resp);
        }
      } //End of if (!err)
      else {
        resp.appcode="901";
        resp.appmsg="DB query returned error";
        res.status(500).send(resp);
      } //End of else (!err)
    }) //End of connection.query */
    connection.on('error', function(err) {
      connection.release();
      resp.appcode="900";
      resp.appmsg="Connection to database failed";
      res.status(500).send(resp);
    }) //End of connection.on('error')
  }) // End of getConnection
}); // End of app.Get


app.get('/dropdowns', function (req, res){
  pool.getConnection(function(err,connection){
    if (err) {
      connection.release();
      resp.appcode="900";
      resp.appmsg="Connection to database failed";
      res.status(500).send(resp);
    } // End of if (err)
    connection.query("select dtid, dropvalue from dropdowns",function(err,rows){
      connection.release();
      if (!err) {
        if (rows.length>0) {
              resp.appcode="100";
              resp.appmsg="OK";
              resp.body=rows;
              res.status(200).send(resp);
            } //End of if (rows.length>0)
            else {
              resp.appcode="300";
              resp.appmsg="Dropdown query returned no records!";
              res.status(200).send(resp);
            } //End of else (compare passwords)
        } //End of if (!err)
      else {
        resp.appcode="901";
        resp.appmsg="DB query returned error";
        res.status(500).send(resp);
      } //End of else (!err)
    }) //End of connection.query */
    connection.on('error', function(err) {
      connection.release();
      resp.appcode="900";
      resp.appmsg="Connection to database failed";
      res.status(500).send(resp);
    }) //End of connection.on('error')
  }) // End of getConnection
}); // End of app.Get
/*
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
*/
/********************************
Ports
********************************/
app.listen(appEnv.port, appEnv.bind, function() {
  console.log("Node server running on " + appEnv.url);
});
