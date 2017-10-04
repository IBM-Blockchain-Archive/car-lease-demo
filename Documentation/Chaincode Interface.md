#Chaincode Interface

This document outlines the interface for communicating with the Vehicle Chaincode.

##Contents

* [Deploy](#deploy)
* [Invoke](#invoke)
	* [Create Vehicle](#create-vehicle)
	* [Authority to Manufacturer](#authority-to-manufacturer)
	* [Manufacturer to Private](#manufacturer-to-private)
	* [Private to Private](#private-to-private)
	* [Private to Lease Company](#private-to-lease-company)
	* [Lease Company to Private](#lease-company-to-private)
	* [Private to Scrap Merchant](#private-to-scrap-merchant)
	* [Update Colour](#update-colour)
	* [Update make](#update-make)
	* [Update model](#update-model)
	* [Update Registration](#update-registration)
	* [Update VIN](#update-vin)
	* [Scrap Vehicle](#scrap-vehicle)
* [Query](#query)
	* [Get Vehicle Details](#get-vehicle-details)
	* [Get Vehicles](#get-vehicles)
* [Glossary](#glossary)  

##Deploy

#####Server Side API Call:

	POST	/blockchain/chaincode/vehicles

#####Chaincode Spec: 
	{
		"jsonrpc": "2.0",
		"method": "deploy",
		"params": {
			"type": 1,
			"chaincodeID": {
				"path": <chaincode_path>
			},
			"ctorMsg": {
				"function": "init",
				"args": [
					<api_url>
				]
			},
			"secureContext": "<caller>"
		},
		"id": <id>
	}

#####Conditions:

None.

#####Description:

Deploys the chaincode located at the path that was supplied (e.g. [https://github.com/IBM-Blockchain/car-lease-demo/Chaincode/vehicle_code](https://github.com/IBM-Blockchain/car-lease-demo/blob/master/Chaincode/vehicle_code)), calling the init function which stores in the world state a blank array of V5C IDs and the peer address supplied which is used to get eCerts.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<chaincode_name>"
	  },
	  "id": <id>
	}


##Invoke

###Create Vehicle

#####Server Side API Call:

	POST	/blockchain/assets/vehicles

#####Chaincode Spec: 
	{
		"jsonrpc": "2.0",
		"method": "invoke",
		"params": {
			"type": 1,
			"chaincodeID": {
				"name": <chaincode_name>
			},
			"ctorMsg": {
				"function": "create_vehicle",
				"args": [
					<v5c_ID>
				]
			},
			"secureContext": "<caller>"
		},
		"id": <id>
	}

#####Conditions:

* The caller must be a Regulator.
* `<v5c_ID>` passed must consist of 2 letters followed by 7 numbers and be unique.

#####Description:

The function takes a `<v5c_ID>` and creates a new blank vehicle JSON object to store in the world state with the ID of `<v5c_ID>`. 

JSON Object:

	{"v5cID": "<v5c_ID>", "VIN": 0, "make": "UNDEFINED", "model": "UNDEFINED", "reg": "UNDEFINED", "owner": <caller>, "colour": "UNDEFINED", "leaseContractID": "UNDEFINED", "status": 0, "scrapped": false}

The function checks whether the `<v5c_ID>` has already been used and if not writes the JSON to the world state with the `<v5c_ID>` as the key. It also appends the `<v5c_ID>` to the array of V5C IDs and updates that in the world state.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<transaction_id>"
	  },
	  "id": <id>
	}

###Authority to Manufacturer

#####Server Side API Call:

	PUT		/blockchain/assets/vehicles/<v5c_ID>/owner

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "invoke",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": "authority_to_manufacturer",
	            "args": [
	                <recipient>, <v5c_ID>
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:

* Caller must be a Regulator.
* Recipient must be a Manufacturer.
* Vehicle must be owned by the caller.
* Vehicle must not be scrapped.
* Vehicle must have a state of 0.
* A vehicle with the `<v5c_ID>` must exist in the world state.


#####Description:

If the conditions are met then the vehicle is transferred from the Authority to a Manufacturer. This is done by updating the JSON stored with the key `<v5c_ID>` in the world state so that the owner field is the Recipient passed as an argument. The vehicle's status is also updated in the JSON to be 1 to show it is in the state of manufacture.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<transaction_id>"
	  },
	  "id": <id>
	}

###Manufacturer to Private

#####Server Side API Call:

	PUT		/blockchain/assets/vehicles/<v5c_ID>/owner

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "invoke",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": "manufacturer_to_private",
	            "args": [
	                <recipient>, <v5c_ID>
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:

* Caller must be a Manufacturer.
* Recipient must be a Private Entity.
* Vehicle must be owned by the caller.
* Vehicle must not be scrapped.
* Vehicle must have a state of 1.
* A vehicle with the `<v5c_ID>` must exist in the world state.


#####Description:

If the conditions are met then the vehicle is transferred from the Manufacturer to a Private Entity. This is done by updating the JSON stored with the key `<v5c_ID>` in the world state so that the owner field is the Recipient passed as an argument. The vehicle's status is also updated in the JSON to be 2 to show it is in the state of private ownership.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<transaction_id>"
	  },
	  "id": <id>
	}

###Private to Private

#####Server Side API Call:

	PUT		/blockchain/assets/vehicles/<v5c_ID>/owner

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "invoke",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": "private_to_private",
	            "args": [
	                <recipient>, <v5c_ID>
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:

* Caller must be a Private Entity.
* Recipient must be a Private Entity.
* Vehicle must be owned by the caller.
* Vehicle must not be scrapped.
* Vehicle must have a state of 2.
* A vehicle with the `<v5c_ID>` must exist in the world state.


#####Description:

If the conditions are met then the vehicle is transferred from the Private Entity to another Private Entity. This is done by updating the JSON stored with the key `<v5c_ID>` in the world state so that the owner field is the Recipient passed as an argument.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<transaction_id>"
	  },
	  "id": <id>
	}

###Private to Lease Company

#####Server Side API Call:

	PUT		/blockchain/assets/vehicles/<v5c_ID>/owner

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "invoke",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": "private_to_lease_company",
	            "args": [
	                <recipient>, <v5c_ID>
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:

* Caller must be a Private Entity.
* Recipient must be a Lease Company.
* Vehicle must be owned by the caller.
* Vehicle must not be scrapped.
* Vehicle must have a state of 2.
* A vehicle with the `<v5c_ID>` must exist in the world state.


#####Description:

If the conditions are met then the vehicle is transferred from the Private Entity to a Lease Company. This is done by updating the JSON stored with the key `<v5c_ID>` in the world state so that the owner field is the Recipient passed as an argument.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<transaction_id>"
	  },
	  "id": <id>
	}

###Lease Company to Private

#####Server Side API Call:

	PUT		/blockchain/assets/vehicles/<v5c_ID>/owner

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "invoke",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": "lease_company_to_private",
	            "args": [
	                <recipient>, <v5c_ID>
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:

* Caller must be a Lease Company.
* Recipient must be a Private Entity.
* Vehicle must be owned by the caller.
* Vehicle must not be scrapped.
* Vehicle must have a state of 2.
* A vehicle with the `<v5c_ID>` must exist in the world state.


#####Description:

If the conditions are met then the vehicle is transferred from the Lease Company to a Private Entity. This is done by updating the JSON stored with the key `<v5c_id>` in the world state so that the owner field is the Recipient passed as an argument.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<transaction_id>"
	  },
	  "id": <id>
	}

###Private to Scrap Merchant

#####Server Side API Call:

	PUT		/blockchain/assets/vehicles/<v5c_ID>/owner

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "invoke",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": "private_to_scrap_merchant",
	            "args": [
	                <recipient>, <v5c_ID>
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:

* Caller must be a Private Entity.
* Recipient must be a Scrap Merchant.
* Vehicle must be owned by the caller.
* Vehicle must not be scrapped.
* Vehicle must have a state of 2.
* A vehicle with the `<v5c_ID>` must exist in the world state.


#####Description:

If the conditions are met then the vehicle is transferred from the Private Entity to a Scrap Merchant. This is done by updating the JSON stored with the key `<v5c_id>` in the world state so that the owner field is the Recipient passed as an argument. The vehicle's status is also updated in the JSON to be 4 to show it is in the state of private ownership.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<transaction_id>"
	  },
	  "id": <id>
	}

###Update Colour

#####Server Side API Call:

	PUT		/blockchain/assets/vehicles/<v5c_ID>/colour

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "invoke",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": "update_colour",
	            "args": [
	                <string>, <v5c_ID>
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:
* Caller must NOT be a Scrap Merchant
* Vehicle must be owned by the caller.
* Vehicle must not be scrapped.
* A vehicle with the `<v5c_ID>` must exist in the world state.


#####Description:

If the conditions are met then the vehicle's colour is updated to match the value passed. This is done by updating the JSON stored with the key `<v5c_id>` in the world state so that the colour field is the new value.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<transaction_id>"
	  },
	  "id": <id>
	}

###Update Make

#####Server Side API Call:

	PUT		/blockchain/assets/vehicles/<v5c_ID>/colour

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "invoke",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": "update_make",
	            "args": [
	                <string>, <v5c_ID>
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:
* Caller must be a Manufacturer
* Vehicle must be owned by the caller.
* Vehicle must not be scrapped.
* Vehicle must have a state of 1.
* A vehicle with the `<v5c_ID>` must exist in the world state.


#####Description:

If the conditions are met then the vehicle's make is updated to match the value passed. This is done by updating the JSON stored with the key `<v5c_id>` in the world state so that the make field is the new value.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<transaction_id>"
	  },
	  "id": <id>
	}

###Update Model

#####Server Side API Call:

	PUT		/blockchain/assets/vehicles/<v5c_ID>/model

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "invoke",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": "update_model",
	            "args": [
	                <string>, <v5c_ID>
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:
* Caller must be a Manufacturer
* Vehicle must be owned by the caller.
* Vehicle must not be scrapped.
* A vehicle with the `<v5c_ID>` must exist in the world state.


#####Description:

If the conditions are met then the vehicle's model is updated to match the value passed. This is done by updating the JSON stored with the key `<v5c_id>` in the world state so that the model field is the new value.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<transaction_id>"
	  },
	  "id": <id>
	}

###Update Registration

#####Server Side API Call:

	PUT		/blockchain/assets/vehicles/<v5c_ID>/reg

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "invoke",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": "update_registration",
	            "args": [
	                <string>, <v5c_ID>
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:
* Caller must NOT be a Scrap Merchant
* Vehicle must be owned by the caller.
* Vehicle must not be scrapped.
* A vehicle with the `<v5c_ID>` must exist in the world state.


#####Description:

If the conditions are met then the vehicle's registration is updated to match the value passed. This is done by updating the JSON stored with the key `<v5c_id>` in the world state so that the registration field is the new value.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<transaction_id>"
	  },
	  "id": <id>
	}

###Update VIN

#####Server Side API Call:

	PUT		/blockchain/assets/vehicles/<v5c_ID>/VIN

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "invoke",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": update_VIN",
	            "args": [
	                <int>, <v5c_ID>
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:
* Caller must be a Manufacturer
* Vehicle must be owned by the caller.
* Vehicle must not be scrapped.
* Vehicle must have a state of 1.
* Vehicle's VIN must be 0 i.e. not changed before.
* VIN must be a 15 digit number.
* A vehicle with the `<v5c_ID>` must exist in the world state.


#####Description:

If the conditions are met then the vehicle's VIN is updated to match the value passed. This is done by updating the JSON stored with the key `<v5c_id>` in the world state so that the VIN field is the new value.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<transaction_id>"
	  },
	  "id": <id>
	}

###Scrap Vehicle

#####Server Side API Call:

	DELETE		/blockchain/assets/vehicles/<v5c_ID>

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "invoke",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": "scrap_vehicle",
	            "args": [
	                <v5c_ID>
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:
* Caller must be a Scrap Merchant
* Vehicle must be owned by the caller.
* Vehicle must not be scrapped.
* Vehicle must have a state of 4.
* A vehicle with the `<v5c_ID>` must exist in the world state.


#####Description:

If the conditions are met then the vehicle's scrapped value is set to true. This is done by updating the JSON stored with the key `<v5c_id>` in the world state so that the scrapped field is true.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<transaction_id>"
	  },
	  "id": <id>
	}

##Query

###Get Vehicle Details

#####Server Side API Call:

	GET /blockchain/assets/vehicles/<v5C_ID>

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "query",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": "get_vehicle_details",
	            "args": [
	                <v5c_ID>
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:

* Caller must be the owner OR a Regulator
* A vehicle with the `<v5c_ID>` must exist in the world state.


#####Description:

If the user is the owner or an authority the code returns the JSON Object with the key `<v5c_ID>` from the world state.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "<vehicle_json>"
	  },
	  "id": <id>
	}

#####Errors:

	Output:
		{
		  "jsonrpc": "2.0",
		  "error": {
		    "code": -32003,
		    "message": "Query failure",
		    "data": "Error when querying chaincode: Error:Failed to execute transaction or query(Permission Denied)"
		  },
		  "id": <id>
		}
	Reason: The caller does not have permission to read the vehicle requested.

	Output:
		{
		  "jsonrpc": "2.0",
		  "error": {
		    "code": -32003,
		    "message": "Query failure",
		    "data": "Error when querying chaincode: Error:Failed to execute transaction or query(QUERY: Error retrieving v5c RETRIEVE_V5C: Corrupt vehicle record)"
		  },
		  "id": <id>
		} 
	Reason: There is no data stored in the world state with the key <v5c_ID>.

	Output:
		{
		  "jsonrpc": "2.0",
		  "error": {
		    "code": -32003,
		    "message": "Query failure",
		    "data": "Error when querying chaincode: Error:Failed to execute transaction or query(GET_VEHICLE_DETAILS: Invalid vehicle object)"
		  },
		  "id": <id>
		} 
	Reason: The data stored with the key <v5c_ID> is not in the format expected for a vehicle.

###Get Vehicles

#####Server Side API Call:

	GET /blockchain/assets/vehicles/<v5C_ID>

#####Chaincode Spec:

	{
	    "jsonrpc": "2.0",
	    "method": "query",
	    "params": {
	        "type": 1,
	        "chaincodeID": {
	            "name": <chaincode_name>
	        },
	        "ctorMsg": {
	            "function": "get_vehicles",
	            "args": [
	            ]
	        },
	        "secureContext": "<caller>"
	    },
	    "id": <id>
	}

#####Conditions:

None.


#####Description:

Goes through all vehicles that have been created and indexed and if the owner is the caller or the caller is an authority then it adds the vehicle JSON to an array to be returned.

#####Output:

	{
	  "jsonrpc": "2.0",
	  "result": {
	    "status": "OK",
	    "message": "[<vehicle_json>, ... ,<vehicle_json>]"
	  },
	  "id": <id>
	}

#####Errors:

	Output:
		{
		  "jsonrpc": "2.0",
		  "error": {
		    "code": -32003,
		    "message": "Query failure",
		    "data": "Error when querying chaincode: Error:Failed to execute transaction or query(Unable to get v5cIDs)"
		  },
		  "id": <id>
		}
	Reason: The v5cIDs data is missing.

	Output:
		{
		  "jsonrpc": "2.0",
		  "error": {
		    "code": -32003,
		    "message": "Query failure",
		    "data": "Error when querying chaincode: Error:Failed to execute transaction or query(Corrupt V5C_Holder)"
		  },
		  "id": <id>
		}
	Reason: The v5cIDs is not in the correct format.

	Output:
		{
		  "jsonrpc": "2.0",
		  "error": {
		    "code": -32003,
		    "message": "Query failure",
		    "data": "Error when querying chaincode: Error:Failed to execute transaction or query(Failed to retrieve V5C)"
		  },
		  "id": <id>
		}
	Reason: One of the vehicle's that has a key stored in the index is corrupt or missing.
	
##Glossary

####api_url
> The URL of the peer and its API port that the chaincode should use to call out to.

####caller
> The identity of the user on the Blockchain who made the call.

####chaincode_name
> The id of the chaincode. It is returned when chaincode is deployed and is used to tell the API which chaincode you wish to invoke or query. It is a 128 character string.

####chaincode_path
> The link to where the chaincode is located either on the local file system or on GitHub. The link is not to the actual file but the folder containing the go file.

####id
> Chaincode requests via the HyperLedger Fabric API use an integer ID that will appear on the response so that a user can send multiple requests at once and know which response ties to which request. If the ID is 0 then the request is treated by fabric as a notification.

####recipient
> The identity of the user on the Blockchain who is receiving the vehicle.

####transaction_id
> The ID of a transaction on the ledger. This uuid can be used with the HyperLedger API to select a transaction and view it. 

####username
> The identity of a user on the Blockchain.

####v5c_ID
> The unique identifier for a vehicle object. It is used as the key for the vehicles JSON object when it is written to the world state. It consists of 2 uppercase letters followed by 7 letters for example AB1234567.

####vehicle_json
> The JSON object that defines a vehicle and is stored in the world state. The object is defined as: 
> 
	{
		"v5cID": "<v5c_ID>", 
		"VIN": <VIN>, 
		"make": "<string>",
		"model": "<string>",
		"reg": "<string>",
		"owner": <username>, 
		"colour": "<string>",
		"leaseContractID": "<string>", 
		"status": <int>, 
		"scrapped": <bool>
	}

####VIN
> 15 character integer or 0 if the vehicle has yet to be defined.
