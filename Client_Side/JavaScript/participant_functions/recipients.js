function loadRecipients()
{
	/*
	Get all the recipients and their information which is stored on the application server. Recipients are grouped by role and
	the role of the recipient is hard coded in the recPlural variable on each html page. e.g. recPlural = Dealerships on
	the manufacturer.html page.
	Need the recPlural value because there is a separate file for each role on the application server so it is used to know which
	file to get the information from.
	*/
	
	var newRecPlural = recPlural.replace(" ", "_");
	
	var toRet = [];
	$.ajax({
		type: 'GET', 
		contentType: 'application/json',
		crossDomain:true,
		url: '/blockchain/participants/'+newRecPlural.toLowerCase(),
		success: function(d) {
			
			$("#recsTbl").empty();
			for(var i = 0; i < d.result.length; i++)
			{
				var data = d.result[i];
				$("#recsTbl").append("<tr class='recRw' ><td class='recInfo centAl'>" + data.name + "</td><td class='chkHldr'><span class='chkSpc' ></span><span class='radBtn' ></span><input class='isChk' type='hidden' value='false' /><input class='posArr' type='hidden' value='"+i+"' /></td></tr>");
			}
			changeBarSize();
			toRet = d.result;
		},
		error: function(e){
			console.log(e)
		},
		async: false
	});
	return toRet;
}