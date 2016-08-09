Car Lease Demo
=======

##Deploying the demo##
To deploy to Bluemix simply use the button below then follow the instructions. This will generate the NodeJS server and the Blockchain service for you.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/jpayne23/car-lease-demo-1.git)

To deploy the demo locally follow the instructions [here](Documentation/Installation Guide.md)

##Application overview##
This application is designed to demonstrate how assets can be modeled on the Blockchain using a car leasing scenario. In the scenario vehicles are modeled using Blockchain technology with the following attributes:
| Attribute       | Type                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| V5cID           | Unique string formed of two chars followed by a 7 digit int, used as the key to identify the vehicle  |
| VIN             | 15 digit int                                                                                          |
| Make            | String                                                                                                |
| Model           | String                                                                                                |
| Colour          | String                                                                                                |
| Reg             | String                                                                                                |
| Owner           | Identity of participant                                                                               |
| Scrapped        | Boolean                                                                                               |
| Status          | Int between 0 and 4                                                                                   |
| LeaseContractID | ChaincodeID, currently unused but will store the ID of the lease contract for the vehicle             |

The application is designed to allow participants to interact with the vehicle assets creating, updating and transferring them as their permissions allow. The participants included in the application are as follows:
| Participant    | Permissions                                |
| -------------- | -------------------------------------------|
| Regulator      | Create, Read (All), Transfer               |
| Manufacturer   | Read (Own), Update (All), Transfer         |
| Dealership     | Read (Own), Update (Colour, Reg), Transfer |
| Lease Company  | Read (Own), Update (Colour, Reg), Transfer |
| Leasee         | Read (Own), Update (Colour, Reg), Transfer |
| Scrap Merchant | Read (Own), Scrap                          |

The demonstration allows a view of the ledger that stores all the interactions that the above participants have has with their assets. The ledger view shows the regulator every transaction that has occurred showing who tried to to what at what time and to which vehicle. The ledger view also allows the user to see transactions that they were involved with as well as showing the interactions with the assets they own before they owned them e.g. they can see when it was created.

> Note: The demo currently does not include the ability to lease cars however shows the process of what would happen once the lease has ended and the final payment has been made showing the lease company transferring full ownership of the asset to the leasee.

##Application scenario##
The scenario goes through the lifecycle of a car which has the following stages: 
![Application scenario overview](Images/Scenario_Overview.png)

 1. Vehicle is created as a template by the regulator.
 2. Vehicle template is transferred to the manufacturer.
 3.  Manufacturer updates the vehicle template to define it as a vehicle giving it a make, model, reg etc.
 4. Manufacturer transfers the vehicle to dealership to be sold.
 5. Dealership transfers the vehicle to a lease company.
 6. Lease company transfers the vehicle to a leasee. The vehicle is not leased instead the application is showing what would happen if the lease were to have come to an end and the leasee activated the purchase option.
 7. Leasee transfers the vehicle to a scrap merchant so that it can be scrapped.
 8. Scrap merchant scraps the vehicle.

##Component model##
The demo is built uising a 3 tier architecture with a NodeJS middle tier and HyperLedger fabric as the backend. The NodeJS server serves up the client side pages as well as providing an [API](Documentation/API_Methods.md) that can be called for the application server. This is what interacts with the HyperLedger fabric causing the chaincode to be run implementing the smart contract for a vehicle allowing us to transfer vehicles.

![Technical Component Model](IImages/Technical_Component_Model.png)
