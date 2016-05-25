package main

import (
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"errors"
	"strings"
	"encoding/json"
	"crypto/x509"
	"encoding/pem"
	"net/http"
	"net/url"
	"io/ioutil"
	"strconv"
)

//==============================================================================================================================
//	 Participant types - Each participant type is mapped to an integer which we use to compare to the value stored in a
//						 user's eCert
//==============================================================================================================================
const   AUTHORITY      =  1
const   MANUFACTURER   =  2
const   PRIVATE_ENTITY =  3
const   LEASE_COMPANY  =  4
const   SCRAP_MERCHANT =  5

//==============================================================================================================================
//	 Structure Definitions 
//==============================================================================================================================
//	Chaincode - A blank struct for use with Shim (A HyperLedger included go file used for get/put state
//				and other HyperLedger functions)
//==============================================================================================================================
type  SimpleChaincode struct {
}

type Vehicle_Log struct {
	Name            	string `json:"name"`
	Time			string `json:"time"`
	Text			string `json:"text"`
	Obj_ID			string `json:"obj_id"`
	Users			[]string `json:"users"`
}

type Vehicle_Log_Holder struct {
	Vehicle_Logs 	[]Vehicle_Log `json:"vehicle_logs"`
}

//==============================================================================================================================
//	ECertResponse - Struct for storing the JSON response of retrieving an ECert. JSON OK -> Struct OK
//==============================================================================================================================
type ECertResponse struct {
	OK string `json:"OK"`
}

//==============================================================================================================================
//	Init Function - Called when the user deploys the chaincode sets up base vehicle_logs (blank array)																
//==============================================================================================================================
func (t *SimpleChaincode) Init(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {

	//Args
	//				0
	//			peer_address

	var eh Vehicle_Log_Holder
	
	bytes, err := json.Marshal(eh)
	
															if err != nil { return nil, errors.New("Error creating vehicle_log record") }
																
	err = stub.PutState("Vehicle_Logs", bytes)
	
															if err != nil { return nil, errors.New("Error creating blank vehicle_log array") }

	err = stub.PutState("Peer_Address", []byte(args[0]))
	
															if err != nil { return nil, errors.New("Error storing peer address") }

	return nil, nil
}

//==============================================================================================================================
//	 General Functions
//==============================================================================================================================
//	 get_ecert - Takes the name passed and calls out to the REST API for HyperLedger to retrieve the ecert
//				 for that user. Returns the ecert as retrived including html encoding.
//==============================================================================================================================
func (t *SimpleChaincode) get_ecert(stub *shim.ChaincodeStub, name string) ([]byte, error) {
	
	var cert ECertResponse
	
	peer_address, err := stub.GetState("Peer_Address")
															if err != nil { return nil, errors.New("Error retrieving peer address") }

	response, err := http.Get("http://"+string(peer_address)+"/registrar/"+name+"/ecert") 	// Calls out to the HyperLedger REST API to get the ecert of the user with that name
    
															if err != nil { return nil, errors.New("Error calling ecert API") }
	
	defer response.Body.Close()
	contents, err := ioutil.ReadAll(response.Body)					// Read the response from the http callout into the variable contents
	
															if err != nil { return nil, errors.New("Could not read body") }
	
	err = json.Unmarshal(contents, &cert)
	
															if err != nil { return nil, errors.New("Could not retrieve ecert for user: "+name) }
															
	return []byte(string(cert.OK)), nil
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
}


//==============================================================================================================================
//	Log Functions
//==============================================================================================================================
//	Create Log - Creates a new vehicle_log object using the data passed and the current time then appends it to the vehicle_logs array
//				 before saving the state to the ledger
//==============================================================================================================================
func (t *SimpleChaincode) create_vehicle_log(stub *shim.ChaincodeStub, vehicle_log_name string, vehicle_log_text string, vehicle_log_obj_id string, vehicle_log_time string, vehicle_log_users []string) ([]byte, error) {

	var e Vehicle_Log
	
	e.Name 	 = vehicle_log_name
	e.Time	 = vehicle_log_time
	e.Text	 = vehicle_log_text
	e.Obj_ID = vehicle_log_obj_id
	e.Users	 = vehicle_log_users

	bytes, err := stub.GetState("Vehicle_Logs")
		
															if err != nil { return nil, errors.New("Unable to get vehicle logs") }
	
	var eh Vehicle_Log_Holder
	
	err = json.Unmarshal(bytes, &eh)						
	
															if err != nil {	return nil, errors.New("Corrupt vehicle logs record") }
															
	eh.Vehicle_Logs = append(eh.Vehicle_Logs, e)
	
	bytes, err = json.Marshal(eh)
	
															if err != nil { fmt.Print("Error creating vehicle log record") }

	err = stub.PutState("Vehicle_Logs", bytes)

															if err != nil { return nil, errors.New("Unable to put the state") }

	return nil, nil
}

//==============================================================================================================================
//	get_vehicle_logs - Takes a users name and returns the vehicle logs they are entitled to. If they are the regulator they see
//				       all vehicle logs otherwise it calls a function to get the users vehicle logs
//==============================================================================================================================
func (t *SimpleChaincode) get_vehicle_logs(stub *shim.ChaincodeStub, args []string) ([]byte, error) {

	bytes, err := stub.GetState("Vehicle_Logs")
		
																			if err != nil { return nil, errors.New("Unable to get vehicle logs") }
																	
	var eh Vehicle_Log_Holder
	
	err = json.Unmarshal(bytes, &eh)						
	
																			if err != nil {	return nil, errors.New("Corrupt vehicle log") }
	
	user, err := t.get_username(stub)
	
																			if err != nil {	return nil, errors.New("Could not retrieve caller username") }
	cert, err := t.get_ecert(stub,user)	
	
																			if err != nil {	return nil, errors.New("Could not retrieve eCert for given username") }
	affiliation, err := t.check_affiliation(stub, string(cert))
	
																			if err != nil { return nil, err }													
	if affiliation == AUTHORITY {								// Return all vehicle logs if authority
			
		repNull := strings.Replace(string(bytes), "null", "[]", 1)		// If the array is blank it has the json value null so we need to make it an empty array
		
		return []byte(repNull), nil
	} else {
		return t.get_users_vehicle_logs(stub, eh, user)
	}
	
}

//==============================================================================================================================
//	get_obj_vehicle_logs - Takes a vehicle logs array and returns all the vehicle logs that occured between "from" and "to" in  
//				 	       the array to the Object with ID obj_id
//==============================================================================================================================
func (t *SimpleChaincode) get_obj_vehicle_logs(stub *shim.ChaincodeStub, vehicle_logs []Vehicle_Log, obj_id string, from int, to int, user string) []Vehicle_Log {
	
	var resp []Vehicle_Log
	
	for i := from; i < to; i++ {
		if vehicle_logs[i].Obj_ID == obj_id && !contains(vehicle_logs[i].Users, user) {
			resp = append(resp, vehicle_logs[i])
		}
	}
															
	return resp
}

//==============================================================================================================================
//	get_users_vehicle_logs - Takes a users name and loops through all vehicle_logs to find those with the user as a participant.
//				             When it finds a vehicle log it notes the ID of the object it refers to and then gets all the
//					         vehicle logs from the last time it found a vehicle log for that object to now where the user isn't
//					         involved as they have permission to view the objects history before they were involved
//==============================================================================================================================
func (t *SimpleChaincode) get_users_vehicle_logs(stub *shim.ChaincodeStub, eh Vehicle_Log_Holder, name string) ([]byte, error) {
	
	users_vehicle_logs := []Vehicle_Log{}
	var searched_to map[string]int
	searched_to = make(map[string]int)
	
	for i, vehicle_log := range eh.Vehicle_Logs {
		if contains(vehicle_log.Users, name) {
			users_vehicle_logs = append(users_vehicle_logs, vehicle_log)
			users_vehicle_logs = append(users_vehicle_logs, t.get_obj_vehicle_logs(stub, eh.Vehicle_Logs, vehicle_log.Obj_ID, searched_to[vehicle_log.Obj_ID], i, name)...) // get the vehicle_logs of the car before the user had ownership
			searched_to[vehicle_log.Obj_ID] = i;
		} 
	}
	
	var found_vehicle_logs Vehicle_Log_Holder
	found_vehicle_logs.Vehicle_Logs = users_vehicle_logs
	
	bytes, err := json.Marshal(found_vehicle_logs)
	
															if err != nil { fmt.Print("Error sending record") }
	
	repNull := strings.Replace(string(bytes), "null", "[]", 1)
	return []byte(repNull), nil
}
//==============================================================================================================================
//	 Router Functions
//==============================================================================================================================
//	Invoke - Called on chaincode invoke. Takes a function name passed and calls that function.
//==============================================================================================================================
func (t *SimpleChaincode) Invoke(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {

	// Handle different functions
	if function == "create_vehicle_log" {
		if(len(args) < 5) {
			return nil, errors.New("Invalid number of arguments supplied")
		}
		
		var users_involved []string
		
		for i := 4; i < len(args); i++ {
		
			users_involved = append(users_involved, args[i])
		}
		
		//Args
		//		0			1			2				3			4+
		//	log_name	log_text	log_obj_id		log_time	users_involved
		
		return t.create_vehicle_log(stub, args[0], args[1], args[2], args[3], users_involved) 
	}
	
	return nil, errors.New("Function of that name not found")
}
//==============================================================================================================================
//	Query - Called on chaincode query. Takes a function name passed and calls that function.
//==============================================================================================================================
func (t *SimpleChaincode) Query(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {
	
	if function == "get_vehicle_logs" { 
			return t.get_vehicle_logs(stub, args) 		
	}
	
	return nil, errors.New("Function of that name not found")
}

//=================================================================================================================================
//	 Main - main - Starts up the chaincode
//=================================================================================================================================
func main() {

	err := shim.Start(new(SimpleChaincode))
	
															if err != nil { fmt.Printf("Error starting SimpleChaincode: %s", err) }
}

func contains(s []string, e string) bool {
    for _, a := range s {
        if a == e {
            return true
        }
    }
    return false
}
