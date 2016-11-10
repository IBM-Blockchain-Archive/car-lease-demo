/*eslint-env node*/

var request = require("request")
var reload = require('require-reload')(require),
    configFile = reload(__dirname+'/../../../../configurations/configuration.js');
var tracing = require(__dirname+'/../../../../tools/traces/trace.js');
var map_ID = require(__dirname+'/../../../../tools/map_ID/map_ID.js');
var hfc = require('hfc');

var user_id;
var attrList = ["name", "affiliation"];

function get_all_cars(req, res)
{

	if(typeof req.cookies.user != "undefined")
	{
		req.session.user = req.cookies.user;
		req.session.identity = map_ID.user_to_id(req.cookies.user);
	}

	user_id = req.session.identity;

	tracing.create('ENTER', 'GET blockchain/assets/vehicles', {});

        configFile = reload(__dirname+'/../../../../configurations/configuration.js');

        var chain = hfc.getChain(configFile.config.chain_name);

        user = chain.getUser(user_id, function(err, user) {
                if (err) {
                        tracing.create('ERROR', 'POST blockchain/assets/vehicles', err);
                }
                else {
                        var queryRequest = {
                                chaincodeID: configFile.config.vehicle_name,
                                fcn: 'get_vehicles',
                                args: [],
                                attrs: attrList
                        }

                        var queryTx = user.query(queryRequest);

                        queryTx.on('complete', function(results) {
                                var data = JSON.parse(results.result.toString('utf8'));
                                for(var i = 0; i < data.length; i++)
                                {
                                        tracing.create('INFO', 'GET blockchain/assets/vehicles', JSON.stringify(data[i]));
                                        res.write(JSON.stringify(data[i])+'&&')
                                }
                                tracing.create('EXIT', 'GET blockchain/assets/vehicles', {});
                                res.end()
                        });

                        queryTx.on('error', function(error) {
                                res.status(400);
                                var error = {};
                                error.error = true;
                                error.message = 'Unable to get blockchain assets';
                                res.end(JSON.stringify(error));
                                tracing.create('ERROR', 'GET blockchain/assets/vehicles', error);
                        });
                }
        });
}

exports.read = get_all_cars;
