# Car Leasing Demo

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/jpayne23/Car-Lease-Demo.git)

# Application Background

This application demonstrates the lifecycle of a vehicle from creation to manufacture, through a series of owners and finsishing with the vehicle being scrapped. The demo makes use of Node.js for the server side programming with GoLang used for the chaincode running on the IBM Blockchain network. The demo has two chaincodes, the first defines the rules about what can and can't happen to a vehicle (similar to a v5c) and the second stores a log of what has happeened to a vehicle during its lifetime. Both chaincodes use JSON objects to store their data.

Attributes of a vehicle:

  V5cID           (unique string formed of two chars followed by a 7 digit int, used as the key to identify the vehicle)
  VIN             (15 digit int)
  Make            (String)
  Model           (String)
  Colour          (String)
  Reg             (String)
  Owner           (Ecert of user)
  Scrapped        (Bool)
  Status          (int)
  LeaseContractID (ChaincodeID, currently unused but will store the address of the lease contract for the vehicle)
  
Attributes of a log:

  Name            (String, The name of the log type e.g. Create, Transfer, Update)
  Time            (String, UTC timestamp of when the log was made)
  Text            (String, The message to go with the log)
  Obj_ID          (String, Unique identifier of the object the log refers to e.g. the V5cID)
  Users           (Array of Ecerts, Array of the users involved with the log)
  
  
