$(document).ready(function(){
	loadParticipant('regulator')
	setCookie();
	getAltUsers();
	getTransactions();

	$('#company').html(config.participants[pgNm.toLowerCase()].company)

	$('#searchBar').focusout(function(){
		if($('#searchBar').val().trim() == '')
		{
			$('#searchBar').val('Search by V5C ID...')
		}
	})
	$(document).on('mouseover', '.userGroup', function(){
		showList(allUsers[$(this).find('span').html().replace(' ', '_').toLowerCase()], $(this).find('span').html().replace(' ', '_').toLowerCase(), $(this).find('.pos').val())
	});
})

var allUsers;
var endPos;
var bottomOverhang = 0;

function getAltUsers()
{
	$.ajax({
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		crossDomain: true,
		url: '/blockchain/participants',
		success: function(d) {
			allUsers = d.result;
			var pos = 0;
			for (var key in allUsers) {
			  if (allUsers.hasOwnProperty(key)) {
			     $('#users').append('<span class="userHldr userHldr'+$('#userType').html().replace(' ', '')+' userGroup" >&lt;<span>'+toTitleCase(key.replace('_', ' '))+'</span><input type="hidden" class="pos" value="'+pos+'" /></span>')
				if(pos + allUsers[key].length > bottomOverhang)
				{
					bottomOverhang = pos+allUsers[key].length;
				}
				pos++;
			  }
			}
			endPos = pos - 1;
		},
		error: function(e)
		{
			console.log(e)
		}
	})
}

function showList(users, parent, pos)
{
	if(menuShowing)
	{
		$('#theirUsers').html('')
		for(var i = 0; i < users.length; i++)
		{
			$('#theirUsers').append('<span class="userHldr userHldr'+$('#userType').html().replace(' ', '')+'" onclick="changeUser(\''+users[i].name.replace('\'','\\\'')+'\', \''+parent+'\', '+i+')" >'+users[i].name+'</span>')
		}
		$('#endUsers').css('top', (40*(++pos)-34)+'px')
		$('#endUsers').show();

		var diff = pos - endPos + users.length - 2

		if(diff > 0)
		{
			var colour = colours[$('#userType').html().toLowerCase().replace(' ', '_')]
			$('#theirUsers span').slice(diff*-1).css('border-right','2px solid '+colour);	
		}
	}
}

var menuShowing = false;

function toggleMenu()
{
	if(filtShowing)
	{
		toggleFilters()
	}
	if(sortShowing)
	{
		toggleSorts()
	}
	if(!menuShowing)
	{
		if(bottomOverhang-6 > 0)
		{
			$('#filterRw').animate({
				paddingTop: '+='+(bottomOverhang-6)*40
			}, 500)
		}
		$('#userDets').animate({
			marginRight: '-='+($('#userDets').width())
		}, 500, function(){
			$('#userDets').hide()
			$('#users').slideDown(500)
			$('#userBlock').css('display', 'block')
		})
	}
	else
	{
		if(bottomOverhang-6 > 0)
		{
			$('#filterRw').animate({
				paddingTop: '-='+(bottomOverhang-6)*40
			}, 500)
		}
		$('#users').slideUp(500)
		setTimeout(function(){
			$('#userBlock').css('display', 'none')
			$('#userDets').show()
			$('#userDets').animate({
				marginRight: '0px'
			}, 500)
		}, 500)
	}
	$('#endUsers').css('display', 'none')
	menuShowing = !menuShowing
}

var found_cars = {};

function getTransactions(){
	
	$('#menuBtn').hide()
	found_cars = {};
	$.ajax({
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		crossDomain: true,
		url: '/blockchain/transactions',
		success: function(d) {
			d.transactions.reverse();
			for(var i = d.transactions.length-1; i >= 0 ; i--)
			{
				var obj = d.transactions[i];
				if(obj.payload.indexOf("create_vehicle_log") == -1)
				{
					var payload = obj.payload;
					var type = "undefined";
					var function_name = "";
					var update_type = "";
					var failed = obj.failed;
					if(payload.indexOf("authority_to_manufacturer") != -1)
					{
						type = "Transfer";
						function_name = "authority_to_manufacturer";
					}
					if(payload.indexOf("manufacturer_to_private") != -1)
					{
						type = "Transfer";
						function_name = "manufacturer_to_private";
					}
					if(payload.indexOf("private_to_private") != -1)
					{
						type = "Transfer";
						function_name = "private_to_private";
					}
					if(payload.indexOf("private_to_lease_company") != -1)
					{
						type = "Transfer";
						function_name = "private_to_lease_company";
					}
					if(payload.indexOf("lease_company_to_private") != -1)
					{
						type = "Transfer";
						function_name = "lease_company_to_private";
					}
					if(payload.indexOf("private_to_scrap_merchant") != -1)
					{
						type = "Transfer";
						function_name = "private_to_scrap_merchant";
					}
					if(payload.indexOf("create_vehicle") != -1)
					{
						type = "Create";
						function_name = "create_vehicle";
					}
					if(payload.indexOf("update_make") != -1)
					{
						type = "Update";
						function_name = "update_make";
						update_type = "Make";
					}
					if(payload.indexOf("update_model") != -1)
					{
						type = "Update";
						function_name = "update_model";
						update_type = "Model";
					}
					if(payload.indexOf("update_registration") != -1)
					{
						type = "Update";
						function_name = "update_registration";
						update_type = "Registration";
					}
					if(payload.indexOf("update_vin") != -1)
					{
						type = "Update";
						function_name = "update_vin";
						update_type = "VIN";
					}
					if(payload.indexOf("update_colour") != -1)
					{
						type = "Update";
						function_name = "update_colour";
						update_type = "Colour";
					}
					if(payload.indexOf("scrap_vehicle") != -1)
					{
						type = "Scrap";
						function_name = "scrap_vehicle";
					}
					var v5cID = 'undefined';
					var timestamp = 'undefined';
					var caller = 'undefined';
					var arguments = 'undfined';
					if(type != "undefined")
					{
						v5cID = obj.payload.match(/[A-Z]{2}[0-9]{7}/g);
						caller = obj.caller;
						var date = new Date(obj.timestamp.seconds*1000);
						timestamp = pad(date.getDate())+"/"+pad((date.getMonth()+1))+"/"+pad(date.getFullYear())+" "+pad(date.getHours())+":"+pad(date.getMinutes())+":"+pad(date.getSeconds());
						arguments = payload.substring(payload.indexOf(function_name)+function_name.length, payload.indexOf(v5cID)).trim();
						if(!found_cars.hasOwnProperty(v5cID))
						{
							found_cars[v5cID] = [];
						}
						found_cars[v5cID].push({"function_name": function_name, "args": arguments});
					}

					if(type == "Transfer")
					{
						var vin = get_update("vin", v5cID);
						var make = get_update("make", v5cID);
						var model = get_update("model", v5cID);
						var reg = get_update("registration", v5cID);
						var colour = get_update("colour", v5cID);
						var carDetails = '['+vin+'] '+make+' '+model+', '+reg+', '+colour
						
						if(carDetails.indexOf('undefined') != -1)
						{
							carDetails = 'Vehicle Template' 
						}
			
						$('<tr class="retrievedRw" ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw">['+v5cID+'] </td><td class="transRw" style="width:1%; white-space:nowrap"><span class="type" >Transfer</span><span class="message">: '+caller+' &rarr; '+arguments+'</span></td><td colspan="2" class="transRw">'+carDetails+'</td><td class="transRw txtRight">'+timestamp+'</td><td class="smlBrk"></td></tr>').insertAfter('#insAft')
	
					}
					if(type == "Create")
					{
						$('<tr class="retrievedRw" ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw">['+v5cID+'] </td><td class="transRw" style="width:1%; white-space:nowrap"><span class="type" >Create</span><span class="message">: '+caller+'</span></td><td colspan="2" class="transRw">Create V5C</td><td class="transRw txtRight">'+timestamp+'</td><td class="smlBrk"></td></tr>').insertAfter('#insAft')
					}
					if(type == "Update")
					{
						var prev = get_update(update_type.toLowerCase(), v5cID);
						$('<tr class="retrievedRw " ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw">['+v5cID+'] </td><td class="transRw" style="width:1%; white-space:nowrap"><span class="type" >Update</span><span class="message">: '+caller+'</span></td><td colspan="2" class="transRw">'+update_type+': '+prev+' &rarr; '+arguments+'</td><td class="transRw txtRight">'+timestamp+'</td><td class="smlBrk"></td></tr>').insertAfter('#insAft')			
					}
					if(type == "Scrap")
					{
						$('<tr class="retrievedRw" ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw">['+v5cID+'] </td><td class="transRw" style="width:1%; white-space:nowrap"><span class="type" >Scrap</span><span class="message">: '+caller+'</span></td><td colspan="2" class="transRw">Scrap V5C</td><td class="transRw txtRight">'+timestamp+'</td><td class="smlBrk"></td></tr>').insertAfter('#insAft')
					}	
					if(failed)
					{
						$('.retrievedRw').first().children('.transRw').addClass('failureRw')
						$('.retrievedRw').first().children('.transRw:nth-child(3)').children('.message').prepend(' '+$('.retrievedRw').first().children('.transRw:nth-child(3)').children('.type').html())
						$('.retrievedRw').first().children('.transRw:nth-child(3)').children('.type').html('[FAILED]')
					}
					sortTime("asc",true);
				}
			}
			if(d.transactions.length == 0)
			{
				$('<tr class="retrievedRw" ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw"></td><td class="transRw" style="width:1%; white-space:nowrap"></td><td colspan="2" class="transRw" style="text-align:center">No results found</td><td class="transRw txtRight"></td><td class="smlBrk"></td></tr>').insertAfter('#insAft')
				$('#filterRw div').hide();
			}
			else
			{
				$('#filterRw div').show();
			}
			$('#space').html('');
			var colour = colours[$('#userType').html().toLowerCase().replace(' ', '_')]
			$('.transRw').css('color', colour)
			$('.failureRw').css('color', '#A91024')
			$('.transRw').css('borderTopColor', colour)
			$('.transRw').css('borderBottomColor', colour)
			$('#menuBtn').show()
		},
		error: function(e)
		{
			console.log(e)
		}
	})
}
function get_update(field, v5cID)
{
	for(var i = found_cars[v5cID].length-2; i > -1; i--)
	{
		if(found_cars[v5cID][i].function_name == 'update_'+field)
		{
			return found_cars[v5cID][i].args;
		}
	}
	return 'undefined'
}
var filtShowing = false;
function toggleFilters()
{
	if(menuShowing)
	{
		toggleMenu()
	}
	if(!filtShowing)
	{
		$('#sortTxt').animate({
			left: "+=92"
		}, 500, function()
		{
			$('#sortTxt').hide();
		});
		$('#filtTxt').animate({
			left: "+=92"
		}, 500, function(){
			$('#filtTxt').animate({left: "-=92"}, 0);
			$('#filtTxt').css('border-bottom', '0');
			$('#filtTxt').html('Filters &and;<span id="filtBlock" class="whiteBlock" ></span>');
			$('#filtBlock').css('display', 'block');
			$('#filters').slideDown(500);
		});
	}
	else
	{
		$('#filters').slideUp(500);
		setTimeout(function(){
			$('#filtTxt').css('border-bottom', '2px solid');
			$('#filtTxt').css('border-bottom-color', colours[$('#userType').html().toLowerCase().replace(' ', '_')]);
			$('#filtTxt').html('Filters &or;<span id="filtBlock" class="whiteBlock" ></span>');
			$('#filtBlock').css('display', 'none');
			$('#sortTxt').show()
			$('#filtTxt').animate({left: "+=92"}, 0);
			$('#sortTxt').animate({
				left: "-=92"
			}, 500, function()
			{
			});
			$('#filtTxt').animate({
				left: "-=92"
			}, 500, function(){
			});
		}, 500)
	}
	filtShowing = !filtShowing;
	sortShowing = false;
}
var sortShowing = false;
function toggleSorts()
{
	if(menuShowing)
	{
		toggleMenu()
	}
	if(!sortShowing)
	{
		$('#filtTxt').animate({
			left: "+=122"
		}, 500, function()
		{
			$('#filtTxt').hide();
			$('#sortTxt').css('border-bottom', '0');
			$('#sortTxt').html('Sort &and;<span id="sortBlock" class="whiteBlock" ></span>');
			$('#sortBlock').css('display', 'block');
			$('#sorts').slideDown(500);
		});
	}
	else
	{
		$('#sorts').slideUp(500);
		setTimeout(function(){
			$('#sortTxt').html('Sort &or;<span id="sortBlock" class="whiteBlock" ></span>');
			$('#sortBlock').css('display', 'none');
			$('#sortTxt').css('border-bottom', '2px solid');
			$('#sortTxt').css('border-bottom-color', colours[$('#userType').html().toLowerCase().replace(' ', '_')]);
			$('#filtTxt').show();
			$('#filtTxt').animate({
				left: "-=122"
			}, 500, function()
			{
			});
		}, 500)
	}
	sortShowing = !sortShowing;
	filtShowing = false;
}

function hideType(box, field)
{
	$(box).css('background-image','url("")')
	$('.retrievedRw').each(function(){
		if($(this).find('.transRw:eq(1)').find('.type').html() == field)
		{
			$(this).hide();
		}
	})
	$(box).attr("onclick","showType(this, '"+field+"')");
}

function showType(box, field)
{
	$(box).css('background-image','url("Icons/tick.svg")')
	$('.retrievedRw').each(function(){
		if($(this).find('.transRw:eq(1)').find('.type').html() == field)
		{
			$(this).show();
		}
	})
	$(box).attr("onclick","hideType(this, '"+field+"')");
}

function sortTime(type,initial)
{
	var arr = sortTimeIntoArray()
	if(type == 'desc')
	{
		arr = arr.reverse();
	}
	$('.retrievedRw').remove();
	for(var i = 0; i < arr.length; i++)
	{
		$($(arr[i]).clone()).insertAfter('#insAft')
	}

	if(!initial){
		toggleSorts();
	}
}

function sortTimeIntoArray()
{
	var storage = [];
	$('.retrievedRw').each(function()
	{
		if(storage.length == 0)
		{
			storage.push($(this));
		}
		else
		{
			var curr = $(this)
			for(var i = 0; i < storage.length; i++)
			{
				
				var currSplit = $(curr).children('.txtRight').html().split(' ');
				var currDate = currSplit[0];
				var currTime = currSplit[1];
				var currDate = currDate.split("/").reverse().join("-") + ' ' + currTime;
				
				var elSplit = $(storage[i]).children('.txtRight').html().split(' ');
				var elDate = elSplit[0];
				var elTime = elSplit[1];
				var elDate = elDate.split("/").reverse().join("-") + ' ' + elTime;
				if(currDate < elDate)
				{
					storage.splice(i, 0, curr);
					break;
				}
				else if(i == storage.length - 1)
				{
					storage.push(curr)
					break;
				}
			}
		}
	})
	return storage;
}

function sortV5CID(type)
{
	var arr = sortV5CIDIntoArray()
	if(type == 'desc')
	{
		arr = arr.reverse();
	}
	$('.retrievedRw').remove();
	for(var i = 0; i < arr.length; i++)
	{
		$($(arr[i]).clone()).insertAfter('#insAft')
	}
	toggleSorts();
}

function sortV5CIDIntoArray()
{
	var storage = [];
	$('.retrievedRw').each(function()
	{
		if(storage.length == 0)
		{
			storage.push($(this));
		}
		else
		{
			var curr = $(this)
			for(var i = 0; i < storage.length; i++)
			{
				
				var currSplit = $(curr).children('.transRw:first').html()
				var elSplit = $(storage[i]).children('.transRw:first').html()
				
				if(currSplit < elSplit)
				{
					storage.splice(i, 0, curr);
					break;
				}
				else if(i == storage.length - 1)
				{
					storage.push(curr)
					break;
				}
			}
		}
	})
	return storage;
}

function clearSearch()
{
	if($('#searchBar').val() == 'Search by V5C ID...')
	{
		$('#searchBar').val('')
	}
}


function runSearch()
{
	$('#searchBar').val($('#searchBar').val().toUpperCase())
	$('.retrievedRw').show();
	$('.retrievedRw').each(function()
	{
		if($('#searchBar').val() == '')
		{
			
		}
		else if($(this).children('.transRw:first').html().indexOf($('#searchBar').val()) == -1)
		{
			$(this).hide();
		}
	});
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

//////////////////////////////////Sessions//////////////////////////////////////

function changeUser(company, parent, pos)
{
	
	//xhr.abort();
	
	$('.userHldr').removeClass('userHldr'+$('#userType').html().replace(' ', ''))
	$('#userDets').html('<span id="username" >'+config.participants.users[parent][pos].user+'</span> (<span id="userType">'+config.participants.users[parent][pos].type+'</span>: <span id="company">'+config.participants.users[parent][pos].company+'</span>)')
	changePageColour(config.participants.users[parent][pos].type.toLowerCase().replace(' ', '_'));
	$('.userHldr').addClass('userHldr'+config.participants.users[parent][pos].type)
	toggleMenu();
	$('#insAft').html('<td class="smlBrk"></td><td colspan="5" id="space" style="text-align: center"><img class="loader" src="Images/'+config.participants.users[parent][pos].type.replace(' ', '_')+'/loading.gif" height="50" width="50" alt="loading" text="please wait..." /><br /><br /></td><td class="smlBrk"></td>');
	$('.retrievedRw').remove()
	/*
	Creates a session on the application server using the user's account name
	*/
	
	$.ajax({
		type: 'POST',
		data:  '{"participantType":"'+parent+'","account": "'+company+'"}',
		dataType : 'json',
		contentType: 'application/json',
		crossDomain:true,
		url: '/admin/identity',
		success: function(d) {
			getTransactions();
		},
		error: function(e){
			console.log(e)
		},
		async: false
	});

	sortTime("asc",true);
}

var colours = {}
colours.regulator = "#00648D"
colours.manufacturer = "#016059"
colours.dealership = "#008A52"
colours.lease_company = "#372052"
colours.leasee = "#BA0E6F"
colours.scrap_merchant = "#DD721B"

function changePageColour(type)
{
	loadLogo(type)
	$('.txtColorChng').css('color', colours[type])
	$('.bgColorChng').css('background-color', colours[type])
	$('.bdrColorChng').css('border-color', colours[type])
	$('.userHdr').css('border-bottom-color', colours[type])
	$('#sorts').css('border-color', colours[type])
	$('#filters').css('border-color', colours[type])
}

function pad(value) {
    if(value < 10) {
        return '0' + value;
    } else {
        return value;
    }
}
