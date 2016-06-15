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
			if(d.height == 2)
			{
				$('a').removeClass('greyOutLink')
				$('.welcomeMsg').show()
			}
			else if(d.height < 2)
			{
				$('.prematureMsg').show()
				$('a').addClass('greyOutLink')
				
			}
			else
			{
				$('a').removeClass('greyOutLink')
			}
		},
		error: function(e) {
			console.log(e)
		}
	});
}