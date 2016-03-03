/*eslint-env node*/

var user_info = JSON.parse(process.env.VCAP_SERVICES)[Object.keys(JSON.parse(process.env.VCAP_SERVICES))[0]][0]["credentials"]["users"];

var participants = {
	"regulators": [
		{
			"name": "DVLA",
			"identity": user_info[0]["username"],
			"password": user_info[0]["secret"],
			"address_line_1": "The Richard Ley Development Centre",
			"address_line_2": "Upper Forest Way",
			"address_line_3": "Swansea Vale",
			"address_line_4": "Swansea",
			"postcode": "SA7 0AN"
		}
	],
	"manufacturers": [
		{
			"name": "Toyota",
			"identity": user_info[2]["username"],
			"password": user_info[2]["secret"],
			"address_line_1": "Burnaston",
			"address_line_2": "Derby",
			"address_line_3": "United Kingdom",
			"postcode": "DE1 9TA"
		},
		{
			"name": "Alfa Romeo",
			"identity": user_info[3]["username"],
			"password": user_info[3]["secret"],
			"address_line_1": "25 St James's Street",
			"address_line_2": "London",
			"address_line_3": "United Kingdom",
			"postcode": "SW1A 1HA"
		},
		{
			"name": "Jaguar Land Rover",
			"identity": "Jaguar_Land_Rover",
			"password": "ibm4you2",
			"address_line_1": "Abbey Road",
			"address_line_2": "Coventry",
			"address_line_3": "United Kingdom",
			"postcode": "CV3 4LF"
		}
	],
	"dealerships": [
		{
			"name": "Beechvale Group",
			"identity": user_info[4]["username"],
			"password": user_info[4]["secret"],
			"address_line_1": "84 Hull Road",
			"address_line_2": "Derby",
			"postcode": "DE75 4PJ"
		},
		{
			"name": "Milescape",
			"identity": "Milescape",
			"password": "ibm4you2",
			"address_line_1": "Imperial Yard",
			"address_line_2": "Derby",
			"postcode": "DE94 8HY"
		},
		{
			"name": "Viewers Alfa Romeo",
			"identity": "Viewers_Alfa_Romeo",
			"password": "ibm4you2",
			"address_line_1": "25 Lower Lens Street",
			"address_line_2": "Penylan",
			"address_line_3": "Cardiff",
			"address_line_4": "South Glamorgan",
			"postcode": "CF28 9LC"
		}
	],
	"lease_companies": [
		{
			"name": "LeaseCan",
			"identity": user_info[6]["username"],
			"password": user_info[6]["secret"],
			"address_line_1": "64 Zoo Lane",
			"address_line_2": "Slough",
			"address_line_3": "Berkshire",
			"postcode": "SL82 4AB"
		},
		{
			"name": "Every Car Leasing",
			"identity": "Every_Car_Leasing",
			"password": "ibm4you2",
			"address_line_1": "9 Main Road",
			"address_line_2": "Mobberly",
			"address_line_3": "Cheshire",
			"postcode": "WA18 7KJ"
		},
		{
			"name": "Regionwide Vehicle Contracts",
			"identity": "Regionwide_Vehicle_Contracts",
			"password": "ibm4you2",
			"address_line_1": "Unit 9",
			"address_line_2": "Malcom Christie Way",
			"address_line_3": "Riggot Fields",
			"address_line_4": "Manchester",
			"postcode": "M21 15QY"
		}
	],
	"leasees": [
		{
			"name": "Joe Payne",
			"identity": user_info[5]["username"],
			"password": user_info[5]["secret"],
			"address_line_1": "84 Byron Road",
			"address_line_2": "Eastleigh",
			"postcode": "SO50 8JR"
		},
		{
			"name": "Andrew Hurt",
			"identity": "Andrew_Hurt",
			"password": "ibm4you2",
			"address_line_1": "16 West Street",
			"address_line_2": "Eastleigh",
			"postcode": "SO50 9CL"
		},
		{
			"name": "Anthony O'Dowd",
			"identity": "Anthony_O'Dowd",
			"password": "ibm4you2",
			"address_line_1": "34 Main Road",
			"address_line_2": "Winchester",
			"postcode": "SO50 3QV"
		}
	],
	"scrap_merchants": [
		{
			"name": "Cray Bros (London) Ltd",
			"identity": "Cray_Bros_(London)_Ltd",
			"password": "ibm4you2",
			"address_line_1": "26 Electric Eel Avenue",
			"address_line_2": "Twickenham",
			"address_line_3": "Greater London",
			"postcode": "SE51 9DR"
		},
		{
			"name": "Aston Scrap Centre",
			"identity": "Aston_Scrap_Centre",
			"password": "ibm4you2",
			"address_line_1": "11 Willow Park Way",
			"address_line_2": "Aston on Trent",
			"address_line_3": "Derby",
			"postcode": "DE72 2DG"
		},
		{
			"name": "ScrapIt! UK",
			"identity": "ScrapIt!_UK",
			"password": "ibm4you2",
			"address_line_1": "25 Lincoln Road",
			"address_line_2": "Winchester",
			"postcode": "SO29 9BL"
		}
	]
}

exports.participants = participants;