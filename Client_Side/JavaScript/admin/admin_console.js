var addr;
var peersArr = [];
var minBool = true;

peersArr.push(addr);

$(document).ready(function(){
	getTrace();	
	//getPeers();
})

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

function resetChain()
{
	
	$('#fade').show();
	$('#loader').show();
	$('#loaderMessages').append('<i>Resetting the blockchain</i><span id="latestSpan">...</span><br>');
	
	$.ajax({
		type: 'POST',
		dataType : 'json',
		contentType: 'application/json',
		crossDomain:true,
		url: '/blockchain',
		success: function(d) {
			console.log(d)
			$('#latestSpan').html('&#10004');
			$('#loaderMessages').append('<br /><br /><span id="okTransaction" onclick="confTrans();">OK</span>');
			$('#chooseConfHd').html('<span>Blockchain reset</span>');
			$('#confTxt').html('Blockchain reset');
		},
		error: function(e){
			console.log(e)
		},
		async: false
	});
}

function deployChaincodes()
{
	
	$('#fade').show();
	$('#loader').show();
	
	var data = {}
	var found = [];
	var xhr = new XMLHttpRequest()
	xhr.open("POST", "/admin/demo",true)
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xhr.overrideMimeType("text/plain");
	xhr.onprogress = function () {
		var data = xhr.responseText;
		var array = data.split("&&");
		for(var i = 0; i < array.length; i++)
		{
			if(array[i] != "")
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
					$('#latestSpan').html('&#10004');
					$('#latestSpan').attr('id','');
					$('#loaderMessages').append('<i>'+JSON.parse(array[i]).message+' </i><span id="latestSpan">...</span><br>');
					console.log(JSON.parse(array[i]).message)
					found.push(JSON.parse(array[i]).message)
				}
			}
		}
	}
	xhr.onreadystatechange = function (){
		if(xhr.readyState === 4)
		{
			var data = xhr.responseText;
			var array = data.split("&&");
			$('#latestSpan').html('&#10004');
			$('#loaderMessages').append('<br /><br /><span id="okTransaction" onclick="confTrans();">OK</span>');
			$('#chooseConfHd').html('<span>Demo Reset Complete</span>');
			$('#confTxt').html('Demo reset!');
		}
	}
	xhr.send(JSON.stringify(data))
}

function getPeers()
{
	$('.peer').remove();
	var mining = 'Off';
	var miningCrc = 'rdCrc';
	$.ajax({
		type: 'GET',
		dataType : 'json',
		contentType: 'application/json',
		crossDomain:true,
		url: '/blockchain/nodes/'+addr+'/mining',
		success: function(d) {
			minBool = d.mining;
			if(d.mining)
			{
				mining = 'On'
				miningCrc = "grCrc"
			}
		},
		error: function(e){
			console.log(e)
		},
		async: false
	});
	var cnctd = 'No';
	var cnctdCrc = 'rdCrc';
	$.ajax({
		type: 'GET',
		dataType : 'json',
		contentType: 'application/json',
		crossDomain:true,
		url: '/blockchain/nodes/'+addr,
		success: function(d) {
			if(d.listening)
			{
				cnctd = 'Yes'
				cnctdCrc = "grCrc"
			}
		},
		error: function(e){
			console.log(e)
		},
		async: false
	});
	$('<div class="peer" >'+
		'<div class="bordTLRB blueBack">IP: <span class="alR" >'+addr+'</span></div>'+
		'<div class="bordLRB ">Mining: <span class="alR" ><span id="minTog" onclick="toggleMining()"">'+mining+'<span class="'+miningCrc+'" ></span></span></span></div>'+
		'<div class="bordLRB ">Connected: <span class="alR" ><span id="disCon">'+cnctd+'<span class="'+cnctdCrc+'" ></span></span></span></div>'+
		'<div class="bordLRB ">Focus: <span class="alR" ><span id="setFoc">Yes<span class="grCrc" ></span></span></span></div>'+
	'</div>').insertBefore('#addPeerPrnt')
}
/*
function resetChain()
{
	$('#fade').show();
	$('#loader').show();
	$.ajax({
		type: 'POST',
		dataType : 'json',   //you may use jsonp for cross origin request
		contentType: 'text/html',
		crossDomain:true,
		url: '/blockchain/demo',
		success: function(d) {
			$('#loader').hide();
			$('#confTbl').show();
		},
		error: function(e){
			console.log(e)
		}
	});
}
*/
function doneReset()
{
	$('#confTbl').hide();
	$('#fade').hide();
	window.location.reload();
}

function toggleMining()
{
	var data = {};
	if(minBool)
	{
		data.update_type = 'stop';
	}
	else
	{
		data.update_type = 'start';
	}
	var mining = 'Off';
	var miningCrc = 'rdCrc';
	$.ajax({
		type: 'PUT',
		dataType : 'json',
		data: JSON.stringify(data),
		contentType: 'application/json',
		crossDomain:true,
		url: '/blockchain/nodes/'+addr+'/mining',
		success: function(d) {
			minBool = d.mining;
			if(minBool)
			{
				mining = 'On'
				miningCrc = "grCrc"
			}
		},
		error: function(e){
			console.log(e)
		},
		async: false
	});
	$('#minTog').html(mining+'<span class="'+miningCrc+'" ></span>');

}
