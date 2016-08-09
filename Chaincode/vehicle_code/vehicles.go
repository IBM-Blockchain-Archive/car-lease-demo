package main

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"encoding/json"
	"crypto/x509"
	"encoding/pem"
	//Used for HTTP requests
	//"net/http"
	"net/url"
	//Used for HTTP requests
    	//"io/ioutil"
	"regexp"
	//Used when we validate user's role
	//"reflect"
	//"encoding/asn1"
	//Used for https request
	//"crypto/tls"	
)

//==============================================================================================================================
//	 Participant types - Each participant type is mapped to an integer which we use to compare to the value stored in a
//						 user's eCert
//==============================================================================================================================
//CURRENT WORKAROUND USES ROLES CHANGE WHEN OWN USERS CAN BE CREATED SO THAT IT READ 1, 2, 3, 4, 5
const   AUTHORITY      =  1
const   MANUFACTURER   =  2
const   PRIVATE_ENTITY =  3
const   LEASE_COMPANY  =  4
const   SCRAP_MERCHANT =  5	


//==============================================================================================================================
//	 Status types - Asset lifecycle is broken down into 5 statuses, this is part of the business logic to determine what can 
//					be done to the vehicle at points in it's lifecycle
//==============================================================================================================================
const   STATE_TEMPLATE  			=  0
const   STATE_MANUFACTURE  			=  1
const   STATE_PRIVATE_OWNERSHIP 		=  2
const   STATE_LEASED_OUT 			=  3
const   STATE_BEING_SCRAPPED  			=  4

//==============================================================================================================================
//	 Structure Definitions 
//==============================================================================================================================
//	Chaincode - A blank struct for use with Shim (A HyperLedger included go file used for get/put state
//				and other HyperLedger functions)
//==============================================================================================================================
type  SimpleChaincode struct {
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
//	V5C Holder - Defines the structure that holds all the v5cIDs for vehicles that have been created.
//				Used as an index when querying all vehicles.
//==============================================================================================================================

type V5C_Holder struct {
	V5Cs 	[]string `json:"v5cs"`
}

//==============================================================================================================================
//	ECertResponse - Struct for storing the JSON response of retrieving an ECert. JSON OK -> Struct OK
//==============================================================================================================================
/*
type ECertResponse struct {
	OK string `json:"OK"`
	Error string `json:"Error"`
}
*/

//==============================================================================================================================
//	User_and_eCert - Struct for storing the JSON of a user and their ecert
//==============================================================================================================================

type User_and_eCert struct {
	Identity string `json:"identity"`
	eCert string `json:"ecert"`
}		

//==============================================================================================================================
//	Init Function - Called when the user deploys the chaincode																	
//==============================================================================================================================
func (t *SimpleChaincode) Init(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {
	
	//Args
	//				0
	//			peer_address
	
	
	var v5cIDs V5C_Holder
	
	bytes, err := json.Marshal(v5cIDs)
												if err != nil { return nil, errors.New("Error creating V5C_Holder record") }
																
	err = stub.PutState("v5cIDs", bytes)
	
	
	/*
	err = stub.PutState("Peer_Address", []byte(args[0]))
															if err != nil { return nil, errors.New("Error storing peer address") }
	*/

	//var ecert User_and_eCert
	
	for i:=0; i < len(args); i=i+2 {

		//err := json.Unmarshal([]byte(args[i]), &ecert)
															//if err != nil { return nil , errors.New(args[i] + " was invalid. Should be JSON with fields identity and eCert")}
		
		t.add_ecert(stub, args[i], args[i+1])													
		//t.add_ecert(stub, ecert.Identity, ecert.eCert)
	}

	//t.add_ecert(stub, args[0], args[1])
	
	//t.add_ecert(stub, "DVLA", "-----BEGIN+CERTIFICATE-----%0AMIIBoTCCAUegAwIBAgIBATAKBggqhkjOPQQDAzApMQswCQYDVQQGEwJVUzEMMAoG%0AA1UEChMDSUJNMQwwCgYDVQQDEwNlY2EwHhcNMTYwODA4MDkzMjM2WhcNMTYxMTA2%0AMDkzMjM2WjA5MQswCQYDVQQGEwJVUzEMMAoGA1UEChMDSUJNMRwwGgYDVQQDDBNE%0AVkxBXzRcZ3JvdXAxXDAwMDAxMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEgj2o%0An6z%2Bt2bIGOZNtth86ToxRox7%2FemsVTvMFSmkvq0lAbIgqeRveF3IBj6rfEgS0iWH%0AgiWWowozZiOtbfWuyaNQME4wDgYDVR0PAQH%2FBAQDAgeAMAwGA1UdEwEB%2FwQCMAAw%0ADQYDVR0OBAYEBAECAwQwDwYDVR0jBAgwBoAEAQIDBDAOBgZRAwQFBgcBAf8EATEw%0ACgYIKoZIzj0EAwMDSAAwRQIhAKz0nFR1bnQZsg8vcul%2F4HVAuReHbSDwyw1IFknF%0AS%2BYTAiAzptnd07wp%2FjjuONCvFQRB3o8PqLQJV3knR86Cjfg2jA%3D%3D%0A-----END+CERTIFICATE-----%0A")	

	return nil, nil
}

//==============================================================================================================================
//	 General Functions
//==============================================================================================================================
//	 get_ecert - Takes the name passed and calls out to the REST API for HyperLedger to retrieve the ecert
//				 for that user. Returns the ecert as retrived including html encoding.
//==============================================================================================================================
func (t *SimpleChaincode) get_ecert(stub *shim.ChaincodeStub, name string) ([]byte, error) {
	
	/* ORGINAL WAY WE GOT ECERTS USING CALLOUT
	
	var cert ECertResponse
	
	peer_address, err := stub.GetState("Peer_Address")
															if err != nil { return nil, errors.New("Error retrieving peer address") }
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr}
	response, err := client.Get(string(peer_address)+"/registrar/"+name+"/ecert")
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr}
	response, err := client.Get("http://42be62e3-e345-4ac6-aec5-da128a0128ec_vp0.us.blockchain.ibm.com:443/registrar/DVLA_5/ecert")
															
															if err != nil { return nil, errors.New("Error calling ecert API: "+err.Error()) }
	
	defer response.Body.Close()
	contents, err := ioutil.ReadAll(response.Body)					// Read the response from the http callout into the variable contents
															
															if err != nil { return nil, errors.New("Could not read body") }
	err = json.Unmarshal(contents, &cert)
	
															if err != nil { return nil, errors.New("Could not retrieve ecert for user: "+name) }										
															
															if cert.Error != "" { fmt.Println("GET ECERT ERRORED: ", cert.Error); return nil, errors.New(cert.Error)}
	*/
/*

	var columns []shim.Column
		col1 := shim.Column{Value: &shim.Column_String_{String_: name}}
		columns = append(columns, col1)
	row, err := stub.GetRow("E_Certs", columns)

															if err != nil { return 	nil, errors.New("Unable to read eCerts table. Error: "+err.Error()) } 

	cert := row.Columns[1].GetString_()
	
	return []byte(cert), nil

*/

	ecert, err := stub.GetState(name)

	if err != nil { return nil, errors.New("Couldn't retrieve ecert for user " + name) }
	
	return ecert, nil
}

//==============================================================================================================================
//	 add_ecert - Adds a new ecert and user pair to the table of ecerts
//==============================================================================================================================

func (t *SimpleChaincode) add_ecert(stub *shim.ChaincodeStub, name string, ecert string) ([]byte, error) {
	
	
	err := stub.PutState(name, []byte(ecert))

	if err == nil {
		return nil, errors.New("Error storing eCert for user " + name + " identity: " + ecert)
	}
	
	return nil, nil

/*
	var columns []*shim.Column
	col1 := shim.Column{Value: &shim.Column_String_{String_: name}}
	col2 := shim.Column{Value: &shim.Column_String_{String_: ecert}}
	columns = append(columns, &col1)
	columns = append(columns, &col2)

	row := shim.Row{Columns: columns}
	ok, err := stub.InsertRow("E_Certs", row)
	if err != nil {
		return nil, errors.New("Insert eCert to table failed. Error: " + err.Error())
	}
	if !ok {
		return nil, errors.New("Insert eCert operation failed. Row with given key already exists")
	}
	
	return nil, nil
*/

}

//==============================================================================================================================
//	 get_caller - Retrieves the username of the user who invoked the chaincode.
//				  Returns the username as a string.
//==============================================================================================================================

func (t *SimpleChaincode) get_username(stub *shim.ChaincodeStub) (string, error) {

	bytes, err := stub.GetCallerCertificate();
															if err != nil { return "", errors.New("Couldn't retrieve caller certificate") }
	x509Cert, err := x509.ParseCertificate(bytes);				// Extract Certificate from result of GetCallerCertificate						
															if err != nil { return "", errors.New("Couldn't parse certificate")	}
															
	return x509Cert.Subject.CommonName, nil
}

//==============================================================================================================================
//	 check_affiliation - Takes an ecert as a string, decodes it to remove html encoding then parses it and checks the
// 				  		certificates common name. The affiliation is stored as part of the common name.
//==============================================================================================================================

func (t *SimpleChaincode) check_affiliation(stub *shim.ChaincodeStub, cert string) (int, error) {																																																					
	

	decodedCert, err := url.QueryUnescape(cert);    				// make % etc normal //
	
															if err != nil { return -1, errors.New("Could not decode certificate") }
	
	pem, _ := pem.Decode([]byte(decodedCert))           				// Make Plain text   //

	x509Cert, err := x509.ParseCertificate(pem.Bytes);				// Extract Certificate from argument //
														
													if err != nil { return -1, errors.New("Couldn't parse certificate")	}

	cn := x509Cert.Subject.CommonName
	
	res := strings.Split(cn,"\\")
	
	affiliation, _ := strconv.Atoi(res[2])
	
	return affiliation, nil
	
	/*
	ECertSubjectRole := asn1.ObjectIdentifier{2, 1, 3, 4, 5, 6, 7}																														
	
	decodedCert, err := url.QueryUnescape(cert);    		// make % etc normal //
	
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
	
	return int(role), nil
	*/
	
}

//==============================================================================================================================
//	 get_caller_data - Calls the get_ecert and check_role functions and returns the ecert and role for the
//					 name passed.
//==============================================================================================================================

func (t *SimpleChaincode) get_caller_data(stub *shim.ChaincodeStub) (string, int, error){	

	user, err := t.get_username(stub)
																		if err != nil { return "", -1, err }
																		
	ecert, err := t.get_ecert(stub, user);					
																if err != nil { return "", -1, err }

	affiliation, err := t.check_affiliation(stub,string(ecert));			
																		if err != nil { return "", -1, err }

	return user, affiliation, nil
}

//==============================================================================================================================
//	 retrieve_v5c - Gets the state of the data at v5cID in the ledger then converts it from the stored 
//					JSON into the Vehicle struct for use in the contract. Returns the Vehcile struct.
//					Returns empty v if it errors.
//==============================================================================================================================
func (t *SimpleChaincode) retrieve_v5c(stub *shim.ChaincodeStub, v5cID string) (Vehicle, error) {
	
	var v Vehicle

	bytes, err := stub.GetState(v5cID);					
				
															if err != nil {	fmt.Printf("RETRIEVE_V5C: Failed to invoke vehicle_code: %s", err); return v, errors.New("RETRIEVE_V5C: Error retrieving vehicle with v5cID = " + v5cID) }

	err = json.Unmarshal(bytes, &v);						

															if err != nil {	fmt.Printf("RETRIEVE_V5C: Corrupt vehicle record "+string(bytes)+": %s", err); return v, errors.New("RETRIEVE_V5C: Corrupt vehicle record"+string(bytes))	}
	
	return v, nil
}

//==============================================================================================================================
// save_changes - Writes to the ledger the Vehicle struct passed in a JSON format. Uses the shim file's 
//				  method 'PutState'.
//==============================================================================================================================
func (t *SimpleChaincode) save_changes(stub *shim.ChaincodeStub, v Vehicle) (bool, error) {
	 
	bytes, err := json.Marshal(v)
	
																if err != nil { fmt.Printf("SAVE_CHANGES: Error converting vehicle record: %s", err); return false, errors.New("Error converting vehicle record") }

	err = stub.PutState(v.V5cID, bytes)
	
																if err != nil { fmt.Printf("SAVE_CHANGES: Error storing vehicle record: %s", err); return false, errors.New("Error storing vehicle record") }
	
	return true, nil
}

//==============================================================================================================================
//	 Router Functions
//==============================================================================================================================
//	Invoke - Called on chaincode invoke. Takes a function name passed and calls that function. Converts some
//		  initial arguments passed to other things for use in the called function e.g. name -> ecert
//==============================================================================================================================
func (t *SimpleChaincode) Invoke(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {
	
	caller, caller_affiliation, err := t.get_caller_data(stub)

	if err != nil { return nil, errors.New("Error retrieving caller information")}

	
	if function == "create_vehicle" { return t.create_vehicle(stub, caller, caller_affiliation, args[0])
	} else { 																				// If the function is not a create then there must be a car so we need to retrieve the car.
		
		argPos := 1
		
		if function == "scrap_vehicle" {																// If its a scrap vehicle then only two arguments are passed (no update value) all others have three arguments and the v5cID is expected in the last argument
			argPos = 0
		}
		
		v, err := t.retrieve_v5c(stub, args[argPos])
		
																							if err != nil { fmt.Printf("INVOKE: Error retrieving v5c: %s", err); return nil, errors.New("Error retrieving v5c") }
																		
		if strings.Contains(function, "update") == false           && 
		   function 							!= "scrap_vehicle"    { 									// If the function is not an update or a scrappage it must be a transfer so we need to get the ecert of the recipient.
			
				ecert, err := t.get_ecert(stub, args[0]);					
				
																		if err != nil { return nil, err }

				rec_affiliation, err := t.check_affiliation(stub,string(ecert));	
				
																		if err != nil { return nil, err }
				
				if 		   function == "authority_to_manufacturer" { return t.authority_to_manufacturer(stub, v, caller, caller_affiliation, args[0], rec_affiliation)
				} else if  function == "manufacturer_to_private"   { return t.manufacturer_to_private(stub, v, caller, caller_affiliation, args[0], rec_affiliation)
				} else if  function == "private_to_private" 	   { return t.private_to_private(stub, v, caller, caller_affiliation, args[0], rec_affiliation)
				} else if  function == "private_to_lease_company"  { return t.private_to_lease_company(stub, v, caller, caller_affiliation, args[0], rec_affiliation)
				} else if  function == "lease_company_to_private"  { return t.lease_company_to_private(stub, v, caller, caller_affiliation, args[0], rec_affiliation)
				} else if  function == "private_to_scrap_merchant" { return t.private_to_scrap_merchant(stub, v, caller, caller_affiliation, args[0], rec_affiliation)
				}
			
		} else if function == "update_make"  	    { return t.update_make(stub, v, caller, caller_affiliation, args[0])
		} else if function == "update_model"        { return t.update_model(stub, v, caller, caller_affiliation, args[0])
		} else if function == "update_registration" { return t.update_registration(stub, v, caller, caller_affiliation, args[0])
		} else if function == "update_vin" 			{ return t.update_vin(stub, v, caller, caller_affiliation, args[0])
		} else if function == "update_colour" 		{ return t.update_colour(stub, v, caller, caller_affiliation, args[0])
		} else if function == "scrap_vehicle" 		{ return t.scrap_vehicle(stub, v, caller, caller_affiliation) }
		
																						return nil, errors.New("Function of that name doesn't exist.")
			
	}
}
//=================================================================================================================================	
//	Query - Called on chaincode query. Takes a function name passed and calls that function. Passes the
//  		initial arguments passed are passed on to the called function.
//=================================================================================================================================	
func (t *SimpleChaincode) Query(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {
													
	caller, caller_affiliation, err := t.get_caller_data(stub)

																							if err != nil { fmt.Printf("QUERY: Error retrieving caller details", err); return nil, errors.New("QUERY: Error retrieving caller details: "+err.Error()) }
															
	if function == "get_vehicle_details" { 
	
			if len(args) != 1 { fmt.Printf("Incorrect number of arguments passed"); return nil, errors.New("QUERY: Incorrect number of arguments passed") }
	
	
			v, err := t.retrieve_v5c(stub, args[0])
																							if err != nil { fmt.Printf("QUERY: Error retrieving v5c: %s", err); return nil, errors.New("QUERY: Error retrieving v5c "+err.Error()) }
	
			return t.get_vehicle_details(stub, v, caller, caller_affiliation)
			
	} else if function == "get_vehicles" {
			return t.get_vehicles(stub, caller, caller_affiliation)
	} else if function == "get_ecert" {
			return t.get_ecert(stub, args[0])
	}

	return nil, errors.New("Received unknown function invocation")

}

//=================================================================================================================================
//	 Create Function
//=================================================================================================================================									
//	 Create Vehicle - Creates the initial JSON for the vehcile and then saves it to the ledger.									
//=================================================================================================================================
func (t *SimpleChaincode) create_vehicle(stub *shim.ChaincodeStub, caller string, caller_affiliation int, v5cID string) ([]byte, error) {								

	var v Vehicle																																										
	
	v5c_ID         := "\"v5cID\":\""+v5cID+"\", "							// Variables to define the JSON
	vin            := "\"VIN\":0, "
	make           := "\"Make\":\"UNDEFINED\", "
	model          := "\"Model\":\"UNDEFINED\", "
	reg            := "\"Reg\":\"UNDEFINED\", "
	owner          := "\"Owner\":\""+caller+"\", "
	colour         := "\"Colour\":\"UNDEFINED\", "
	leaseContract  := "\"LeaseContractID\":\"UNDEFINED\", "
	status         := "\"Status\":0, "
	scrapped       := "\"Scrapped\":false"
	
	vehicle_json := "{"+v5c_ID+vin+make+model+reg+owner+colour+leaseContract+status+scrapped+"}" 	// Concatenates the variables to create the total JSON object
	
	matched, err := regexp.Match("^[A-z][A-z][0-9]{7}", []byte(v5cID))  				// matched = true if the v5cID passed fits format of two letters followed by seven digits
	
												if err != nil { fmt.Printf("CREATE_VEHICLE: Invalid v5cID: %s", err); return nil, errors.New("Invalid v5cID") }
	
	if 				v5c_ID  == "" 	 || 
					matched == false    {
																		fmt.Printf("CREATE_VEHICLE: Invalid v5cID provided");
																		return nil, errors.New("Invalid v5cID provided")
	}

	err = json.Unmarshal([]byte(vehicle_json), &v)							// Convert the JSON defined above into a vehicle object for go
	
																		if err != nil { return nil, errors.New("Invalid JSON object") }

	record, err := stub.GetState(v.V5cID) 								// If not an error then a record exists so cant create a new car with this V5cID as it must be unique
	
																		if record != nil { return nil, errors.New("Vehicle already exists") }
	
	if 	caller_affiliation != AUTHORITY {							// Only the regulator can create a new v5c

																		return nil, errors.New("Permission Denied")
	}
	
	_, err  = t.save_changes(stub, v)									
			
																		if err != nil { fmt.Printf("CREATE_VEHICLE: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }
	
	bytes, err := stub.GetState("v5cIDs")

																		if err != nil { return nil, errors.New("Unable to get v5cIDs") }
																		
	var v5cIDs V5C_Holder
	
	err = json.Unmarshal(bytes, &v5cIDs)
	
																		if err != nil {	return nil, errors.New("Corrupt V5C_Holder record") }
															
	v5cIDs.V5Cs = append(v5cIDs.V5Cs, v5cID)
	
	
	bytes, err = json.Marshal(v5cIDs)
	
															if err != nil { fmt.Print("Error creating V5C_Holder record") }

	err = stub.PutState("v5cIDs", bytes)

															if err != nil { return nil, errors.New("Unable to put the state") }
	
	return nil, nil

}

//=================================================================================================================================
//	 Transfer Functions
//=================================================================================================================================
//	 authority_to_manufacturer
//=================================================================================================================================
func (t *SimpleChaincode) authority_to_manufacturer(stub *shim.ChaincodeStub, v Vehicle, caller string, caller_affiliation int, recipient_name string, recipient_affiliation int) ([]byte, error) {
	
	if     	v.Status				== STATE_TEMPLATE	&&
			v.Owner					== caller			&&
			caller_affiliation		== AUTHORITY		&&
			recipient_affiliation	== MANUFACTURER		&&
			v.Scrapped				== false			{		// If the roles and users are ok 
	
					v.Owner  = recipient_name		// then make the owner the new owner
					v.Status = STATE_MANUFACTURE			// and mark it in the state of manufacture
	
	} else {									// Otherwise if there is an error
	
															fmt.Printf("AUTHORITY_TO_MANUFACTURER: Permission Denied");
															return nil, errors.New("Permission Denied")
	
	}
	
	_, err := t.save_changes(stub, v)						// Write new state

															if err != nil {	fmt.Printf("AUTHORITY_TO_MANUFACTURER: Error saving changes: %s", err); return nil, errors.New("Error saving changes")	}
														
	return nil, nil									// We are Done
	
}

//=================================================================================================================================
//	 manufacturer_to_private
//=================================================================================================================================
func (t *SimpleChaincode) manufacturer_to_private(stub *shim.ChaincodeStub, v Vehicle, caller string, caller_affiliation int, recipient_name string, recipient_affiliation int) ([]byte, error) {
	
	if 		v.Make 	 == "UNDEFINED" || 					
			v.Model  == "UNDEFINED" || 
			v.Reg 	 == "UNDEFINED" || 
			v.Colour == "UNDEFINED" || 
			v.VIN == 0				{					//If any part of the car is undefined it has not bene fully manufacturered so cannot be sent
															fmt.Printf("MANUFACTURER_TO_PRIVATE: Car not fully defined")
															return nil, errors.New("Car not fully defined")
	}
	
	if 		v.Status				== STATE_MANUFACTURE	&& 
			v.Owner					== caller				&& 
			caller_affiliation		== MANUFACTURER			&&
			recipient_affiliation	== PRIVATE_ENTITY		&& 
			v.Scrapped     == false							{
			
					v.Owner = recipient_name
					v.Status = STATE_PRIVATE_OWNERSHIP
					
	} else {
															return nil, errors.New("Permission denied")
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { fmt.Printf("MANUFACTURER_TO_PRIVATE: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 private_to_private
//=================================================================================================================================
func (t *SimpleChaincode) private_to_private(stub *shim.ChaincodeStub, v Vehicle, caller string, caller_affiliation int, recipient_name string, recipient_affiliation int) ([]byte, error) {
	
	if 		v.Status				== STATE_PRIVATE_OWNERSHIP	&&
			v.Owner					== caller					&&
			caller_affiliation		== PRIVATE_ENTITY			&& 
			recipient_affiliation	== PRIVATE_ENTITY			&&
			v.Scrapped				== false					{
			
					v.Owner = recipient_name
					
	} else {
		
															return nil, errors.New("Permission denied")
	
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { fmt.Printf("PRIVATE_TO_PRIVATE: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 private_to_lease_company
//=================================================================================================================================
func (t *SimpleChaincode) private_to_lease_company(stub *shim.ChaincodeStub, v Vehicle, caller string, caller_affiliation int, recipient_name string, recipient_affiliation int) ([]byte, error) {
	
	if 		v.Status				== STATE_PRIVATE_OWNERSHIP	&& 
			v.Owner					== caller					&& 
			caller_affiliation		== PRIVATE_ENTITY			&& 
			recipient_affiliation	== LEASE_COMPANY			&& 
			v.Scrapped     			== false					{
		
					v.Owner = recipient_name
					
	} else {
															return nil, errors.New("Permission denied")
	}
	
	_, err := t.save_changes(stub, v)
															if err != nil { fmt.Printf("PRIVATE_TO_LEASE_COMPANY: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 lease_company_to_private
//=================================================================================================================================
func (t *SimpleChaincode) lease_company_to_private(stub *shim.ChaincodeStub, v Vehicle, caller string, caller_affiliation int, recipient_name string, recipient_affiliation int) ([]byte, error) {
	
	if		v.Status				== STATE_PRIVATE_OWNERSHIP	&&
			v.Owner  				== caller					&& 
			caller_affiliation		== LEASE_COMPANY			&& 
			recipient_affiliation	== PRIVATE_ENTITY			&& 
			v.Scrapped				== false					{
		
				v.Owner = recipient_name
	
	} else {
															return nil, errors.New("Permission denied")
	}
	
	_, err := t.save_changes(stub, v)
															if err != nil { fmt.Printf("LEASE_COMPANY_TO_PRIVATE: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 private_to_scrap_merchant
//=================================================================================================================================
func (t *SimpleChaincode) private_to_scrap_merchant(stub *shim.ChaincodeStub, v Vehicle, caller string, caller_affiliation int, recipient_name string, recipient_affiliation int) ([]byte, error) {
	
	if		v.Status				== STATE_PRIVATE_OWNERSHIP	&&
			v.Owner					== caller					&& 
			caller_affiliation		== PRIVATE_ENTITY			&& 
			recipient_affiliation	== SCRAP_MERCHANT			&&
			v.Scrapped				== false					{
			
					v.Owner = recipient_name
					v.Status = STATE_BEING_SCRAPPED
	
	} else {
		
															return nil, errors.New("Permission denied")
	
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { fmt.Printf("PRIVATE_TO_SCRAP_MERCHANT: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 Update Functions
//=================================================================================================================================
//	 update_vin
//=================================================================================================================================
func (t *SimpleChaincode) update_vin(stub *shim.ChaincodeStub, v Vehicle, caller string, caller_affiliation int, new_value string) ([]byte, error) {
	
	new_vin, err := strconv.Atoi(string(new_value)) 		                // will return an error if the new vin contains non numerical chars
	
															if err != nil || len(string(new_value)) != 15 { return nil, errors.New("Invalid value passed for new VIN") }
	
	if 		v.Status			== STATE_MANUFACTURE	&& 
			v.Owner				== caller				&&
			caller_affiliation	== MANUFACTURER			&&
			v.VIN				== 0					&&			// Can't change the VIN after its initial assignment
			v.Scrapped			== false				{
			
					v.VIN = new_vin					// Update to the new value
	} else {
	
															return nil, errors.New("Permission denied")
		
	}
	
	_, err  = t.save_changes(stub, v)						// Save the changes in the blockchain
	
															if err != nil { fmt.Printf("UPDATE_VIN: Error saving changes: %s", err); return nil, errors.New("Error saving changes") } 
	
	return nil, nil
	
}


//=================================================================================================================================
//	 update_registration
//=================================================================================================================================
func (t *SimpleChaincode) update_registration(stub *shim.ChaincodeStub, v Vehicle, caller string, caller_affiliation int, new_value string) ([]byte, error) {

	
	if		v.Owner				== caller			&& 
			caller_affiliation	!= SCRAP_MERCHANT	&&
			v.Scrapped			== false			{
			
					v.Reg = new_value
	
	} else {
															return nil, errors.New("Permission denied")
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { fmt.Printf("UPDATE_REGISTRATION: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 update_colour
//=================================================================================================================================
func (t *SimpleChaincode) update_colour(stub *shim.ChaincodeStub, v Vehicle, caller string, caller_affiliation int, new_value string) ([]byte, error) {
	
	if 		v.Owner				== caller				&&
			caller_affiliation	== MANUFACTURER			&&/*((v.Owner				== caller			&&
			caller_affiliation	== MANUFACTURER)		||
			caller_affiliation	== AUTHORITY)			&&*/
			v.Scrapped			== false				{
			
					v.Colour = new_value
	} else {
	
															return nil, errors.New("Permission denied")
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { fmt.Printf("UPDATE_COLOUR: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 update_make
//=================================================================================================================================
func (t *SimpleChaincode) update_make(stub *shim.ChaincodeStub, v Vehicle, caller string, caller_affiliation int, new_value string) ([]byte, error) {
	
	if 		v.Status			== STATE_MANUFACTURE	&&
			v.Owner				== caller				&& 
			caller_affiliation	== MANUFACTURER			&&
			v.Scrapped			== false				{
			
					v.Make = new_value
	} else {
	
															return nil, errors.New("Permission denied")
	
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { fmt.Printf("UPDATE_MAKE: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 update_model
//=================================================================================================================================
func (t *SimpleChaincode) update_model(stub *shim.ChaincodeStub, v Vehicle, caller string, caller_affiliation int, new_value string) ([]byte, error) {
	
	if 		v.Status			== STATE_MANUFACTURE	&&
			v.Owner				== caller				&& 
			caller_affiliation	== MANUFACTURER			&&
			v.Scrapped			== false				{
			
					v.Model = new_value
					
	} else {
															return nil, errors.New("Permission denied")
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { fmt.Printf("UPDATE_MODEL: Error saving changes: %s", err); return nil, errors.New("Error saving changes") }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 scrap_vehicle
//=================================================================================================================================
func (t *SimpleChaincode) scrap_vehicle(stub *shim.ChaincodeStub, v Vehicle, caller string, caller_affiliation int) ([]byte, error) {

	if		v.Status			== STATE_BEING_SCRAPPED	&& 
			v.Owner				== caller				&& 
			caller_affiliation	== SCRAP_MERCHANT		&& 
			v.Scrapped			== false				{
		
					v.Scrapped = true
				
	} else {
		return nil, errors.New("Permission denied")
	}
	
	_, err := t.save_changes(stub, v)
	
															if err != nil { fmt.Printf("SCRAP_VEHICLE: Error saving changes: %s", err); return nil, errors.New("SCRAP_VEHICLError saving changes") }
	
	return nil, nil
	
}

//=================================================================================================================================
//	 Read Functions
//=================================================================================================================================
//	 get_vehicle_details
//=================================================================================================================================
func (t *SimpleChaincode) get_vehicle_details(stub *shim.ChaincodeStub, v Vehicle, caller string, caller_affiliation int) ([]byte, error) {
	
	bytes, err := json.Marshal(v)
	
																if err != nil { return nil, errors.New("GET_VEHICLE_DETAILS: Invalid vehicle object") }
																
	if 		v.Owner				== caller		||
			caller_affiliation	== AUTHORITY	{
			
					return bytes, nil		
	} else {
																return nil, errors.New("Permission Denied")	
	}

}

//=================================================================================================================================
//	 get_vehicle_details
//=================================================================================================================================

func (t *SimpleChaincode) get_vehicles(stub *shim.ChaincodeStub, caller string, caller_affiliation int) ([]byte, error) {

	bytes, err := stub.GetState("v5cIDs")
		
																			if err != nil { return nil, errors.New("Unable to get v5cIDs") }
																	
	var v5cIDs V5C_Holder
	
	err = json.Unmarshal(bytes, &v5cIDs)						
	
																			if err != nil {	return nil, errors.New("Corrupt V5C_Holder") }
	
	result := "["
	
	var temp []byte
	var v Vehicle
	
	for _, v5c := range v5cIDs.V5Cs {
		
		v, err = t.retrieve_v5c(stub, v5c)
		
		if err != nil {return nil, errors.New("Failed to retrieve V5C")}
		
		temp, err = t.get_vehicle_details(stub, v, caller, caller_affiliation)
		
		if err == nil {
			result += string(temp) + ","	
		}
	}
	
	if len(result) == 1 {
		result = "[]"
	} else {
		result = result[:len(result)-1] + "]"
	}
	
	return []byte(result), nil
}

//=================================================================================================================================
//	 Main - main - Starts up the chaincode
//=================================================================================================================================
func main() {

	err := shim.Start(new(SimpleChaincode))
	
															if err != nil { fmt.Printf("Error starting Chaincode: %s", err) }
}
