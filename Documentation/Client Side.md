#Client Side

* [Navigation Stucture](navigation-structure)
* [Pages](pages)
  * [index.html](index.html)
  * [stats.html](stats.html)
  * [regulator-view.html](regulator-view.html)
  * [regulator.html](regulator.html)
  * [manufacturer.html](manufacturer.html)
  * [scrap-merchants.html](scrap-merchants.html)
  * [admin-console](admin-console.html)
* [Configuration File](configuration-file)
  * [config.logo](config.logo)
  * [config.participants](config.participants)

##Navigation Structure

![Navigation Diagram](/Images/Client_Side_Navigation.png)

The client side is designed a number of pages coming from a single page containing a list of links to those pages.

##Pages

###index.html

The navigation page to access the different parts of the application. It contains links to all the other pages of the site. 
The page will poll the height of the Blockchain to check whether the vehicle chaincode has been deployed if not it the links will be greyed out and the user asked to please wait. 
If the chaincode has been deployed but no other transactions have occurred, then the user will be told of the options to create a scenario.

####Participants
N/A

####Files Used
*CSS*
* Style/main.css

*JavaScript*
* JavaScript/config/config.js
* JavaScript/index/index.js

####HTML Element Events
None

####Cookies
None

###stats.html

Displays details about the current state of the Blockchain. The top section contains information about block timings and transactions showing when the last block was added, how tall the Blockchain is, how many transactions were in the last block and the average time between blocks being added to the Blockchain. It also displays graphs showing the time between each of the blocks and the transactions per block. To save loading time it only loads the last 125 blocks.

The “Blockchain Explorer” offers a visual representation of the Blockchain with the blocks loaded in a chain horizontally that is navigable using the arrows either side of it. Users can also search for a specific block using the search bar. By clicking on a block the user can expand it to view details about the block such as its hash, the hash of the previous block and transactions within it along with a timestamp of when the block was added.

The page polls the Blockchain every 10 seconds and if new blocks have been added it will adjust the stats accordingly, pushing the blocks to the end of the Blockchain Explorer also.

####Participants
N/A

####Files Used
*CSS*
* Style/main.css
* Style/stats.css

*JavaScript*
* JavaScript/config/config.js
* JavaScript/stats.js/charts.js
* JavaScript/stats/stats.js

####HTML Element Events
None

####Coookies
None

###regulator-view.html
Displays the transactions from the Blockchain that are applicable to the user. The page calls out to retrieve the transactions and then parses them to pull out the function names, callers and arguments. It then uses the function names to define which type of transaction it was (Create, Transfer, Update, Scrap) and then it formats the transaction into a new row for the table.

Using the menu in the top right of the page the user can select which participant they wish to act as. These participants have different views of the ledger. The regulator is able to view all the transactions that have occurred on the Blockchain whereas the other users can only view transactions that they are directly involved with and the transactions that involved a car the own(ed) up to the point it left/leaves their ownership.

The transactions are able to be sorted by time and V5cID and the user can filter the transactions by their type (Create, Transfer, Update, Failed). The list of transactions is searchable by V5cID so a user can see all the transactions they have permission to view for a particular vehicle.

####Participants
* All

####Files Used
*CSS*
* Style/main.css
* Style/ledger.css

*JavaScript*
* JavaScript/ledger/ledger.js
* JavaScript/config/config.js
* JavaScript/admin/identity.js

####HTML Element Events
	Attribute: #menuBtn
	File:      JavaScript/ledger/ledger.js
	Call Type: onclick
	Function:  toggleMenu()

<!-- -->

	Attribute: #searchBar
	File:      JavaScript/ledger/ledger.js
	Call Type: onkeyup
	Function:  runSearch()

<!-- -->

	Attribute: #searchBar
	File:      JavaScript/ledger/ledger.js
	Call Type: onclick
	Function:  clearSearch()

<!-- -->

	Attribute: .filterBox
	File:      JavaScript/ledger/ledger.js
	Call Type: onclick
	Function:  hideType(this, <type>)

<!-- -->

	Attribute: .sortHldr
	File:      JavaScript/ledger/ledger.js
	Call Type: onclick
	Function:  sortTime(<order>, false)

<!-- -->

	Attribute: .sortHldr
	File:      JavaScript/ledger/ledger.js
	Call Type: onclick
	Function:  sortV5CID(<order>)

####Cookies
	Name:        user
	Value:       <username>
	Description: Stores the username of the current selected user.

###regulator.html

Allows the regulator to create vehicle templates and transfer them on to a manufacturer. 

The page offers a “Create V5C” button which will make the call to produce a new vehicle template. Once the vehicle template is produced the regulator can then transfer it on to one of the manufacturers. The page pulls up a list of all the vehicle templates the regulator owns and these can be selected for transferal to any of the manufacturers.

Currently the page by default has the DVLA logged in. This is unable to be changed as there is only one regulator.

####Participants
* DVLA

####Files Used
*CSS*
* Style/main.css
* Style/contractData.css
* Style/regulator.css

*JavaScript*
* JavaScript/config/config.js
* JavaScript/admin/identity.js
* JavaScript/asset_functions/asset_interaction.js
* JavaScript/asset_functions/asset_read.js
* JavaScript/page_functions/vehicle_popup_functions.js
* JavaScript/page_functions/recipient_popup_functions.js
* JavaScript/page_functions/general_page_functions.js
* JavaScript/page_functions/page_functions.js
* JavaScript/page_functions/scrollbar.js
* JavaScript/participant_functions/recipients.js

####HTML Element Events
	Attribute: body 
	File:      JavaScript/config.js
	Call Type: onload
	Function:  loadParticipant(‘regulator’)

<!-- -->

	Attribute: #createV5C
	File:      JavaScript/asset_functions/asset_interaction.js
	Call Type: onclick
	Function:  createAsset()
####Cookies
	Name:        user
	Value:       <username>
	Description: Stores the username of the current selected user.

<!-- -->

	Name:        confPgRefresh
	Value:       <username>
	Description: Stores the username of the current selected user so if the page refreshes it keeps that user.

###manufacturer.html

Allows the manufacturer to transfer fully defined vehicles to the dealerships.

The page pulls up a list of all vehicles owned by the selected manufacturer and these can be transferred to any of the dealerships.

Currently the page by default has Alfa Romeo logged in. The user can use the menu in the top right to select any one of the other manufacturers.

####Participants
* Alfa Romeo
* Toyota
* Jaguar Land Rover

####Files Used
*CSS*
* Style/main.css
* Style/contractData.css
* Style/manufacturer.css

*JavaScript*
* JavaScript/config/config.js
* JavaScript/admin/identity.js
* JavaScript/asset_functions/asset_interaction.js
* JavaScript/asset_functions/asset_read.js
* JavaScript/page_functions/vehicle_popup_functions.js
* JavaScript/page_functions/recipient_popup_functions.js
* JavaScript/page_functions/general_page_functions.js
* JavaScript/page_functions/page_functions.js
* JavaScript/page_functions/scrollbar.js
* JavaScript/participant_functions/recipients.js

####HTML Element Events

	Attribute: #menuBtn 
	File:      JavaScript/page_functions/general_page_functions.js
	Call Type: onclick
	Function:  toggleMenu()
	
####Cookies
	Name:        user
	Value:       <username>
	Description: Stores the username of the current selected user.

<!-- -->

	Name:        confPgRefresh
	Value:       <username>
	Description: Stores the username of the current selected user so if the page refreshes it keeps that user.

###dealership.html

Allows the dealership to transfer vehicles to the lease companies.

The page pulls up a list of all vehicles owned by the selected dealership and these can be transferred to any of the lease companies.

Currently the page by default has Beechvale Group logged in. The user can use the menu in the top right to select any one of the other dealerships.

####Participants
* Beechvale Group
* Milescape
* Viewers Alfa Romeo

####Files Used
*CSS*
* Style/main.css
* Style/contractData.css
* Style/dealership.css

*JavaScript*
* JavaScript/config/config.js
* JavaScript/admin/identity.js
* JavaScript/asset_functions/asset_interaction.js
* JavaScript/asset_functions/asset_read.js
* JavaScript/page_functions/vehicle_popup_functions.js
* JavaScript/page_functions/recipient_popup_functions.js
* JavaScript/page_functions/general_page_functions.js
* JavaScript/page_functions/page_functions.js
* JavaScript/page_functions/scrollbar.js
* JavaScript/participant_functions/recipients.js

####HTML Element Events

	Attribute: #menuBtn 
	File:      JavaScript/page_functions/general_page_functions.js
	Call Type: onclick
	Function:  toggleMenu()
	
####Cookies
	Name:        user
	Value:       <username>
	Description: Stores the username of the current selected user.

<!-- -->

	Name:        confPgRefresh
	Value:       <username>
	Description: Stores the username of the current selected user so if the page refreshes it keeps that user.

###=#lease-company.html

Allows the lease company to transfer vehicles to the leasees.

The page pulls up a list of all vehicles owned by the selected lease company and these can be transferred to any of the leasees.

Currently the page by default has LeaseCan logged in. The user can use the menu in the top right to select any one of the other lease companies.

####Participants
* LeaseCan
* Every Car Leasing
* Regionwide Vehicle Contracts

####Files Used
*CSS*
* Style/main.css
* Style/contractData.css
* Style/lease_company.css

*JavaScript*
* JavaScript/config/config.js
* JavaScript/admin/identity.js
* JavaScript/asset_functions/asset_interaction.js
* JavaScript/asset_functions/asset_read.js
* JavaScript/page_functions/vehicle_popup_functions.js
* JavaScript/page_functions/recipient_popup_functions.js
* JavaScript/page_functions/general_page_functions.js
* JavaScript/page_functions/page_functions.js
* JavaScript/page_functions/scrollbar.js
* JavaScript/participant_functions/recipients.js

####HTML Element Events

	Attribute: #menuBtn 
	File:      JavaScript/page_functions/general_page_functions.js
	Call Type: onclick
	Function:  toggleMenu()
	
####Cookies
	Name:        user
	Value:       <username>
	Description: Stores the username of the current selected user.

<!-- -->

	Name:        confPgRefresh
	Value:       <username>
	Description: Stores the username of the current selected user so if the page refreshes it keeps that user.

###leasee.html
Allows the leasee to transfer vehicles to the scrap merchants.

The page pulls up a list of all vehicles owned by the selected leasee and these can be transferred to any of the scrap merchants.

Currently the page by default has Joe Payne logged in. The user can use the menu in the top right to select any one of the other leasees.

####Participants
* Joe Payne
* Andrew Hurt
* Anthony O’Dowd

####Files Used
*CSS*
* Style/main.css
* Style/contractData.css
* Style/leasee.css

*JavaScript*
* JavaScript/config/config.js
* JavaScript/admin/identity.js
* JavaScript/asset_functions/asset_interaction.js
* JavaScript/asset_functions/asset_read.js
* JavaScript/page_functions/vehicle_popup_functions.js
* JavaScript/page_functions/recipient_popup_functions.js
* JavaScript/page_functions/general_page_functions.js
* JavaScript/page_functions/page_functions.js
* JavaScript/page_functions/scrollbar.js
* JavaScript/participant_functions/recipients.js

####HTML Element Events

	Attribute: #menuBtn 
	File:      JavaScript/page_functions/general_page_functions.js
	Call Type: onclick
	Function:  toggleMenu()
	
####Cookies
	Name:        user
	Value:       <username>
	Description: Stores the username of the current selected user.

<!-- -->

	Name:        confPgRefresh
	Value:       <username>
	Description: Stores the username of the current selected user so if the page refreshes it keeps that user.

###manufacturer-update.html
Allows the manufacturer to update fields of vehicles that they own fully defined or not.

The page displays a list of all vehicles that the manufacturer owns and allows the user to select the one they wish to edit. A box appears in which the user can enter new values for the VIN, make, model, colour and reg.

Currently the page by default has Alfa Romeo logged in. The user can use the menu in the top right to select any one of the other manufacturers.

####Participants
* Alfa Romeo
* Toyota
* Jaguar Land Rover

####Files Used
*CSS*
* Style/main.css
* Style/contractData.css
* Style/manufacturer.css
* Style/update.css

*JavaScript*
* JavaScript/config/config.js
* JavaScript/admin/identity.js
* JavaScript/asset_functions/asset_interaction.js
* JavaScript/asset_functions/asset_read.js
* JavaScript/page_functions/general_page_functions.js
* JavaScript/page_functions/update_page_functions.js
* JavaScript/page_functions/scrollbar.js
* JavaScript/participant_functions/recipients.js

####HTML Element Events
	Attribute: #menuBtn 
	File:      JavaScript/page_functions/general_page_functions.js
	Call Type: onclick
	Function:  toggleMenu()

<!-- -->

	Attribute: #clsOpt 
	File:      JavaScript/page_functions/update_page_functions.js
	Call Type: onclick
	Function:  closeEditTbl()

<!-- -->

	Attribute: #cclOpt 
	File:      JavaScript/page_functions/update_page_functions.js
	Call Type: onclick
	Function:  closeEditTbl()

<!-- -->

	Attribute: #doneOpt 
	File:      JavaScript/page_functions/update_page_functions.js
	Call Type: onclick
	Function:  validate(this)

<!-- -->

	Attribute: #doneConf
	File:      JavaScript/page_functions/update_page_functions.js
	Call Type: onclick
	Function:  closeConf()

####Cookies
	Name:        user
	Value:       <username>
	Description: Stores the username of the current selected user.

<!-- -->

	Name:        confPgRefresh
	Value:       <username>
	Description: Stores the username of the current selected user so if the page refreshes it keeps that user.

###scrap-merchant.html
Allows the scrap merchant to scrap vehicles.

The page pulls up a list of all vehicles owned by the selected scrap merchant and these can be marked as scrapped

Currently the page by default has Cray Bros (London) logged in. The user can use the menu in the top right to select any one of the other scrap merchants.

####Participants
* Cray Bros (London)
* ScrapIt! UK
* Aston Scrap Centre

####Files Used
*CSS*
* Style/main.css
* Style/contractData.css
* Style/scrap_merchant.css

*JavaScript*
* JavaScript/config/config.js
* JavaScript/admin/identity.js
* JavaScript/asset_functions/asset_interaction.js
* JavaScript/asset_functions/asset_read.js
* JavaScript/page_functions/vehicle_popup_functions.js
* JavaScript/page_functions/recipient_popup_functions.js
* JavaScript/page_functions/general_page_functions.js
* JavaScript/page_functions/page_functions.js
* JavaScript/page_functions/scrollbar.js
* JavaScript/participant_functions/recipients.js

####HTML Element Events
	Attribute: #menuBtn 
	File:      JavaScript/page_functions/general_page_functions.js
	Call Type: onclick
	Function:  toggleMenu()

####Cookies
	Name:        user
	Value:       <username>
	Description: Stores the username of the current selected user.

<!-- -->

	Name:        confPgRefresh
	Value:       <username>
	Description: Stores the username of the current selected user so if the page refreshes it keeps that user.

###admin-console.html

Allows the user to create a number of scenarios and create new participant.

The user can choose to click buttons to create a simple or full scenario. These will run functions that will generate a number of new cars, define them and transfer them through their lifecycle to different owners.

The user can create a new participant to be added to the network selecting their type. The page will auto generate a name address and company name however the user can choose to overwrite these.

####Participants
N/A

####Files Used
*CSS*
* Style/main.css
* Style/admin.css
* Style/stats.css

*JavaScript*
* JavaScript/config/config.js
* JavaScript/admin/admin-console.js
* JavaScript/page_functions/general_page_functions.js

####HTML Element Events
	Attribute: .pgBtn
	File:      JavaScript/admin/admin-console.js
	Call Type: onclick
	Function:  createScenario(<type>)

<!-- -->

	Attribute: #chooseConfBtm img
	File:      JavaScript/admin/admin-console.js
	Call Type: onclick
	Function:  hideSuccess()

<!-- -->

	Attribute: #failBtm img
	File:      JavaScript/admin/admin-console.js
	Call Type: onclick
	Function:  hideError()

<!-- -->

	Attribute: #chooseOptHd img
	File:      JavaScript/admin/admin-console.js
	Call Type: onclick
	Function:  closeEditTbl()

<!-- -->

	Attribute: #chooseOptBtm img
	File:     JavaScript/admin/admin-console.js
	Call Type: onclick
	Function:  closeEditTbl

####Cookies
None

##Configuration File
The client side configuration file defines a number of variables that can be called by other JavaScript files. The file defines a config object that has the fields logo and participant that are each both objects. 

###config.logo
Stores details about the logo to be loaded on each page. These details are used by the loadLogo function so that the height and width appears the same on all the pages and that the page source.

The config.logo object has the properties:

	Name:	     width
	Description: The width the logo should appear as when added to the page using the loadLogo function.

<!-- -->

	Name:        height
	Description: The height the logo should appear as when added to the page using the loadLogo function.

<!-- -->

	Name:        main.src
	Description: The file path to the image that should appear for the logo when the user is of type “main”.

<!-- -->

	Name:        regulator.src
	Description: The file path to the image that should appear for the logo when the user is of type “regulator”.

<!-- -->

	Name:        manufacturer.src
	Description: The file path to the image that should appear for the logo when the user is of type “manufacturer”.

<!-- -->

	Name:        dealership.src
	Description: The file path to the image that should appear for the logo when the user is of type “dealership”.

<!-- -->

	Name:        lease-company.src
	Description: The file path to the image that should appear for the logo when the user is of type “lease-company”.

<!-- -->

	Name:        leasee.src
	Description: The file path to the image that should appear for the logo when the user is of type “leasee”.

<!-- -->

	Name:        scrap-merchant.src
	Description: The file path to the image that should appear for the logo when the user is of type “scrap-merchant”.
	
###config.participants
Store details about the participants who exist on the client side. These details are used by the pages to add the name of the user when it loads them on the page. The format of object to store the users is config.participants.users.<user_type> which then stores an array of user objects that have the fields company, type and user with user being the name such as Lesley. The object also store config.participants.<user_type> which stores the default user object for each of those types which will be the ones used initially when the pages load.
