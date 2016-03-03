/*eslint-env node*/

var participants = require(__dirname+'/../../blockchain/participants/participants_info.js');


var id_to_user = function(data)
{
	for(var role in participants.participants)
	{
		for(var j = 0; j < participants.participants[role].length; j++)
		{
			if(participants.participants[role][j].identity == data)
			{
				return participants.participants[role][j].name;
			}
		}
	}
};

var user_to_id = function(data)
{
	for(var role in participants.participants)
	{
		for(var j = 0; j < participants.participants[role].length; j++)
		{
			if(participants.participants[role][j].name == data)
			{
				return participants.participants[role][j].identity;
			}
		}
	}
};

var get_password = function(data)
{
	for(var role in participants.participants)
	{
		for(var j = 0; j < participants.participants[role].length; j++)
		{
			if(participants.participants[role][j].name == data || participants.participants[role][j].identity == data)
			{
				return participants.participants[role][j].password;
			}
		}
	}
};



exports.id_to_user = id_to_user;
exports.user_to_id = user_to_id;
exports.get_password = get_password;