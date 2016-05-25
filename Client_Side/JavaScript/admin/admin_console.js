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

function createScenario()
{
	$('#fade').show();
	$('#loader').show();
	//$('#createScenario').html('<img src="Images/Regulator/loading.gif" height="25" width="25" alt="loading" text="please wait..." />Completed: 0%')
	
	$.ajax({
		type: "POST",
		url: "/admin/demo",
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
					var data = xhr.responseText;
					console.log(data);
					var array = data.split("&&");
					for(var i = 0; i < array.length; i++)
					{
						if(array[i] != "")
						{
							console.log(array[i]);
							
							if(typeof JSON.parse(array[i]).counter != 'undefined')
							{
								var fnd = false;
								for(var j = 0; j < found.length; j++)
								{
									if(JSON.parse(array[i]).message == found[j])
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
									found.push(JSON.parse(array[i]).message)
								}
							}
							else if(typeof JSON.parse(array[i]).error == 'undefined')
							{
								var fnd = false;
								for(var j = 0; j < found.length; j++)
								{
									if(JSON.parse(array[i]).message == found[j])
									{
										fnd = true;
									}
								}
								if(!fnd)
								{
									$('#latestSpan').html('&nbsp;&#10004');
									$('#latestSpan').attr('id','');
									$('#loaderMessages').append('<i>'+JSON.parse(array[i]).message+'</i><span id="latestSpan">... <span class="completed"></span></span><br>');
									found.push(JSON.parse(array[i]).message)
									if(JSON.parse(array[i]).message == "Demo setup")
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
								if(typeof JSON.parse(array[i]).error == true)
								{
									clearInterval(checkDone);
								}
								var fnd = false;
								for(var j = 0; j < found.length; j++)
								{
									if(JSON.parse(array[i]).message == found[j])
									{
										fnd = true;
									}
								}
								if(!fnd)
								{
									$('#latestSpan').html('&nbsp;&#10004');
									$('#latestSpan').attr('id','');
									found.push(JSON.parse(array[i]).message)
									$('#loaderMessages').append('<i class="errorRes" >ERROR: '+JSON.parse(array[i]).message+'<span id="latestSpan">...</span></i><br>');
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

function addUser()
{
	$('#fade').show()
	$('#loader').show()
	var userName = $("#username").val();
	var userRole = 1;
	var userAff = $("#selectedType").html();
	
	if(validateUserData(userName, userAff))
	{
				
		var data = {};
		data.user = userName;
		data.role = userRole;
		data.aff = userAff;
	
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
}

function validateUserData(username, userType)
{
	var retVal = true;
	$('#failTxt').html('');
	if(username.trim() == "" || username.trim() == "Username...")
	{
		$('#failTxt').append('Username not entered.</br>');
		$('#failTransfer').show();
		$('#loader').hide()
		retVal = false;
	}
	if(userType.trim() == "Type")
	{
		$('#failTxt').append('User type not selected.');
		$('#failTransfer').show()
		$('#loader').hide()
		retVal = false;
	}
	
	return retVal;
}

function clearUsername()

{

	if($('#username').val() == 'Username...')

	{

		$('#username').val('')

	}

}

function refillUsername()

{
	if($('#username').val() == '')

	{

		$('#username').val('Username...')

	}

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



