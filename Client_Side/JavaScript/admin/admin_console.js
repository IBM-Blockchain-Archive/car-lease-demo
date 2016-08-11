var addr;
var peersArr = [];
var minBool = true;
var typeShowing = false;

peersArr.push(addr);

$(document).ready(function(){
	$('#typeTbl').css('border-bottom','0')
	//getTrace();	
	$('.dropHdr').click(function(){
		$('.dropRw').toggle()
		if(!typeShowing)
		{
			$('#typeTbl').css('border-bottom','2px solid #00648D')
		}
		else
		{
			$('#typeTbl').css('border-bottom','0')
		}
		typeShowing = !typeShowing
	});
	$('.dropRw').click(function(){
		$('.dropRw').toggle()
		$('#typeTbl').css('border-bottom','0')
		typeShowing = false;
		$('#selectedType').html($(this).children('td').html())
	});
})

function createScenario(scenario_type)
{
	$('#fade').show();
	$('#loader').show();
	$('#loader img').show();

	$('#loaderMessages').html('<u>Creating Scenario</u><br /><br /><span id="messages"></i>waiting...</i></span><br /></div>&nbsp;')
	
	var data = {};
	data.scenario = scenario_type;
	
	$.ajax({
		type: "POST",
		url: "/admin/demo",
		dataType : 'json',
		data: JSON.stringify(data),
		contentType: 'application/json',
		success: function(d){
			console.log(d)
		},
		error: function(e){
			console.log(e)
		}
	});
	
	
	var found = [];
	
	var checkDone = setInterval(function(){
			var data = {}
			var xhr = new XMLHttpRequest()
			xhr.open("GET", "/admin/demo",true)
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			xhr.overrideMimeType("text/plain");
			xhr.onprogress = function () {
				
			}
			xhr.onreadystatechange = function (){
				if(xhr.readyState === 4)
				{
					var array = JSON.parse(xhr.responseText);
					for(var i = 0; i < array.length; i++)
					{
						if(array[i] != "")
						{	
							if(typeof array[i].counter != 'undefined')
							{
								var fnd = false;
								for(var j = 0; j < found.length; j++)
								{
									if(array[i].message == found[j])
									{
										fnd = true;
									}
								}
								if(!fnd)
								{
									if($('#latestSpan').children('.completed').html() == '')
									{
										$('#latestSpan').children('.completed').html('[Completed: <span class="numDone" >1</span>]')
									}
									else
									{
										$('#latestSpan').find('.numDone').html(parseInt($('#latestSpan').find('.numDone').html())+1)
									}
									found.push(array[i].message)
								}
							}
							else if(typeof array[i].error == 'undefined')
							{
								var fnd = false;
								for(var j = 0; j < found.length; j++)
								{
									if(array[i].message == found[j])
									{
										fnd = true;
									}
								}
								if(!fnd)
								{
									if(found.length == 0){
										$('#messages').html('<i>'+array[i].message+'</i><span id="latestSpan">... <span class="completed"></span></span><br>');
									}
									else{
										$('#latestSpan').html('&nbsp;&#10004');
										$('#latestSpan').attr('id','');
										$('#messages').append('<i>'+array[i].message+'</i><span id="latestSpan">... <span class="completed"></span></span><br>');
									}
									
									
									
									found.push(array[i].message)
									if(array[i].message == "Demo setup")
									{
										clearInterval(checkDone);
										$('#latestSpan').html('&nbsp;&#10004');
										$('#loader img').hide();
										$('#loaderMessages').append('<br /><br /><span id="okTransaction" onclick="confTrans();">OK</span>');
										$('#chooseConfHd span').html('Scenario Creation Complete');
										$('#confTxt').html('Scenario creation complete');
									}
								}
							}
							else
							{
								var fnd = false;
								for(var j = 0; j < found.length; j++)
								{
									if(array[i].message == found[j])
									{
										fnd = true;
									}
								}
								if(!fnd)
								{
									$('#latestSpan').html('&nbsp;&#10004');
									$('#latestSpan').attr('id','');
									found.push(array[i].message)
									$('#loaderMessages').append('<i class="errorRes" >ERROR: '+array[i].message+'<span id="latestSpan">...</span></i><br>');
								}
								if(array[i].error == true)
								{
									clearInterval(checkDone);
									$('#latestSpan').html('&nbsp;&#10004');
									$('#loader img').hide();
									$('#loaderMessages').append('<br /><br /><span id="okTransaction" onclick="showError();">OK</span>');
									$('#failHd span').html('Scenario Creation Failed');
									$('#confTxt').html(array[i].message);
								}
							}
						}
					}
				}
			}
			xhr.send(JSON.stringify(data))
	}, 5000)
	
}

function getTrace()
{
	$.ajax({
		type: 'GET',
		dataType : 'json',
		contentType: 'application/json',
		crossDomain:true,
		url: '/tools/traces',
		success: function(d) {
			if(d.trace)
			{
				trace = 'On'
				traceCrc = "grCrc"
				
			}
			else
			{
				trace = 'Off'
				traceCrc = "rdCrc"
			}
		},
		error: function(e){
			console.log(e)
		},
		async: false
	});
	$('<div class="confs" ><div class="bordTLRB blueBack">Configuration:</div><div class="bordLRB ">Trace: <span class="alR" ><span id="traceTog" class="toggler" onclick="toggleTrace();">'+trace+'<span class="'+traceCrc+'" ></span></span></span></div></div>').insertBefore('#addConfigPrnt');
}


function toggleTrace()
{
	$.ajax({
		type: 'PUT',
		dataType : 'json',
		contentType: 'application/json',
		crossDomain:true,
		url: '/tools/traces',
		success: function(d) {
			$('.confs').remove();
			getTrace();
		},
		error: function(e){
			console.log(e)
		},
		async: false
	});

}

function showError()
{
	$('#loader').hide();
	$('#loaderMessages').html('');
	$('#failTransfer').show();
}

function hideError()
{
	$('#fade').hide()
	$('#loader').hide()
	$('#failTransfer').hide();
}

function hideSuccess()
{
	$('#fade').hide()
	$('#loader').hide()
	$('#confTbl').hide();
	$('#username').val('Username...')
	$('#selectedType').html('Type')
}

function closeEditTbl()
{
	$('#chooseOptTbl').hide();
	$('#errorRw').hide();
	$('#fade').hide()
}

function addUser()
{

	if($('#selectedType').html().trim() == "Type")
	{
		$('#fade').show()
		$('#failTxt').append('User type not selected.');
		$('#failTransfer').show()
		
	}
	else
	{	
		showEditTbl()
	}
}

function showEditTbl()
{
	$('#chooseOptTbl').fadeIn(1000);
	$('#fade').fadeIn(1000);
	
	var addresses = {
		"cities": ["Aberdeen", "St Albans", "Birmingham", "Bath", "Blackburn", "Bradford", "Bournemouth", "Bolton", "Brighton", "Bromley", "Bristol", "Belfast", "Carlisle", "Cambridge", "Cardiff", "Chester", "Chelmsford", "Colchester", "Croydon", "Canterbury", "Coventry", "Crewe", "Dartford", "Dundee", "Derby", "Dumfries", "Durham", "Darlington", "Doncaster", "Dorchester", "Dudley", "East London", "East Central London", "Edinburgh", "Enfield", "Exeter", "Falkirk", "Blackpool", "Glasgow", "Gloucester", "Guildford", "Harrow", "Huddersfield", "Harrogate", "Hemel Hempstead", "Hereford", "Outer Hebrides", "Hull", "Halifax", "Ilford", "Ipswich", "Inverness", "Kilmarnock", "Kingston upon Thames", "Kirkwall", "Kirkcaldy", "Liverpool", "Lancaster", "Llandrindod Wells", "Leicester", "Llandudno", "Lincoln", "Leeds", "Luton", "Manchester", "Rochester", "Milton Keynes", "Motherwell", "North London", "Newcastle upon Tyne", "Nottingham", "Northampton", "Newport", "Norwich", "North West London", "Oldham", "Oxford", "Paisley", "Peterborough", "Perth", "Plymouth", "Portsmouth", "Preston", "Reading", "Redhill", "Romford", "Sheffield", "Swansea", "South East London", "Stevenage", "Stockport", "Slough", "Sutton", "Swindon", "Southampton", "Salisbury", "Sunderland", "Southend-on-Sea", "Stoke-on-Trent", "South West London", "Shrewsbury", "Taunton", "Galashiels", "Telford", "Tunbridge Wells", "Torquay", "Truro", "Cleveland", "Twickenham", "Southall", "West London", "Warrington", "Western Central London", "Watford", "Wakefield", "Wigan", "Worcester", "Walsall", "Wolverhampton", "York"],
		"street_names": ["Alresford Road", "Amherst Street", "Andover Road", "Arleston Lane", "Ashbourne Road", "Attwoods Drove", "Bank Street", "Basingwell Street Lower", "Boone Avenue", "Botley Road", "Brackens Lane", "Bucks Head Hill", "Burnett Close", "Burtville Ave", "Caswell Avenue", "Cathedral Road", "Chapel Lane", "Charnwood Street", "Chellaston Road", "Church Road", "Church Street", "City Road", "Converse Place", "Cott Street", "Cross Lane", "Curdridge Lane", "Derby Road", "Derwent Street", "Division Street", "Down Farm Lane", "Durley Street", "E Sahara Ave", "East Desert Inn Road", "Eastgate Street", "Fair Lane", "Hall Street", "Heathen Street", "High Street", "Hursley Park", "Industrial Road", "Inner Close", "Jacklyns Lane", "Jewry Street", "Kedleston Road", "Kentidge Way", "Kings Worthy", "Kingsgate Road", "Kingsgate Street", "Las Vegas Boulevard", "Las Vegas Boulevard S", "Legge Boulevard", "Lewis Street", "London Road", "Lower Basingwell Street", "Main Street", "Mansfield Road", "Maple Avenue", "Marjorie Road", "Martins Fields", "Morley Street", "Moundale Avenue", "Northfield Road", "Northington Road", "Nottingham Road", "Osmaston Road", "Paradise Road", "Parchment Street", "Park Farm Drive", "Parkway", "Peach Hill Lane", "Petersfield Road", "Plantations Drive", "Poole Street", "Queen Street", "Riverside Path", "Saint George's Square", "Samoset Road", "Sarum Road", "Seymour Avenue", "Sheardley Lane", "Shore Lane", "Sinfin Avenue", "South Hill", "South Pleasant Valley Road", "Southgate Street", "Springvale Road", "St. George's Street", "St. Thomas Street", "Staddle Hill Road", "Station Hill", "Stenson Road", "Stoney Lane", "Straton Lane", "Surrey Street", "Swan Lane", "The Broadway", "The Soke", "The Square", "Upham Street", "Upper Church Road", "Valley Avenue", "Vestry Road", "West Boscawen Street", "West Street", "Wharf Hill", "Whiteley Way", "Winchester Road", "Wordsworth Avenue"],
		"post_codes": ["AB", "AL", "B", "BA", "BB", "BD", "BH", "BL", "BN", "BR", "BS", "BT", "CA", "CB", "CF", "CH", "CM", "CO", "CR", "CT", "CV", "CW", "DA", "DD", "DE", "DG", "DH", "DL", "DN", "DT", "DY", "E", "EC", "EH", "EN", "EX", "FK", "FY", "G", "GL", "GU", "HA", "HD", "HG", "HP", "HR", "HS", "HU", "HX", "IG", "IP", "IV", "KA", "KT", "KW", "KY", "L", "LA", "LD", "LE", "LL", "LN", "LS", "LU", "M", "ME", "MK", "ML", "N", "NE", "NG", "NN", "NP", "NR", "NW", "OL", "OX", "PA", "PE", "PH", "PL", "PO", "PR", "RG", "RH", "RM", "S", "SA", "SE", "SG", "SK", "SL", "SM", "SN", "SO", "SP", "SR", "SS", "ST", "SW", "SY", "TA", "TD", "TF", "TN", "TQ", "TR", "TS", "TW", "UB", "W", "WA", "WC", "WD", "WF", "WN", "WR", "WS", "WV", "YO"]
	}

	var names = ["Mary", "Patricia", "Linda", "Barbara", "Elizabeth", "Jennifer", "Maria", "Susan", "Margaret","Dorothy","Lisa", "Nancy", "Karen", "Betty", "Helen", "Sandra", "Donna", "Carol", "Ruth", "Sharon", "Michelle", "Laura", "Sarah", "Kimberly", "Deborah", "Jessica", "Shirley", "Cynthia", "Angela", "Melissa", "Brenda", "Amy", "Anna", "Rebecca", "Virginia", "Kathleen", "Pamela", "Martha", "Debra", "Amanda", "Stephanie", "Carolyn", "Christine", "Marie", "Janet", "Catherine", "Frances", "Ann", "Joyce", "Diane", "Alice", "Julie", "Heather", "Teresa", "Doris", "Gloria", "Evelyn", "Jean", "Cheryl", "Mildred", "Katherine", "Joan", "Ashley", "Judith", "Rose", "Janice", "Kelly", "Nicole", "Judy", "Christina", "Kathy", "Theresa", "Beverly", "Denise", "Tammy", "Irene", "Jane", "Lori", "Rachel", "Marilyn", "Andrea", "Kathryn", "Louise", "Sara", "Anne", "Jacqueline", "Wanda", "Bonnie", "Julia", "Ruby", "Lois", "Tina", "Phyllis", "Norma", "Paula", "Diana", "Annie", "Lillian", "Emily", "Robin", "Peggy", "Crystal", "Gladys", "Rita", "Dawn", "Connie", "Florence", "Tracy", "Edna", "Tiffany", "Carmen", "Rosa", "Cindy", "Grace", "Wendy", "Victoria", "Edith", "Kim", "Sherry", "Sylvia", "Josephine", "Thelma", "Shannon", "Sheila", "Ethel", "Ellen", "Elaine", "Marjorie", "Carrie", "Charlotte", "Monica", "Esther", "Pauline", "Emma", "Juanita", "Anita", "Rhonda", "Hazel", "Amber", "Eva", "Debbie", "April", "Leslie", "Clara", "Lucille", "Jamie", "Joanne", "Eleanor", "Valerie", "Danielle", "Megan", "Alicia", "Suzanne", "Michele", "Gail", "Bertha", "Darlene", "Veronica", "Jill", "Erin", "Geraldine", "Lauren", "Cathy", "Joann", "Lorraine", "Lynn", "Sally", "Regina", "Erica", "Beatrice", "Dolores", "Bernice", "Audrey", "Yvonne", "Annette", "June", "Samantha", "Marion", "Dana", "Stacy", "Ana", "Renee", "Ida", "Vivian", "Roberta", "Holly", "Brittany", "Melanie", "Loretta", "Yolanda", "Jeanette", "Laurie", "Katie", "Kristen", "Vanessa", "Alma", "Sue", "Elsie", "Beth", "Jeanne", "Vicki", "James", "John", "Robert", "Michael", "William", "David", "Richard", "Charles", "Joseph", "Thomas", "Christopher", "Daniel", "Paul", "Mark", "Donald", "George", "Kenneth", "Steven", "Edward", "Brian", "Ronald", "Anthony", "Kevin", "Jason", "Matthew", "Gary", "Timothy", "Jose", "Larry", "Jeffrey", "Frank", "Scott", "Eric", "Stephen", "Andrew", "Raymond", "Gregory", "Joshua", "Jerry", "Dennis", "Walter", "Patrick", "Peter", "Harold", "Douglas", "Henry", "Carl", "Arthur", "Ryan", "Roger", "Joe", "Juan", "Jack", "Albert", "Jonathan", "Justin", "Terry", "Gerald", "Keith", "Samuel", "Willie", "Ralph", "Lawrence", "Nicholas", "Roy", "Benjamin", "Bruce", "Brandon", "Adam", "Harry", "Fred", "Wayne", "Billy", "Steve", "Louis", "Jeremy", "Aaron", "Randy", "Howard", "Eugene", "Carlos", "Russell", "Bobby", "Victor", "Martin", "Ernest", "Phillip", "Todd", "Jesse", "Craig", "Alan", "Shawn", "Clarence", "Sean", "Philip", "Chris", "Johnny", "Earl", "Jimmy", "Antonio", "Danny", "Bryan", "Tony", "Luis", "Mike", "Stanley", "Leonard", "Nathan", "Dale", "Manuel", "Rodney", "Curtis", "Norman", "Allen", "Marvin", "Vincent", "Glenn", "Jeffery", "Travis", "Jeff", "Chad", "Jacob", "Lee", "Melvin", "Alfred", "Kyle", "Francis", "Bradley", "Herbert", "Frederick", "Ray", "Joel", "Edwin", "Don", "Eddie", "Ricky", "Troy", "Randall", "Barry", "Alexander", "Bernard", "Mario", "Leroy", "Francisco", "Marcus", "Michael", "Theodore", "Clifford", "Miguel", "Oscar", "Jay", "Jim", "Tom", "Calvin", "Alex", "Ronnie", "Bill", "Lloyd", "Tommy", "Leon", "Derek", "Warren", "Darrell", "Jerome", "Floyd", "Leo", "Alvin", "Tim", "Wesley", "Gordon", "Dean", "Greg", "Jorge", "Dustin", "Pedro", "Derrick", "Dan", "Lewis", "Zachary", "Corey", "Herman", "Maurice", "Vernon", "Roberto", "Clyde", "Glen", "Hector", "Shane", "Ricardo", "Sam", "Rick", "Lester", "Brent", "Ramon", "Charlie", "Tyler", "Gilbert", "Gene"]

	var house_number = randomNumber(1, 150)

	var street_name = addresses.street_names[randomNumber(0, addresses.street_names.length-1)]  
	
	var city_int = randomNumber(0, addresses.cities.length-1)

	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var text = ""
	for( var i=0; i < 2; i++ )
		text += possible.charAt(randomNumber(0, possible.length-1));

	var city = addresses.cities[city_int]
	var post_code = addresses.post_codes[city_int]+(randomNumber(1, 99))+" "+(randomNumber(1, 9))+text
	
	var name = names[randomNumber(0, names.length)]
	
	var types = [name+"'s Motors", name+"'s Car Sales", name+"'s Leasing", name, name+"'s Scrap Merchants"]
	
	var i;
	
	switch ($('#selectedType').html())
	{
		case "Manufacturer": 
			i = 0
			break;
		case "Dealership": 
			i = 1
			break;
		case "Lease Company": 
			i = 2 
			break;
		case "Leasee": 
			i = 3 
			break;
		case "Scrap Merchant": 
			i = 4 
			break;
	}
	
	$('#newUserUsername').val(name);
	$('#newUserCompany').val(types[i]);
	$('#newUserType').val($('#selectedType').html());
	$('#newUserStreet').val(house_number+" "+street_name);
	$('#newUserCity').val(city);
	$('#newUserPostcode').val(post_code);
	
	if($('#newUserUsername').val().indexOf("undefined") != -1 || $('#newUserCompany').val().indexOf("undefined") != -1 || $('#newUserUserType').val().indexOf("undefined") != -1 || $('#newUserStreet').val().indexOf("undefined") != -1 || $('#newUserCity').val().indexOf("undefined") != -1 || $('#newUserPostcode').val().indexOf("undefined") != -1)
	{
		showEditTbl()
	}
}

function validate()
{
	
	/*
	Validation on if details have been filled in for updating a car. This is not validation on what the person is allowed to update,
	that is done within the contract on the blockchain.
	*/
	
	$('#errorRw').html('<ul></ul>');
	var failed = false;
	if($('#newUserUsername').val().trim() == '')
	{
		$('#errorRw').find('ul').append('<li>Username cannot be blank</li>')
		failed = true;
	}
	if($('#newUserCompany').val().trim() == '')
	{
		$('#errorRw').find('ul').append('<li>Company cannot be blank</li>')
		failed = true;
	}
	if($('#newUserStreet').val().trim() == '')
	{
		$('#errorRw').find('ul').append('<li>Street cannot be blank</li>')
		failed = true;
	}
	if($('#newUserCity').val().trim() == '')
	{
		$('#errorRw').find('ul').append('<li>City cannot be blank</li>')
		failed = true;
	}
	if($('#newUserPostcode').val().trim() == '')
	{
		$('#errorRw').find('ul').append('<li>Postcode cannot be blank</li>')
		failed = true;
	}
	if(!failed)
	{
		$('#errorRw').hide();
		createUser();
	}
	else
	{
		$('#errorRw').show();
	}
}

function createUser()
{
	$('#loader').show()
	$('#chooseOptTbl').hide();
	$('#errorRw').hide();
	
	var data = {};
	data.username = $("#newUserUsername").val();
	data.company = $("#newUserCompany").val();
	data.role = 1;
	data.affiliation = $("#newUserType").val();
	data.street_name = $("#newUserStreet").val();
	data.city = $("#newUserCity").val();
	data.postcode = $("#newUserPostcode").val();

	$.ajax({
		type: 'POST',
		dataType : 'json',
		data: JSON.stringify(data),
		contentType: 'application/json',
		crossDomain:true,
		url: '/blockchain/participants',
		success: function(d) {
			console.log(d);
			$('#chooseConfHd span').html('User Creation Complete')
			$('#confTxt').html('Creation of user "'+d.id+'" successful. <br />Secret: '+d.secret)
			$('#confTbl').show()
			$('#loader').hide()
		},
		error: function(e){
			console.log('FAILURE: '+JSON.stringify(e))
			$('#failTxt').append('Error creating user.');
			$('#failTransfer').show();
			$('#loader').hide()
		},
		async: false
	});
}

function randomNumber(min, max)
{
	var output = Math.floor(Math.random() * max) + min
	console.log(output)
	return output
}

