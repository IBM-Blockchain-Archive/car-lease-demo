/*eslint-env node*/

var config = {};

/******* Images *******/

// Variable Setup
config.logo = {};
config.logo.main = {};
config.logo.regulator = {};
config.logo.manufacturer = {};
config.logo.dealership = {};
config.logo.lease_company = {};
config.logo.leasee = {};
config.logo.scrap_merchant = {};

// Logo size
config.logo.width = '3.5em'
config.logo.height = '1.4em'

//Main Logo
config.logo.main.src = 'Icons/IBM_Logo.svg'

// Regulator Logo
config.logo.regulator.src = 'Icons/Regulator/IBM_Logo.svg'

// Manufacturer Logo
config.logo.manufacturer.src = 'Icons/Manufacturer/IBM_Logo.svg'

// Dealership Logo
config.logo.dealership.src = 'Icons/Dealership/IBM_Logo.svg'

// Lease Company Logo
config.logo.lease_company.src = 'Icons/Lease_Company/IBM_Logo.svg'

// Leasee Logo
config.logo.leasee.src = 'Icons/Leasee/IBM_Logo.svg'

// Scrap Merchant Logo
config.logo.scrap_merchant.src = 'Icons/Scrap_Merchant/IBM_Logo.svg'

/******* Participants *******/
//This is where you can change whose name appears at the top of the pages

// Variable Setup
config.participants = {};
config.participants.regulator = {};
config.participants.manufacturer = {};
config.participants.dealership = {};
config.participants.lease_company = {};
config.participants.leasee = {};
config.participants.scrap_merchant = {};

// Regulator
config.participants.regulator.company = 'DVLA'
config.participants.regulator.user = 'Ronald'
config.participants.regulator.identity = "user_type1_1d48eb66a2"
config.participants.regulator.password = "07a5280ee2"

// Manufacturer
config.participants.manufacturer.company = 'Toyota'
config.participants.manufacturer.user = 'Martin'
config.participants.manufacturer.identity = "user_type2_f7f47b3bd0"
config.participants.manufacturer.password = "4216f77b70"

// Dealership
config.participants.dealership.company = 'Beechvale Group'
config.participants.dealership.user = 'Deborah'
config.participants.dealership.identity = "user_type4_51fa1b75e6"
config.participants.dealership.password = "7bf8852c92"

// Lease Company
config.participants.lease_company.company = 'LeaseCan'
config.participants.lease_company.user = 'Lesley'
config.participants.lease_company.identity = "user_type8_14ce0cbc10"
config.participants.lease_company.password = "488113fbee"

// Leasee
config.participants.leasee.company = 'Joe Payne'
config.participants.leasee.user = 'Joe'
config.participants.leasee.identity = "user_type4_5d6babedbc"
config.participants.leasee.password = "f3f902103f"

// Scrap Merchant
config.participants.scrap_merchant.company = 'Cray Bros (London) Ltd'
config.participants.scrap_merchant.user = 'Sandy'
config.participants.scrap_merchant.password = 'ibm4you2'



function loadLogo(pageType)
{
	$('#logo').attr('src', config.logo[pageType].src)
	$('#logo').css('width', config.logo.width)
	$('#logo').css('height', config.logo.height)
}

function loadParticipant(pageType)
{
	$('#username').html(config.participants[pageType].user);
	$('#company').html(config.participants[pageType].company);
}



















