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
			if(d.height == 2) //checks to see if the genesis block and a block containing the transaction of the chaincode deployment, exists.
			{
				$('a').removeClass('greyOutLink')
				$('.prematureMsg').hide()
				$('.welcomeMsg').show()
			}
			else if(d.height < 2) //chaincode hasn't been deployed
			{
				$('.prematureMsg').show()
				$('a').addClass('greyOutLink')
				setTimeout(function(){checkBlocksAlready()}, 2000)
				
			}
			else
			{
				$('.prematureMsg').hide()
				$('a').removeClass('greyOutLink')
			}
		},
		error: function(e) {
			console.log(e)
		}
	});
}