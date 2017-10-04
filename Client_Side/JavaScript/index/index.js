$(document).ready(function(){
    checkChainHeight();
});

// let errorNumber = 0;

//Check chain height to see if chaincode has been deployed
function checkChainHeight()
{
    // $.ajax({
    //     type: 'GET',
    //     dataType : 'json',
    //     contentType: 'application/json',
    //     crossDomain:true,
    //     url: '/blockchain/blocks',
    //     success: function(d) {
    //         if(d.height === 2) //checks to see if the genesis block and a block containing the transaction of the chaincode deployment, exists.
	// 		{
    //             errorNumber = 0;
    //             $('a').removeClass('greyOutLink');
    //             $('.prematureMsg').hide();
    //             $('.welcomeMsg').show();
    //         }
    //         else if(d.height < 2) //chaincode hasn't been deployed
	// 		{
    //             $('.prematureMsg').show();
    //             $('a').addClass('greyOutLink');
    //             setTimeout(function(){checkChainHeight();}, 5000);

    //         }
    //         else
	// 		{
    //             errorNumber = 0;
    //             $('.prematureMsg').hide();
    //             $('a').removeClass('greyOutLink');
    //         }
    //     },
    //     error: function(err) {

    //         if(errorNumber < 5){
    //             errorNumber++;
    //             setTimeout(function(){checkChainHeight();}, 5000);
    //         }else{
    //             console.log('Error count exceeded:',err);
    //             errorNumber = 0;
    //         }


    //     }
    // });
    $('.prematureMsg').show();
    $('a').addClass('greyOutLink');

    window.onload = () => {
        let socket;
        $(window).on('beforeunload', () => {
            socket.close();
        });
        let url = window.location.href;
        let uriParts = url.split('/');
        let host = uriParts[0] + '//' + uriParts[2];
        socket = io.connect(host);

        socket.on('setup', (data) => {
            console.log(data);
            if (data.success) {
                $('a').removeClass('greyOutLink');
                $('.prematureMsg').hide();
                $('.welcomeMsg').show();
            } else if (data.error) {
                $('.prematureMsg').hide();
                $('.welcomeHeader').css({'background-color': '#A91024', 'border-color': '#A91024'}).html('');
                $('.welcomeMsg').show();
                $('#lftBxHd').html(data.error);
                $('.welcomeMsgTxt').html(data.detailedError);
            }
        });
    };
}
