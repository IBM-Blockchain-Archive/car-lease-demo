$(document).ready(function(){
	$("#doneConf").on('click', function(){
		window.location.reload();
	});
	
	$("#doneFail").on('click', function(){
		window.location.reload();
	});
})

function confTrans()
{
	$('#confTbl').show();
	$('#loader').hide();
	$('#loaderMessages').html('');
}

function errCreate(v5cID)
{
	$('#failHd span').html('Creation Failed')
	$('#failTransfer').show();
	$('#failTxt').html('Failed to create car with v5cID: '+v5cID);
	$('#loader').hide();
	$('#loaderMessages').html('');
}

function errUpdate(errArr, succArr)
{
	var errList = "";
	for(var i = 0; i < errArr.length; i++)
	{
		errList += errArr[i] + ", "
	}
	errList = errList.substring(0, errList.length - 2);
	
	var succList = "";
	for(var i = 0; i < succArr.length; i++)
	{
		succList += succArr[i] + ", "
	}
	if(succArr.length > 0)
	{
		succList = succList.substring(0, succList.length - 2);
	}
	
	$('#failHd span').html('Updates Failed')
	$('#failTransfer').show();
	$('#failTxt').html('Completed with some errors: <br /><br />Failed fields: '+errList+'<br /><br />Successful fields: '+succList);
	$('#loader').hide();
	$('#loaderMessages').html('');
}

function errTrans(numErrs, numSucc)
{
	$('#failHd span').html('Transfer Failed')
	$('#failTransfer').show();
	$('#failTxt').html('Completed with some errors: <br /><br />'+numErrs+' vehicles failed.<br />'+numSucc+' vehicles were successful');
	$('#loader').hide();
	$('#loaderMessages').html('');
}

function errScrap(numErrs, numSucc)
{
	$('#failHd span').html('Scrappage Failed')
	$('#failTransfer').show();
	$('#failTxt').html('Completed with some errors: <br /><br />'+numErrs+' vehicles failed.<br />'+numSucc+' vehicles were successful');
	$('#loader').hide();
	$('#loaderMessages').html('');
}

function getAddress(dealer)
{
	var maxAddrLn = 0;
	var html = "";
	for(var key in dealer)
	{
		if(key.indexOf("address")>-1)
		{
			html +="<div>" + dealer[key] + "</div>"
		}
	}
	return html;
}

function closeConf()
{
	window.location.reload();
}
