#Use Case Breakdown

##Creating a vehicle template
For a new vehicle to be produced by a manufacturer the regulator needs to create a new vehicle template that the manufacturer can fill in. The user navigates to the Web UI and makes a call to the NodeJS server to create a new vehicle. The NodeJS server then calls the HyperLedger API to call a function in the vehicle chaincode to make a new vehicle providing the name of the user who called it and an V5cID for the new V5C. The chaincode validates that the user calling it is the regulator and validates that the V5cID provided is not already in use. The chaincode then writes the new vehicle to ledger setting the owner to be the regulator.

![Create vehicle sequence diagram](/Images/Use case diagrams/Create_Vehicle_Sequence_Diagram.png)

##Transferring a vehicle
When a user sells their vehicle they must update the owner field so that the participant who has purchased the vehicle is the new owner. The user navigates to the web UI and selects the vehicle(s) that they wish to transfer and the recipient they wish to make the new owner. This web UI makes a call to the NodeJS server calling it for each of the vehicles that the user has requested be transferred passing the V5cID, type of transfer (e.g. manufacturer → private) and recipient name. The NodeJS server then calls HyperLedger to invoke the chaincode to transfer ownership. The chaincode then runs the function to change ownership retrieving the vehicle with the V5cID passed then checking that the user calling has the correct permissions (e.g. is the owner) and the recipient has the correct permissions to receive the vehicle (e.g. a vehicle cannot go from private ownership to a manufacturer). The chaincode then updates the owner field and writes the updated vehicle to ledger.

![Transfer vehicle sequence diagram](/Images/Use case diagrams/Transfer_Vehicle_Sequence_Diagram.png)

##Updating a vehicle (Manufacturer)
Before a vehicle can be transferred from a manufacturer to dealership it must first be updated so that the vehicle is defined. To do this the manufacturer navigates to the web UI and enters values for the VIN, make, model, reg and colour. These values are then sent to the NodeJS server individually so VIN then make etc. The NodeJS server calls out to HyperLedger to invoke the appropriate function on the chaincode to make that update passing the caller, V5cID of the vehicle and the new value. The chaincode function update the appropriate field making sure that the user has permission to perform the update (e.g. is the owner) and is the right type to perform the update (e.g. a leasee cannot update the VIN of a vehicle). If the permissions work out it updates the vehicle with the new value and writes to the ledger these changes.

![Update vehicle sequence diagram](/Images/Use case diagrams/Update_Vehicle_Sequence_Diagram.png)
 
##Scrapping a vehicle
When a scrap merchant wishes to scrap a vehicle they need to mark it as so on the ledger sop that the vehicle cannot be transferred but is still able to be accessed. To do this the scrap merchant uses the web UI to select a vehicle(s) to be scrapped. The web UI sends each of the selected vehicles V5cIDs individually to the NodeJS server which then passes the caller and V5cID to HyperLedger to invoke the scrap function on the chaincode. The chaincode then retrieves the vehicle with the V5cID passed and checks if the caller is a scrap merchant and also the owner. It then updates the scrapped field of the vehicle to be true and writes that to the ledger. 
 
![Scrap vehicle sequence diagram](/Images/Use case diagrams/Scrap_Vehicle_Sequence_Diagram.png)
