'use strict';
/////////////////////////////////////Cookies////////////////////////////////////

function getCookie(name)
{
    let value = '; '+ document.cookie;
    let parts = value.split('; '+name+'=');
    if(parts.length == 2)
	{
        return parts.pop().split(';').shift();
    }
    return -1;
}

function setCookie()
{
    if(getCookie('user') != $('#company').html())
	{
        let now = new Date();
        let time = now.getTime() + 4*3600 * 1000;
        now.setTime(time);
        document.cookie = 'user='+$('#company').html()+'; expires='+now.toUTCString()+'; path=/';
    }
    createSession();
}

//////////////////////////////////Sessions//////////////////////////////////////

function createSession()
{
	/*
	Creates a session on the application server using the user's account name
	*/


    console.log('CREATE SESSION:', $('#company').html());

    $.ajax({
        type: 'POST',
        data: '{"participantType":"'+pgNmPlural+'", "account": "'+$('#company').html()+'"}',
        dataType : 'json',
        contentType: 'application/json',
        crossDomain:true,
        url: '/admin/identity',
        success: function(d) {
        },
        error: function(e){
            console.log(e);
        },
        async: false
    });
}

function getPassword()
{
    for(let i = 0; i < config.participants.users[pgNmPlural].length; i++)
	{
        if(config.participants.users[pgNmPlural][i].company == $('#company').html().split(' ').join('_'))
		{
            return config.participants.users[pgNmPlural][i].password;
        }
    }
    return 'error';
}
