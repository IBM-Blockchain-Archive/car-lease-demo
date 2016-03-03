$(document).ready(function(){
	setCookie()
	getTransactions();
	$('#searchBar').focusout(function(){
		if($('#searchBar').val().trim() == '')
		{
			$('#searchBar').val('Search by V5C ID...')
		}
	})
})

function getTransactions()
{
	$.ajax({
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		crossDomain: true,
		url: '/blockchain/events',
		success: function(d) {
			formatEvents(d)
		},
		error: function(e)
		{
			console.log(e)
		}
	})
}

function formatEvents(data)
{
	for(var i = 0; i < data.length; i++)
	{
		if(data[i].name == "Create"){
			$('<tr class="retrievedRw" ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw">['+data[i].v5c_ID+'] </td><td class="transRw" style="width:1%; white-space:nowrap"><span class="type" >'+data[i].name+'</span>: '+data[i].users[0]+'</td><td colspan="2" class="transRw">'+data[i].text+'</td><td class="transRw txtRight">'+data[i].time+'</td><td class="smlBrk"></td></tr>').insertAfter('#insAft')
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
			$('<tr class="retrievedRw" ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw">['+data[i].v5c_ID+'] </td><td class="transRw" style="width:1%; white-space:nowrap"><span class="type" >'+data[i].name+'</span>: '+data[i].users[0]+'</td><td colspan="2" class="transRw">'+data[i].text+'</td><td class="transRw txtRight">'+data[i].time+'</td><td class="smlBrk"></td></tr>').insertAfter('#insAft')			
		}
		else if(data[i].name == "Scrap")
		{
			$('<tr class="retrievedRw" ><td class="smlBrk"></td><td style="width:1%; white-space:nowrap" class="transRw">['+data[i].v5c_ID+'] </td><td class="transRw" style="width:1%; white-space:nowrap"><span class="type" >'+data[i].name+'</span>: '+data[i].users[0]+'</td><td colspan="2" class="transRw">'+data[i].text+'</td><td class="transRw txtRight">'+data[i].time+'</td><td class="smlBrk"></td></tr>').insertAfter('#insAft')			
		}
	}
	$('#space').html('');
}
var sortShowing = false;
function toggleFilters()
{
	if(!sortShowing)
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
	sortShowing = !sortShowing;
}
var sortShowing = false;
function toggleSorts()
{
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

function sortTime(type)
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
	toggleSorts();
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
