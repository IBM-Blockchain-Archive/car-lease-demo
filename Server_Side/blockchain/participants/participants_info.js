/*eslint-env node*/

var user_info = JSON.parse(process.env.VCAP_SERVICES)["ibm-blockchain-5-prod"][0]["credentials"]["users"];


var participants_info = {
	"regulators": [
		{
			"name": "DVLA",
			"identity": user_info[0].enrollId,
			"password": user_info[0].enrollSecret,
			"address_line_1": "The Richard Ley Development Centre",
			"address_line_2": "Upper Forest Way",
			"address_line_3": "Swansea Vale",
			"address_line_4": "Swansea",
			"postcode": "SA7 0AN"
		}
	],
	"manufacturers": [
		{
			"name": "Alfa Romeo",
			"identity": user_info[5].enrollId,
			"password": user_info[5].enrollSecret,
			"address_line_1": "25 St James's Street",
			"address_line_2": "London",
			"address_line_3": "United Kingdom",
			"postcode": "SW1A 1HA"
		},
		{
			"name": "Toyota",
			"identity": user_info[6].enrollId,
			"password": user_info[6].enrollSecret,
			"address_line_1": "Burnaston",
			"address_line_2": "Derby",
			"address_line_3": "United Kingdom",
			"postcode": "DE1 9TA"
		},
		{
			"name": "Jaguar Land Rover",
			"identity": user_info[7].enrollId,
			"password": user_info[7].enrollSecret,
			"address_line_1": "Abbey Road",
			"address_line_2": "Coventry",
			"address_line_3": "United Kingdom",
			"postcode": "CV3 4LF"
		}
	],
	"dealerships": [
		{
			"name": "Beechvale Group",
			"identity": user_info[10].enrollId,
			"password": user_info[10].enrollSecret,
			"address_line_1": "84 Hull Road",
			"address_line_2": "Derby",
			"postcode": "DE75 4PJ"
		},
		{
			"name": "Milescape",
			"identity": user_info[11].enrollId,
			"password": user_info[11].enrollSecret,
			"address_line_1": "Imperial Yard",
			"address_line_2": "Derby",
			"postcode": "DE94 8HY"
		}/*,
		{
			"name": "Viewers Alfa Romeo",
			"identity": "Viewers Alfa Romeo",
			"password": "VWjFucyEIzTn",
			"address_line_1": "25 Lower Lens Street",
			"address_line_2": "Penylan",
			"address_line_3": "Cardiff",
			"address_line_4": "South Glamorgan",
			"postcode": "CF28 9LC"
		}*/
	],
	"lease_companies": [
		{
			"name": "LeaseCan",
			"identity": user_info[12].enrollId,
			"password": user_info[12].enrollSecret,
			"address_line_1": "64 Zoo Lane",
			"address_line_2": "Slough",
			"address_line_3": "Berkshire",
			"postcode": "SL82 4AB"
		}/*,
		{
			"name": "Every Car Leasing",
			"identity": "Every Car Leasing",
			"password": "KakjewJfwBSq",
			"address_line_1": "9 Main Road",
			"address_line_2": "Mobberly",
			"address_line_3": "Cheshire",
			"postcode": "WA18 7KJ"
		},
		{
			"name": "Regionwide Vehicle Contracts",
			"identity": "Regionwide Vehicle Contracts",
			"password": "plqOUyoFTZyK",
			"address_line_1": "Unit 9",
			"address_line_2": "Malcom Christie Way",
			"address_line_3": "Riggot Fields",
			"address_line_4": "Manchester",
			"postcode": "M21 15QY"
		}*/
	],
	"leasees": [
		{
			"name": "Joe Payne",
			"identity": user_info[13].enrollId,
			"password": user_info[13].enrollSecret,
			"address_line_1": "84 Byron Road",
			"address_line_2": "Eastleigh",
			"postcode": "SO50 8JR"
		},
		{
			"name": "Andrew Hurt",
			"identity": user_info[14].enrollId,
			"password": user_info[14].enrollSecret,
			"address_line_1": "16 West Street",
			"address_line_2": "Eastleigh",
			"postcode": "SO50 9CL"
		}/*,
		{
			"name": "Anthony O'Dowd",
			"identity": "Anthony O'Dowd",
			"password": "MrcAgjpBwhmI",
			"address_line_1": "34 Main Road",
			"address_line_2": "Winchester",
			"postcode": "SO50 3QV"
		}*/
	],
	"scrap_merchants": [
		{
			"name": "Cray Bros (London) Ltd",
			"identity": user_info[15].enrollId,
			"password": user_info[15].enrollSecret,
			"address_line_1": "26 Electric Eel Avenue",
			"address_line_2": "Twickenham",
			"address_line_3": "Greater London",
			"postcode": "SE51 9DR"
		},
		{
			"name": "Aston Scrap Centre",
			"identity": user_info[16].enrollId,
			"password": user_info[16].enrollSecret,
			"address_line_1": "11 Willow Park Way",
			"address_line_2": "Aston on Trent",
			"address_line_3": "Derby",
			"postcode": "DE72 2DG"
		},
		{
			"name": "ScrapIt! UK",
			"identity": user_info[17].enrollId,
			"password": user_info[17].enrollSecret,
			"address_line_1": "25 Lincoln Road",
			"address_line_2": "Winchester",
			"postcode": "SO29 9BL"
		}
	]
}

exports.participants_info = participants_info;