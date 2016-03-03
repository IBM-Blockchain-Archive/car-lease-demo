/////////////////////////////////////Cookies////////////////////////////////////

function getCookie(name)
{
	var value = "; "+ document.cookie;
	var parts = value.split("; "+name+"=");
	if(parts.length == 2)
	{
		return parts.pop().split(";").shift();
	}
}

function setCookie()
{
	createSession();
	if(getCookie("pgNm") != pgNm)
	{
		createSession();
		var now = new Date();
		var time = now.getTime() + 4*3600 * 1000;
		now.setTime(time);
		document.cookie = "pgNm="+pgNm+"; expires="+now.toUTCString()+"; path=/";
	}
}

//////////////////////////////////Sessions//////////////////////////////////////

function createSession()
{
	/*
	Creates a session on the application server using the user's account name
	*/
	
	$.ajax({
		type: 'POST',
		data: '{"account": "' + config.participants[pgNm.toLowerCase()].company + '"}',
		dataType : 'json',
		contentType: 'application/json',
		crossDomain:true,
		url: '/admin/identity',
		success: function(d) {
		},
		error: function(e){
			console.log(config.participants[pgNm.toLowerCase()].company);
			console.log(e);
		},
		async: false
	});
}

function readSession()
{
	/*
	Reads the current session on the application server and logs info to console.
	For debugging.
	*/
	$.ajax({
		type: 'GET',
		contentType: 'application/json',
		crossDomain:true,
		url: '/admin/identity',
		success: function(d) {
			console.log(d)
		},
		error: function(e){
			console.log(e)
		},
		async: false
	});
}