var cfenv = require('cfenv');
var Cloudant = require('cloudant');

var appEnv = cfenv.getAppEnv();
var appServices = appEnv.services;
var cloudant_url = 'https://86131a70-459f-40f4-a74d-a50a7bdc12b8-bluemix:c584b1ccc01eeef2438bdb4782a8467df2a97cbc19682b40d2eb25e398f281c7@86131a70-459f-40f4-a74d-a50a7bdc12b8-bluemix.cloudant.com';

var mydb='mspocdb';

exports.dropdowns=function(){
	return function(req, res) {

	var resultJSON = {};

	var cat_type = req.headers.cat_type;
	resultJSON.cat_type = cat_type;
	Cloudant({url: cloudant_url, plugin:'retry', retryAttempts:5, retryTimeout:1000 }, function(err, cloudant) {
		if (!err) {
			var db = cloudant.db.use(mydb);
			var query = {
						  "selector": {
							"cat_type": cat_type
						  },
						  "fields": ["id",
							"value"
						  ]
						};

			db.find(query, function(err,data){
				if (!err) {
					if (data.docs.length == 0) {
						console.log("Query executed - Data not found: " + cat_type);
						resultJSON.message = "Query executed - Data not found";
						resultJSON.kpi_data = data.docs;
						resultJSON.fault = 'Y';
						resultJSON.fault_code = '100';
						res.status(200).send(resultJSON);
					} else {
				  	resultJSON.Array = data.docs;
						res.status(200).send(resultJSON);
					}
				} else {
					console.log("Query execution - failed: ", cat_type);
					resultJSON.message = "Query execution - failed";
					resultJSON.fault = 'Y';
					resultJSON.fault_code = '200';
					res.status(404).send(resultJSON);
				}
			})
		} else {
			console.log("Connection failed");
			resultJSON.message = "Connection failed";
			resultJSON.fault = 'Y';
			resultJSON.fault_code = '404';
			res.status(404).send(resultJSON);
		}
	}) // end of Cloudant
	}
}

exports.codes=function(){
	return function(req, res) {

	var resultJSON = {};

	var cat_type = req.headers.cat_type;
	resultJSON.cat_type = cat_type;
	Cloudant({url: cloudant_url, plugin:'retry', retryAttempts:5, retryTimeout:1000 }, function(err, cloudant) {
		if (!err) {
			var db = cloudant.db.use(mydb);
			var query2 = {
						  "selector": {
							"cat_type": cat_type
						  },
						  "fields": ["value"]
						};

			db.find(query2, function(err,data){
				if (!err) {
					if (data.docs.length == 0) {
						console.log("Query executed - Data not found: " + cat_type);
						resultJSON.Array = data.docs;
						resultJSON.fault = 'Y';
						resultJSON.fault_code = '100';
						res.status(200).send(resultJSON);
					} else {
				  	resultJSON.Array = data.docs;
						res.status(200).send(resultJSON);
					}
				} else {
					console.log("Query execution - failed: ", cat_type);
					resultJSON.message = "Query execution - failed";
					resultJSON.fault = 'Y';
					resultJSON.fault_code = '200';
					res.status(404).send(resultJSON);
				}
			})
		} else {
			console.log("Connection failed");
			resultJSON.message = "Connection failed";
			resultJSON.fault = 'Y';
			resultJSON.fault_code = '404';
			res.status(404).send(resultJSON);
		}
	}) // end of Cloudant
	}
}

exports.addimportcode=function(){
	return function(req, res) {
	console.log('z~~~~~~~~~inside add Import code!!!!!!!!!')
	var resultJSON = {};
	var icode = req.headers.icode;
	var id = req.headers.id;
	console.log('z~~~~~~~~~inside add Import code!!!!!!!!!'+icode);
	console.log('z~~~~~~~~~inside add Import code!!!!!!!!!'+id);
	resultJSON.icode = icode;
	Cloudant({url: cloudant_url, plugin:'retry', retryAttempts:5, retryTimeout:1000 }, function(err, cloudant) {
		if (!err) {
			var db = cloudant.db.use(mydb);
			var query = {
								"cat_type": "importer",
								"id": id,
								"value": icode
						};
						  console.log("Creating document 'mydoc'");
						  db.insert(query, function(err, data) {
								if (!err) {
									resultJSON.data=data;
									resultJSON.fault = 'N';
									resultJSON.fault_code = '0';
									res.end(JSON.stringify(resultJSON));
								}
								else {
									console.log("Query execution - failed: ", cat_type);
									resultJSON.message = "Query execution - failed";
									resultJSON.fault = 'Y';
									resultJSON.fault_code = '400';
								}
						  });
		} else {
			console.log('z~~~~~~~~~inside conn failed    code!!!!!!!!!')
			console.log("Connection failed");
			resultJSON.message = "Connection failed";
			resultJSON.fault = 'Y';
			resultJSON.fault_code = '404';
			res.status(404).send(resultJSON);
		}
	}) // end of Cloudant
	}
}

//not used
exports.getRestParms=function(cat_type,func_type){

	var resultJSON = {};
	Cloudant({url: cloudant_url, plugin:'retry', retryAttempts:5, retryTimeout:1000 }, function(err, cloudant) {
		if (!err) {
			var db = cloudant.db.use(mydb);
			var query3 = {
						  "selector": {
							"cat_type": cat_type,
							"value" : func_type
						  },
						  "fields": ["host","port","method","path"]
						};

			db.find(query3, function(err,data){
				if (!err) {
					if (data.docs.length == 0) {
						console.log("Query executed - Data not found: " + cat_type);
						resultJSON.Array = data.docs;
						resultJSON.fault = 'Y';
					} else {
						console.log('s~~~~~~~~~'+JSON.stringify(data.docs));
				  	resultJSON.Array = data.docs;
						resultJSON.fault = 'N';
					}
				} else {
					console.log("Query execution - failed: ", cat_type);
					resultJSON.message = "Query execution - failed";
					resultJSON.fault = 'Y';
					resultJSON.fault_code = '200';
				}
			})
		} else {
			console.log("Connection failed");
			resultJSON.message = "Connection failed";
			resultJSON.fault = 'N';
		}
		return(JSON.stringify(resultJSON));
	}) // end of Cloudant
}
