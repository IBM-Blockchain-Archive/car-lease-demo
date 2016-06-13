$(document).ready(function(){
	checkBlocksAlready()
})

//If theres already blocks then we can't set up the demo scenario
function checkBlocksAlready()
{
	$.ajax({
		type: 'GET',
		dataType : 'json',
		contentType: 'application/json',
		crossDomain:true,
		url: '/blockchain/blocks',
		success: function(d) {
			if(d.height == 1)
			{
				$('.welcomeMsg').show()
			}
		},
		error: function(e) {
			console.log(e)
		}
	});
}
