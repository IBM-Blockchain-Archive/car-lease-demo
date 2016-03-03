package main

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"github.com/openblockchain/obc-peer/openchain/chaincode/shim"
	"encoding/json"
	"crypto/x509"
	"reflect"
	"encoding/asn1"
	"encoding/pem"
	"net/http"
	"net/url"
    "io/ioutil"
	"regexp"
)

const   ROLE_AUTHORITY      =  1
const   ROLE_MANUFACTURER   =  2
const   ROLE_PRIVATE_ENTITY =  4
const   ROLE_LEASE_COMPANY  =  8
const   ROLE_SCRAP_MERCHANT =  0

const   STATE_TEMPLATE  		=  0
const   STATE_MANUFACTURE  		=  1
const   STATE_PRIVATE_OWNERSHIP =  2
const   STATE_LEASED_OUT 		=  3
const   STATE_BEING_SCRAPPED  	=  4

//==============================================================================================================================
//	 Structure Definitions 
//==============================================================================================================================
//	Chaincode - A blank struct for use with Shim (A HyperLedger included go file used for get/put state
//				and other HyperLedger functions)
//==============================================================================================================================
type  Chaincode struct {
}

//==============================================================================================================================
//	Vehicle - Defines the structure for a car object. JSON on right tells it what JSON fields to map to
//			  that element when reading a JSON object into the struct e.g. JSON make -> Struct Make.
//==============================================================================================================================
type Vehicle struct {
	Make            string `json:"make"`
	Model           string `json:"model"`
	Reg             string `json:"reg"`
	VIN             int    `json:"VIN"`					
	Owner           string `json:"owner"`
	Scrapped        bool   `json:"scrapped"`
	Status          int    `json:"status"`
	Colour          string `json:"colour"`
	V5cID           string `json:"v5cID"`
	LeaseContractID string `json:"leaseContractID"`
}

//==============================================================================================================================
//	ECertResponse - Struct for storing the JSON response of retrieving an ECert. JSON OK -> Struct OK
//==============================================================================================================================
type ECertResponse struct {
	OK string `json:"OK"`
}								

//==============================================================================================================================
//	Init Function - Called when the user deploys the chaincode																	
//==============================================================================================================================
func (t *Chaincode) init(stub *shim.ChaincodeStub, args []string) ([]byte, error) {
	return nil, nil
}

//==============================================================================================================================
//	 General Functions
//==============================================================================================================================
//	 check_role - Takes an ecert, decodes it to remove html encoding then parses it and checks the
// 				  certificates extensions containing the role before returning the role interger. Returns -1 if it errors
//==============================================================================================================================
func (t *Chaincode) check_role(stub *shim.ChaincodeStub, args []string) (int64, error) {																							
	ECertSubjectRole := asn1.ObjectIdentifier{2, 1, 3, 4, 5, 6, 7}																														
	
	decodedCert, err := url.QueryUnescape(args[0]);    		// make % etc normal //
	
															if err != nil { return -1, errors.New("Could not decode certificate") }
	
	pem, _ := pem.Decode([]byte(decodedCert))           	// Make Plain text   //

	x509Cert, err := x509.ParseCertificate(pem.Bytes);		// Extract Certificate from argument //
														
															if err != nil { return -1, errors.New("Couldn't parse certificate")	}

	var role int64
	for _, ext := range x509Cert.Extensions {				// Get Role out of Certificate and return it //
		if reflect.DeepEqual(ext.Id, ECertSubjectRole) {
			role, err = strconv.ParseInt(string(ext.Value), 10, len(ext.Value)*8)   
                                            			
															if err != nil { return -1, errors.New("Failed parsing role: " + err.Error())	}
			break
		}
	}
	
	return role, nil
}
//==============================================================================================================================
//	 get_user - Takes an ecert, decodes it to remove html encoding then parses it and gets the
// 				common name and returns it
//==============================================================================================================================
func (t *Chaincode) get_user(stub *shim.ChaincodeStub, encodedCert string) (string, error) {
	
	decodedCert, err := url.QueryUnescape(encodedCert);    		// make % etc normal //
	
															if err != nil { return "", errors.New("Could not decode certificate") }
	
	pem, _ := pem.Decode([]byte(decodedCert))           	// Make Plain text   //

	x509Cert, err := x509.ParseCertificate(pem.Bytes);
	
															if err != nil { return "", errors.New("Couldn't parse certificate")	}

	return x509Cert.Subject.CommonName, nil

}

//==============================================================================================================================
//	 get_ecert - Takes the name passed and calls out to the REST API for HyperLedger to retrieve the ecert
//				 for that user. Returns the ecert as retrived including html encoding.
//==============================================================================================================================
func (t *Chaincode) get_ecert(stub *shim.ChaincodeStub, name string) ([]byte, error) {
	
	var cert ECertResponse
	
	response, err := http.Get("http://169.44.63.203:35243/registrar/"+name+"/ecert") // Calls out to the HyperLedger REST API to get the ecert of the user with that name
    
															if err != nil { return nil, errors.New("Could not get ecert") }
	
	defer response.Body.Close()
	contents, err := ioutil.ReadAll(response.Body)			// Read the response from the http callout into the variable contents
	
															if err != nil { return nil, errors.New("Could not read body") }
	
	err = json.Unmarshal(contents, &cert)
	
															if err != nil { return nil, errors.New("ECert not found for user: "+name) }
															
	return []byte(string(cert.OK)), nil
}

//==============================================================================================================================
//	 create_log - Invokes the function of event_code chaincode with the name 'chaincodeName' to log an
//					event.
//==============================================================================================================================
func (t *Chaincode) create_log(stub *shim.ChaincodeStub, args []string) ([]byte, error) {	
																						
	chaincode_name := "2b93a8cdcbec1ef4909071fd85531fcf3ef21db17343568a73916bad010966913c480475864a6da4e3193bbd2300c9fe140bcf3bf8fa675aba078632a7564456"
	chaincode_function := "create_log"																																									
	chaincode_arguments := args
	
	_, err := stub.InvokeChaincode(chaincode_name, chaincode_function, chaincode_arguments)
	
															if err != nil { return nil, errors.New("Failed to invoke vehicle_log_code") }
	
	return nil,nil
}

//==============================================================================================================================
//	 retrieve_v5c - Gets the state of the data at v5cID in the ledger then converts it from the stored 
//					JSON into the Vehicle struct for use in the contract. Returns the Vehcile struct.
//					Returns empty v if it errors.
//==============================================================================================================================
func (t * Chaincode) retrieve_v5c(stub *shim.ChaincodeStub, v5cID string) (Vehicle, error) {
	
	var v Vehicle

	bytes, err := stub.GetState(v5cID)	;					
				
															if err != nil {	return v, errors.New("Error retrieving vehicle with v5cID = " + v5cID) }

	err = json.Unmarshal(bytes, &v)	;						

															if err != nil {	return v, errors.New("Corrupt vehicle record")	}
	
	return v, nil
}

func (t *Chaincode) get_owner(stub *shim.ChaincodeStub, v Vehicle) (string, error) {
	
	current_owner, err := t.get_user(stub, v.Owner)
	
															if err != nil { return "", errors.New("Unable to get username of current owner")}
														
	return current_owner, nil
}

//==============================================================================================================================
//	 get_user_data - Calls the get_ecert and check_role functions and returns the ecert and role for the
//					 name passed.
//==============================================================================================================================
func (t *Chaincode) get_user_data(stub *shim.ChaincodeStub, name string) ([]byte, int64, error){

	ecert, err := t.get_ecert(stub, name)	;					if err != nil { return nil, -1, errors.New("Could not find ecert for user: "+name) }

	role, err := t.check_role(stub,[]string{string(ecert)})	;	if err != nil { return nil, -1, err }
	
	return ecert, role, nil
}

//==============================================================================================================================
// save_changes - Writes to the ledger the Vehicle struct passed in a JSON format. Uses the shim file's 
//				  method 'PutState'.
//==============================================================================================================================
func (t *Chaincode) save_changes(stub *shim.ChaincodeStub, v Vehicle) (bool, error) {
	 
	bytes, err := json.Marshal(v)
	
																if err != nil { return false, errors.New("Error creating vehicle record") }

	err = stub.PutState(v.V5cID, bytes)
	
																if err != nil { return false, err }
	
	return true, nil
}

//==============================================================================================================================
//	 Router Functions
//==============================================================================================================================
//	Run - Called on chaincode invoke. Takes a function name passed and calls that function. Converts some
//		  initial arguments passed to other things for use in the called function e.g. name -> ecert
//==============================================================================================================================
func (t *Chaincode) Run(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {
	if function == "init" {
		return t.init(stub, args)
	} else {
	
		caller_ecert, caller_role, err := t.get_user_data(stub, args[0]) 					// Get the details of the caller
		
																							if err != nil { return nil, err }
		
		if function == "create_vehicle" { return t.create_vehicle(stub, args[0], caller_ecert, caller_role, args[1])
		} else { 																			// If the function is not a create then there must be a car so we need to retrieve the car.
			
			argPos := 2
			
			if function == "scrap_vehicle" {												// If its a scrap vehicle then only two arguments are passed (no update value) all others have three arguments and the v5cID is expected in the last argument
				argPos = 1
			}
			
			v, err := t.retrieve_v5c(stub, args[argPos])
			
																						    if err != nil { return nil, err }
																							
			current_owner, err := t.get_owner(stub, v)
	
																							if err != nil { return nil, err }
		
			if strings.Contains(function, "update") == false           && 
			   function 							!= "scrap_vehicle"    { 				//	If the function is not an update or a scrappage it must be a transfer so we need to get the ecert of the recipient.
				
					recipient_ecert, recipient_role, err := t.get_user_data(stub, args[1])	// Get the details of the recipient
					
																							if err != nil {	return nil, err }
					
					if 		   function == "authority_to_manufacturer" { return t.authority_to_manufacturer(stub, v, current_owner, args[0], caller_ecert, caller_role, args[1], recipient_ecert, recipient_role)
					} else if  function == "manufacturer_to_private"   { return t.manufacturer_to_private(stub, v, current_owner, args[0], caller_ecert, caller_role, args[1], recipient_ecert, recipient_role)
					} else if  function == "private_to_private" 	   { return t.private_to_private(stub, v, current_owner, args[0], caller_ecert, caller_role, args[1], recipient_ecert, recipient_role)
					} else if  function == "private_to_lease_company"  { return t.private_to_lease_company(stub, v, current_owner, args[0], caller_ecert, caller_role, args[1], recipient_ecert, recipient_role)
					} else if  function == "lease_company_to_private"  { return t.lease_company_to_private(stub, v, current_owner, args[0], caller_ecert, caller_role, args[1], recipient_ecert, recipient_role)
					} else if  function == "private_to_scrap_merchant" { return t.private_to_scrap_merchant(stub, v, current_owner, args[0], caller_ecert, caller_role, args[1], recipient_ecert, recipient_role)
					}
				
			} else if function == "update_make"  	    { return t.update_make(stub, v, current_owner, args[0], caller_ecert, caller_role, args[1])
			} else if function == "update_model"        { return t.update_model(stub, v, current_owner, args[0], caller_ecert, caller_role, args[1])
			} else if function == "update_registration" { return t.update_registration(stub, v, current_owner, args[0], caller_ecert, caller_role, args[1])
			} else if function == "update_vin" 			{ return t.update_vin(stub, v, current_owner, args[0], caller_ecert, caller_role, args[1])
			} else if function == "update_colour" 		{ return t.update_colour(stub, v, current_owner, args[0], caller_ecert, caller_role, args[1])
			} else if function == "scrap_vehicle" 		{ return t.scrap_vehicle(stub, v, current_owner, args[0], caller_ecert, caller_role) }
			
																							return nil, errors.New("Function of that name doesn't exist.")
				
		}
	}
}
//=================================================================================================================================	
//	Query - Called on chaincode query. Takes a function name passed and calls that function. Passes the
//  		initial arguments passed are passed on to the called function.
//=================================================================================================================================	
func (t *Chaincode) Query(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {
	
																							if len(args) != 2 { return nil, errors.New("Incorrect number of arguments passed") }

	_, caller_role, err := t.get_user_data(stub, args[0]) 									// Get the details of the caller
		
																							if err != nil { return nil, err }
																							
	v, err := t.retrieve_v5c(stub, args[1])
	
																							if err != nil { return nil, err }
																							
	current_owner, err := t.get_owner(stub, v)
	
																							if err != nil { return nil, err }
	
	if function == "get_all" { return t.get_all(stub, v, current_owner, args[0], caller_role) }
	
																							return nil, errors.New("Received unknown function invocation")
}

//=================================================================================================================================
//	 Create Function
//=================================================================================================================================									
//	 Create Vehicle - Creates the initial JSON for the vehcile and then saves it to the ledger.									
//=================================================================================================================================
func (t *Chaincode) create_vehicle(stub *shim.ChaincodeStub, caller_name string, caller_ecert []byte, caller_role int64, v5cID string) ([]byte, error) {								

	var v Vehicle																																										
		
	v5c_ID         := "\"v5cID\":\""+v5cID+"\", "						// Variables to define the JSON
	vin            := "\"VIN\":0, "
	make           := "\"Make\":\"UNDEFINED\", "
	model          := "\"Model\":\"UNDEFINED\", "
	reg            := "\"Reg\":\"UNDEFINED\", "
	owner          := "\"Owner\":\""+string(caller_ecert)+"\", "
	colour         := "\"Colour\":\"UNDEFINED\", "
	leaseContract  := "\"LeaseContractID\":\"UNDEFINED\", "
	status         := "\"Status\":0, "
	scrapped       := "\"Scrapped\":false"
	
	vehicle_json := "{"+v5c_ID+vin+make+model+reg+owner+colour+leaseContract+status+scrapped+"}" // Concatenates the variables to create the total JSON object
	
	matched, err := regexp.Match("^[A-z][A-z][0-9]{7}", []byte(v5cID))  // matched = true if the v5cID passed fits format of two letters followed by seven digits
	
																		if err != nil { return nil, errors.New("Invalid v5cID") }
	
	if 				v5c_ID  == "" 	 || 
					matched == false    {
																		return nil, errors.New("Invalid v5cID provided")
	}

	err = json.Unmarshal([]byte(vehicle_json), &v)						// Convert the JSON defined above into a vehicle object for go
	
																		if err != nil { return nil, errors.New("Invalid JSON object") }

	record, err := stub.GetState(v.V5cID) 								// If not an error then a record exists so cant create a new car with this V5cID as it must be unique
	
																		if record != nil { return nil, errors.New("Vehicle already exists") }
	
	if 		caller_role != ROLE_AUTHORITY {								// Only the regulator can create a new v5c
																			
																		return nil, errors.New("Permission Denied")
	
	}
	
	_, err  = t.save_changes(stub, v)									
			
																		if err != nil { return nil, err }
	
	_, err  = t.create_log(stub,[]string{ "Create",					// Type of event 
											"Create V5C",				// Event text
											v.V5cID, caller_name})		// Which car and who caused it
	
																		if err != nil { return nil, err }
	
	return nil, nil

}

//=================================================================================================================================
//	 Transfer Functions
//=================================================================================================================================
//	 authority_to_manufacturer
//=================================================================================================================================
func (t *Chaincode) authority_to_manufacturer(stub *shim.ChaincodeStub, v Vehicle, current_owner string, caller_name string, caller_ecert []byte, caller_role int64, recipient_name string, recipient_ecert []byte, recipient_role int64) ([]byte, error) {
	
	if     	v.Status       == STATE_TEMPLATE       &&
			current_owner  == caller_name 		   &&
			caller_role    == ROLE_AUTHORITY  	   && 
			recipient_role == ROLE_MANUFACTURER	   && 
			v.Scrapped	   == false 				  {		// If the roles and users are ok 
	
					v.Owner  = string(recipient_ecert)		// then make the owner the new owner
					v.Status = STATE_MANUFACTURE			// and mark it in the state of manufacture
	
	} else {												// Otherwise if there is an error
	
															return nil, errors.New("Permission Denied")
	
	}
	
	_, err := t.save_changes(stub, v)						// Write new state

															if err != nil {	return nil, err	}
	
															// Log the Event
														
	_, err  = t.create_log(stub,[]string{ "Transfer", 																					// Type of event 
											caller_name + " → " + recipient_name + 															// From -> To
											"&&[" + strconv.Itoa(v.VIN) + "] " + v.Make + " " + v.Model + ", " + v.Colour + ", " + v.Reg, 	// Vehicle Details
											v.V5cID, caller_name, recipient_name})																			// Which car and who caused it

															if err != nil {	return nil, err	}
	
	return nil, nil											// We are Done
	
}

//=================================================================================================================================
//	 manufacturer_to_private
//=================================================================================================================================
func (t *Chaincode) manufacturer_to_private(stub *shim.ChaincodeStub, v Vehicle, current_owner string, caller_name string, caller_ecert []byte, caller_role int64, recipient_name string, recipient_ecert []byte, recipient_role int64) ([]byte, error) {
	
	if 		v.Make 	 == "UNDEFINED" || 					
			v.Model  == "UNDEFINED" || 
			v.Reg 	 == "UNDEFINED" || 
			v.Colour == "UNDEFINED" || 
			v.VIN == 0 				   {					//If any part of the car is undefined it has not bene fully manufacturered so cannot be sent
			
															return nil, errors.New("Car not fully defined")
	}
	
	if 		v.Status 	   == STATE_MANUFACTURE	   && 
			current_owner  == caller_name 		   && 
			caller_role    == ROLE_MANUFACTURER    &&
			recipient_role == ROLE_PRIVATE_ENTITY  && 
			v.Scrapped     == false 				  {
			
					v.Owner = string(recipient_ecert)
					v.Status = STATE_PRIVATE_OWNERSHIP
					
	} else {
															return nil, errors.New("Permission denied")
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { return nil, err }
	
	_, err  = t.create_log(stub,[]string{ "Transfer",
										   caller_name + " → " + recipient_name + 
										   "&&[" + strconv.Itoa(v.VIN) + "] " + v.Make + " " + v.Model + ", " + v.Colour + ", " + v.Reg, 
										   v.V5cID, caller_name, recipient_name})
	
															if err != nil { return nil, err }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 private_to_private
//=================================================================================================================================
func (t *Chaincode) private_to_private(stub *shim.ChaincodeStub, v Vehicle, current_owner string, caller_name string, caller_ecert []byte, caller_role int64, recipient_name string, recipient_ecert []byte, recipient_role int64) ([]byte, error) {
	
	if 		v.Status  	   == STATE_PRIVATE_OWNERSHIP &&
			current_owner  == caller_name 		   	  &&
			caller_role    == ROLE_PRIVATE_ENTITY	  && 
			recipient_role == ROLE_PRIVATE_ENTITY	  &&
			v.Scrapped     == false 					 {
			
					v.Owner = string(recipient_ecert)
					
	} else {
		
															return nil, errors.New("Permission denied")
	
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { return nil, err }
	
	_, err  = t.create_log(stub,[]string{ "Transfer", 
											caller_name + " → " + recipient_name + 
											"&&[" + strconv.Itoa(v.VIN) + "] " + v.Make + " " + v.Model + ", " + v.Colour + ", " + v.Reg,
											v.V5cID, caller_name, recipient_name})
											
															if err != nil { return nil, err }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 private_to_lease_company
//=================================================================================================================================
func (t *Chaincode) private_to_lease_company(stub *shim.ChaincodeStub, v Vehicle, current_owner string, caller_name string, caller_ecert []byte, caller_role int64, recipient_name string, recipient_ecert []byte, recipient_role int64) ([]byte, error) {
	
	if 		v.Status       == STATE_PRIVATE_OWNERSHIP && 
			current_owner  == caller_name 		   	  && 
			caller_role    == ROLE_PRIVATE_ENTITY     && 
			recipient_role == ROLE_LEASE_COMPANY      && 
			v.Scrapped     == false						 {
		
					v.Owner = string(recipient_ecert)
					
	} else {
						
															return nil, errors.New("Permission denied")
	
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { return nil, err }
	
	_, err  = t.create_log(stub,[]string{ "Transfer", 
											caller_name + " → " + recipient_name + 
											"&&[" + strconv.Itoa(v.VIN) + "] " + v.Make + " " + v.Model + ", " + v.Colour + ", " + v.Reg, 
											v.V5cID, caller_name, recipient_name})
	
															if err != nil { return nil, err }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 lease_company_to_private
//=================================================================================================================================
func (t *Chaincode) lease_company_to_private(stub *shim.ChaincodeStub, v Vehicle, current_owner string, caller_name string, caller_ecert []byte, caller_role int64, recipient_name string, recipient_ecert []byte, recipient_role int64) ([]byte, error) {
	
	if		v.Status 	   == STATE_PRIVATE_OWNERSHIP &&
			current_owner  == caller_name 		   	  && 
			caller_role    == ROLE_LEASE_COMPANY      && 
			recipient_role == ROLE_PRIVATE_ENTITY 	  && 
			v.Scrapped	   == false					     {
		
				v.Owner = string(recipient_ecert)
	
	} else {
	
															return nil, errors.New("Permission denied")
	
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { return nil, err }
	
	_, err  = t.create_log(stub,[]string{ "Transfer", 
											caller_name + " → " + recipient_name + 
											"&&[" + strconv.Itoa(v.VIN) + "] " + v.Make + " " + v.Model + ", " + v.Colour + ", " + v.Reg, 
											v.V5cID, caller_name, recipient_name})
											
															if err != nil { return nil, err }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 private_to_scrap_merchant
//=================================================================================================================================
func (t *Chaincode) private_to_scrap_merchant(stub *shim.ChaincodeStub, v Vehicle, current_owner string, caller_name string, caller_ecert []byte, caller_role int64, recipient_name string, recipient_ecert []byte, recipient_role int64) ([]byte, error) {
	
	if		v.Status 	   == STATE_PRIVATE_OWNERSHIP &&
			current_owner  == caller_name 		   	  && 
			caller_role    == ROLE_PRIVATE_ENTITY 	  && 
			recipient_role == ROLE_SCRAP_MERCHANT 	  &&
			v.Scrapped 	   == false 					 {
			
					v.Owner = string(recipient_ecert)
					v.Status = 4
	
	} else {
		
															return nil, errors.New("Permission denied")
	
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { return nil, err }
	
	_, err  = t.create_log(stub,[]string{ "Transfer",
											caller_name + " → " + recipient_name + 
											"&&[" + strconv.Itoa(v.VIN) + "] " + v.Make + " " + v.Model + ", " + v.Colour + ", " + v.Reg, 
											v.V5cID, caller_name, recipient_name})
	
															if err != nil { return nil, err }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 Update Functions
//=================================================================================================================================
//	 update_vin
//=================================================================================================================================
func (t *Chaincode) update_vin(stub *shim.ChaincodeStub, v Vehicle, current_owner string, caller_name string, caller_ecert []byte, caller_role int64, new_value string) ([]byte, error) {
	
	new_vin, err := strconv.Atoi(string(new_value)) 		// will return an error if the new vin contains non numerical chars
	
															if err != nil || len(string(new_value)) != 15 { return nil, errors.New("Invalid value passed for new VIN") }
	
	old_value := v.VIN 
	
	if 		v.Status       == STATE_MANUFACTURE    && 
			current_owner  == caller_name 		   && 
			caller_role    == ROLE_MANUFACTURER    &&
			v.VIN          == 0 				   &&			// Can't change the VIN after its initial assignment
			v.Scrapped     == false 				  {
			
					v.VIN = new_vin							// Update to the new value
	} else {
	
															return nil, errors.New("Permission denied")
		
	}
	
	_, err  = t.save_changes(stub, v)						// Save the changes in the blockchain
	
															if err != nil { return nil, err } 
	
	_, err  = t.create_log(stub,[]string{ "Update",											// event type
											"VIN: "+strconv.Itoa(old_value)+" → "+new_value,	// event text FIELD: OLDVAL -> NEWVAL
											v.V5cID, caller_name})								// Which vehicle and who by
	
															if err != nil { return nil, err }
	
	return nil, nil
	
}


//=================================================================================================================================
//	 update_registration
//=================================================================================================================================
func (t *Chaincode) update_registration(stub *shim.ChaincodeStub, v Vehicle, current_owner string, caller_name string, caller_ecert []byte, caller_role int64, new_value string) ([]byte, error) {
	
	old_value := v.Reg
	
	if		current_owner  == caller_name 		   && 
			caller_role    != ROLE_SCRAP_MERCHANT  && 
			v.Scrapped     == false                   {
			
					v.Reg = new_value
	
	} else {
															return nil, errors.New("Permission denied")
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { return nil, err }
	
	_, err  = t.create_log(stub,[]string{ "Update",
											"Registration: "+string(old_value)+" → "+new_value,
											v.V5cID, caller_name})
	
															if err != nil { return nil, err }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 update_colour
//=================================================================================================================================
func (t *Chaincode) update_colour(stub *shim.ChaincodeStub, v Vehicle, current_owner string, caller_name string, caller_ecert []byte, caller_role int64, new_value string) ([]byte, error) {
	
	old_value := v.Colour
	
	if 		current_owner  == caller_name 		   && 
			caller_role    != ROLE_SCRAP_MERCHANT  && 
			v.Scrapped     == false  				  {
			
					v.Colour = new_value
	} else {
	
															return nil, errors.New("Permission denied")
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { return nil, err }
	
	_, err  = t.create_log(stub,[]string{ "Update",
											"Colour: "+old_value+" → "+new_value,
											v.V5cID, caller_name})
	
															if err != nil { return nil, err }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 update_make
//=================================================================================================================================
func (t *Chaincode) update_make(stub *shim.ChaincodeStub, v Vehicle, current_owner string, caller_name string, caller_ecert []byte, caller_role int64, new_value string) ([]byte, error) {
	
	old_value := v.Make
	
	if 		v.Status       == STATE_MANUFACTURE    &&
			current_owner  == caller_name 		   && 
			caller_role    == ROLE_MANUFACTURER    &&
			v.Scrapped     == false 				  {
			
					v.Make = new_value
	} else {
	
															return nil, errors.New("Permission denied")
	
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { return nil, err }
	
	_, err  = t.create_log(stub,[]string{ "Update",
											"Make: "+old_value+" → "+new_value,
											v.V5cID, caller_name})
	
															if err != nil { return nil, err }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 update_model
//=================================================================================================================================
func (t *Chaincode) update_model(stub *shim.ChaincodeStub, v Vehicle, current_owner string, caller_name string, caller_ecert []byte, caller_role int64, new_value string) ([]byte, error) {

	old_value := v.Model
	
	if 		v.Status       == STATE_MANUFACTURE    &&
			current_owner  == caller_name 		   &&  
			caller_role    == ROLE_MANUFACTURER    &&
			v.Scrapped     == false 				  {
			
					v.Model = new_value
					
	} else {
															return nil, errors.New("Permission denied")
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { return nil, err }
	
	_, err  = t.create_log(stub,[]string{ "Update", 
											"Model: "+old_value+" → "+new_value,
											v.V5cID, caller_name})
											
															if err != nil { return nil, err }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 scrap_vehicle
//=================================================================================================================================
func (t *Chaincode) scrap_vehicle(stub *shim.ChaincodeStub, v Vehicle, current_owner string, caller_name string, caller_ecert []byte, caller_role int64) ([]byte, error) {

	if		v.Status       == STATE_BEING_SCRAPPED && 
			current_owner  == caller_name 		   && 
			caller_role    == ROLE_SCRAP_MERCHANT  && 
			v.Scrapped     == false 				  {
		
					v.Scrapped = true
				
	} else {
		return nil, errors.New("Permission denied")
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { return nil, err }
	
	_, err  = t.create_log(stub,[]string{ "Scrap", 
											"Scrap V5C", 
											v.V5cID, caller_name})
											
															if err != nil { return nil, err }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 Read Functions
//=================================================================================================================================
//	 get_all
//=================================================================================================================================
func (t *Chaincode) get_all(stub *shim.ChaincodeStub, v Vehicle, current_owner string, caller_name string, caller_role int64) ([]byte, error) {
	
	bytes, err := json.Marshal(v)
	
																if err != nil { return nil, errors.New("Invalid vehicle object") }
	
	if 		current_owner == caller_name ||
			caller_role   == ROLE_AUTHORITY 		{
	
					return bytes, nil
		
	} else {
																return nil, errors.New("Permission Denied")	
	}

}

//=================================================================================================================================
//	 Main - main - Starts up the chaincode
//=================================================================================================================================
func main() {

	err := shim.Start(new(Chaincode))
	
															if err != nil { fmt.Printf("Error starting Chaincode: %s", err) }
}
