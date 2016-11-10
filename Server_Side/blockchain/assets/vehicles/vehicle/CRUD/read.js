var request = require('request');
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../../../tools/map_ID/map_ID.js');
var hfc = require('hfc');

var user_id;
var attrList = ["name", "affiliation"];

var read = function (req,res)
{
	var v5cID = req.params.v5cID;
	tracing.create('ENTER', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, {});
	configFile = reload(__dirname+'/../../../../../../configurations/configuration.js');

	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
		req.session.identity = map_ID.user_to_id(req.cookies.user);
	}

	user_id = req.session.identity

  var chain = hfc.getChain(configFile.config.chain_name);

  chain.getUser(user_id, function(err, user) {
    if (err) {
      res.status(400);
			var error = {};
			error.message = 'Unable to read vehicle.';
			error.v5cID = v5cID;
			error.error = true;
			tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, error);
			res.send(error);
    }
    else {
      var queryRequest = {
        chaincodeID: configFile.config.vehicle_name,
        fcn: "get_vehicle_details",
        args: [v5cID],
        attrs: attrList
      }

      var queryTx = user.query(queryRequest);

      queryTx.on('complete', function(results) {
        var result = {}
  			result.vehicle = JSON.parse(results.result.toString('utf8'));
  			tracing.create('EXIT', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, result);
  			res.send(result);
      });

      queryTx.on('error', function(error) {
        res.status(400)
  			var error = {}
  			error.message = 'Unable to read vehicle.'
  			error.v5cID = v5cID;
  			error.error = true;
  			tracing.create('ERROR', 'GET blockchain/assets/vehicles/vehicle/'+v5cID, error)
  			res.send(error)
      });
    }
  });
}

exports.read = read;
