'use strict';

let participants = require(__dirname+'/../../blockchain/participants/participants_info.js');


let id_to_user = function(data)
{
    for(let role in participants.participants_info)
	{
        for(let j = 0; j < participants.participants_info[role].length; j++)
		{
            if(participants.participants_info[role][j].identity == data)
			{
                return participants.participants_info[role][j].name;
            }
        }
    }
};

let user_to_id = function(data)
{
    for(let role in participants.participants_info)
	{
        for(let j = 0; j < participants.participants_info[role].length; j++)
		{
            if(participants.participants_info[role][j].name == data)
			{
                return participants.participants_info[role][j].identity;
            }
        }
    }
};

let get_password = function(partType, data)
{
    for(let i = 0; i < participants.participants_info[partType].length; i++)
	{
        if(participants.participants_info[partType][i].name == data || participants.participants_info[partType][i].identity == data)
		{
            return participants.participants_info[partType][i].password;
        }
    }
};



exports.id_to_user = id_to_user;
exports.user_to_id = user_to_id;
exports.get_password = get_password;
