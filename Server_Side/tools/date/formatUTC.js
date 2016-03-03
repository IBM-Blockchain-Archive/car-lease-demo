/*************************************************************************************************************************************
Function to convert a timestamp to a UTC format
*************************************************************************************************************************************/

var convert = function(timestamp)
{
	var date = new Date(timestamp);
	
	var day = date.getDate();
	if(day < 10)
	{
		day = "0"+day;
	}
	var month = date.getMonth()+1;
	if(month < 10)
	{
		month = "0"+ month;
	}
	var year = date.getFullYear();
	var hours = date.getHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();

	if(hours < 10)
	{
		hours = "0" + hours;
	}

	var formattedTime = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
	return formattedTime;
}
exports.convert = convert;
