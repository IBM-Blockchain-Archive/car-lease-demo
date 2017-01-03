$(document).ready(function(){
    $('#doneConf').on('click', function(){
        let now = new Date();
        let time = now.getTime() + 4*3600 * 1000;
        now.setTime(time);
        document.cookie = 'confPgRefresh='+$('#username').html()+'; expires='+now.toUTCString()+'; path=/';
        window.location.reload();
    });

    $('#doneFail').on('click', function(){
        let now = new Date();
        let time = now.getTime() + 4*3600 * 1000;
        now.setTime(time);
        document.cookie = 'confPgRefresh='+$('#username').html()+'; expires='+now.toUTCString()+'; path=/';
        window.location.reload();
    });
    if(getCookie('confPgRefresh') != -1)
	{
        $('#username').html(getCookie('confPgRefresh'));
        $('#company').html(getCookie('user').replace('_', ' '));
        document.cookie = 'confPgRefresh='+$('#username').html()+';expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
        if(window.location.href.indexOf('update') > -1)
		{
            loadUpdateAssets();
        }
    }
    else
	{
        loadParticipant(pgNm.toLowerCase());
        setCookie();
        if(window.location.href.indexOf('update') > -1)
		{
            loadUpdateAssets();
        }
    }
    getAltUsers();
});

function getAltUsers()
{

    $.ajax({
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        crossDomain: true,
        url: '/blockchain/participants/'+pgNmPlural,
        success: function(d) {

            let data = d.result;

            for(let i = 0; i < data.length; i++)
			{
				 $('#users').append('<span class="userHldr userGroup" onclick="changeUser(\''+data[i].name.replace('\'','\\\'')+'\', \''+pgNmPlural+'\','+i+')" ><span>'+data[i].name+'</span></span>');
            }
        },
        error: function(e)
		{
            console.log(e);
        }
    });
}

function changeUser(company, parent, pos)
{
    $('.userHldr').removeClass('userHldr'+$('#userType').html().replace(' ', ''));
    $('#userDets').html('<span id="username" >'+config.participants.users[parent][pos].user+'</span> (<span id="userType">'+config.participants.users[parent][pos].type+'</span>: <span id="company">'+config.participants.users[parent][pos].company+'</span>)');
    toggleMenu();
    let now = new Date();
    let time = now.getTime() + 4*3600 * 1000;
    now.setTime(time);
    document.cookie = 'user='+company+'; expires='+now.toUTCString()+'; path=/';
	/*
	Creates a session on the application server using the user's account name
	*/
    $.ajax({
        type: 'POST',
        data: '{"participantType":"'+pgNmPlural+'","account": "'+company+'"}',
        dataType : 'json',
        contentType: 'application/json',
        crossDomain:true,
        url: '/admin/identity',
        success: function(d) {
            $('#selVhclsTbl').empty();
            console.log(getCookie('user'));
        },
        error: function(e){
            console.log(e);
        },
        async: false
    });
}

let menuShowing = false;

function toggleMenu()
{
    if(!menuShowing)
	{
        $('#userDets').animate({
            marginRight: '-='+($('#userDets').width())
        }, 500, function(){
            $('#userDets').hide();
            $('#users').slideDown(500);
            $('.dropTd').animate({
                paddingBottom: '+=21.5px'
            }, 500);
            $('#userBlock').css('display', 'block');
        });
    }
    else
	{
        $('#users').slideUp(500);
        $('.dropTd').animate({
            paddingBottom: '-=21.5px'
        }, 500);
        setTimeout(function(){
            $('#userBlock').css('display', 'none');
            $('#userDets').show();
            $('#userDets').animate({
                marginRight: '10px'
            }, 500);
        }, 500);
    }
    $('#endUsers').css('display', 'none');
    menuShowing = !menuShowing;
}

function confTrans()
{
    $('#confTbl').show();
    $('#loader').hide();
    $('#loaderMessages').html('');
}

function errCreate(v5cID)
{
    $('#failHd span').html('Creation Failed');
    $('#failTransfer').show();
    $('#failTxt').html('Failed to create car with v5cID: '+v5cID);
    $('#loader').hide();
    $('#loaderMessages').html('');
}

function errUpdate(errArr, succArr)
{
    let errList = '';
    for(var i = 0; i < errArr.length; i++)
	{
        errList += errArr[i] + ', ';
    }
    errList = errList.substring(0, errList.length - 2);

    let succList = '';
    for(var i = 0; i < succArr.length; i++)
	{
        succList += succArr[i] + ', ';
    }
    if(succArr.length > 0)
	{
        succList = succList.substring(0, succList.length - 2);
    }

    $('#failHd span').html('Updates Failed');
    $('#failTransfer').show();
    $('#failTxt').html('Completed with some errors: <br /><br />Failed fields: '+errList+'<br /><br />Successful fields: '+succList);
    $('#loader').hide();
    $('#loaderMessages').html('');
}

function errTrans(numErrs, numSucc)
{
    $('#failHd span').html('Transfer Failed');
    $('#failTransfer').show();
    $('#failTxt').html('Completed with some errors: <br /><br />'+numErrs+' vehicles failed.<br />'+numSucc+' vehicles were successful');
    $('#loader').hide();
    $('#loaderMessages').html('');
}

function errScrap(numErrs, numSucc)
{
    $('#failHd span').html('Scrappage Failed');
    $('#failTransfer').show();
    $('#failTxt').html('Completed with some errors: <br /><br />'+numErrs+' vehicles failed.<br />'+numSucc+' vehicles were successful');
    $('#loader').hide();
    $('#loaderMessages').html('');
}

function getAddress(dealer)
{
    let maxAddrLn = 0;
    let html = '';
    for(let key in dealer)
	{
        if(key.indexOf('address')>-1)
		{
            html +='<div>' + dealer[key] + '</div>';
        }
    }
    return html;
}

function closeConf()
{
    window.location.reload();
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){
        if(txt.indexOf('\'') > -1){
            return txt.charAt(0).toUpperCase() + txt.substr(1, txt.indexOf('\'')).toLowerCase() + txt.charAt(txt.indexOf('\'')+1).toUpperCase() + txt.substr(txt.indexOf('\'')+2).toLowerCase();
        }
        else{
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }});
}
