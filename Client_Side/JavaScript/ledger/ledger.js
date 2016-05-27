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
			$('#theirUsers').append('<span class="userHldr userHldr'+$('#userType').html().replace(' ', '')+'" onclick="changeUser(\''+users[i].name+'\', \''+parent+'\', '+i+')" >'+users[i].name+'</span>')
		}
		$('#endUsers').css('top', (40*(++pos)-33)+'px')
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

function getTransactions()
{
	$('#searchBar').val('Search by V5C ID...')
	$.ajax({
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		crossDomain: true,
		url: '/blockchain/vehicle_logs',
		success: function(d) {
			formatLogs(d)
		},
		error: function(e)
		{
			$('<tr class="retrievedRw" ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw"></td><td class="transRw" style="width:1%; white-space:nowrap"></td><td colspan="2" class="transRw" style="text-align:center">'+JSON.parse(e.responseText).message+'</td><td class="transRw txtRight"></td><td class="smlBrk"></td></tr>').insertAfter('#insAft')
			$('#filterRw div').hide();
			$('#space').html('');
			var colour = colours[$('#userType').html().toLowerCase().replace(' ', '_')]
			$('.transRw').css('color', colour)
			$('.transRw').css('borderTopColor', colour)
			$('.transRw').css('borderBottomColor', colour)
		}
	})
}

function formatLogs(data)
{
	if(data.length == 0)
	{
		$('<tr class="retrievedRw" ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw"></td><td class="transRw" style="width:1%; white-space:nowrap"></td><td colspan="2" class="transRw" style="text-align:center">No results found</td><td class="transRw txtRight"></td><td class="smlBrk"></td></tr>').insertAfter('#insAft')
		$('#filterRw div').hide();
	}
	else
	{
		$('#filterRw div').show();
	}
	
	for(var i = 0; i < data.length; i++)
	{
		if(data[i].name == "Create"){
			$('<tr class="retrievedRw" ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw">['+data[i].v5c_ID+'] </td><td class="transRw" style="width:1%; white-space:nowrap"><span class="type" >'+data[i].name+'</span>: DVLA</td><td colspan="2" class="transRw">'+data[i].text+'</td><td class="transRw txtRight">'+data[i].time+'</td><td class="smlBrk"></td></tr>').insertAfter('#insAft')
		}
		else if(data[i].name == "Transfer")
		{
			var transferDetails = data[i].text.substring(0,data[i].text.indexOf("&&"))
			var carDetails = data[i].text.substring(data[i].text.indexOf("&&")+2)

			if(carDetails.indexOf('UNDEFINED') != -1)
			{
				carDetails = 'Vehicle Template' 
			}
			
			$('<tr class="retrievedRw" ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw">['+data[i].v5c_ID+'] </td><td class="transRw" style="width:1%; white-space:nowrap"><span class="type" >'+data[i].name+'</span>: '+transferDetails+'</td><td colspan="2" class="transRw">'+carDetails+'</td><td class="transRw txtRight">'+data[i].time+'</td><td class="smlBrk"></td></tr>').insertAfter('#insAft')			
		}
		else if(data[i].name == "Update")
		{
			$('<tr class="retrievedRw " ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw">['+data[i].v5c_ID+'] </td><td class="transRw" style="width:1%; white-space:nowrap"><span class="type" >'+data[i].name+'</span>: '+data[i].users[0]+'</td><td colspan="2" class="transRw">'+data[i].text+'</td><td class="transRw txtRight">'+data[i].time+'</td><td class="smlBrk"></td></tr>').insertAfter('#insAft')			
		}
		else if(data[i].name == "Scrap")
		{
			$('<tr class="retrievedRw" ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw">['+data[i].v5c_ID+'] </td><td class="transRw" style="width:1%; white-space:nowrap"><span class="type" >'+data[i].name+'</span>: '+data[i].users[0]+'</td><td colspan="2" class="transRw">'+data[i].text+'</td><td class="transRw txtRight">'+data[i].time+'</td><td class="smlBrk"></td></tr>').insertAfter('#insAft')			
		}
	}
	$('#space').html('');
	var colour = colours[$('#userType').html().toLowerCase().replace(' ', '_')]
	$('.transRw').css('color', colour)
	$('.transRw').css('borderTopColor', colour)
	$('.transRw').css('borderBottomColor', colour)

	sortTime("asc",true);

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
			$('#filtTxt').css('border-bottom', '2px solid #00648D');
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
			$('#sortTxt').css('border-bottom', '2px solid #00648D');
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
}
