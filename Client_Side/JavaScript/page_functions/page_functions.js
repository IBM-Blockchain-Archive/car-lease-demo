/* eslint-env jquery, browser */
/* global $:true */

$(document).ready(function(){

    $(document).on('click', '.chkBx', function(){
        let isChk = $(this).siblings('.isChk').val();
        if(isChk === 'true') {
            $(this).siblings('.isChk').val('false');
            $(this).css('background-image','url("")');
        } else {
            $(this).siblings('.isChk').val('true');
            $(this).css('background-image','url("Icons/'+pgNm+'/tick.svg")');
        }
    });

    $(document).on('click', '.radBtn', function(){
        let isChk = $(this).siblings('.isChk').val();
        $(this).parent().parent().parent().find('.radBtn').css('background-image','url("")');
        $(this).parent().parent().parent().find('.radBtn').siblings('.isChk').val('false');
        if(isChk === 'true') {
            $(this).siblings('.isChk').val('false');
            $(this).css('background-image','url("")');
        } else {
            $(this).siblings('.isChk').val('true');
            $(this).css('background-image','url("Icons/'+pgNm+'/circ.svg")');
        }
    });


    $('#subPg').click(function(){ //Transfer button

        /*
        Formats the transaction request for a transfer of a V5C. Needs to have at least 1 V5C to transfer and a specified recipient.
        Constructs the transaction complete pop up at this point as well but only shows it once the transaction is complete.
        */
        setCookie();
        //var table = document.getElementById("selVhclsTbl");
        let index = 1;
        let id;
        let last = false;

        $('#fade').show();

        if($('#selVhclsTbl tr').length >= 1 && $('#recipientInfo').html() != '') {

            let spans = '';
            for(let i = 0; i < $('#selVhclsTbl tr').length; i++) {
                spans += '<div class="loaderSpan" id="span'+(i+1)+'"><u>Asset '+(i+1)+'</u><br /><br /><span id="msg'+(i+1)+'Part1"></i>waiting...</i></span><br /><span id="msg'+(i+1)+'Part2"></span><br /><span id="msg'+(i+1)+'Part3"></span><br /><span id="msg'+(i+1)+'Part4"></span><br /></div>&nbsp;';
            }

            $('#loaderMessages').html(spans);

            $('#loader').show();

            let carDets = [];

            $('#selVhclsTbl tr').each(function() {

                let v5cID = $(this).find('.v5cID').val();

                $('#chooseConfHd').html('<span>Transaction Complete</span>');
                $('#confTxt').html('Transaction committed to the blockchain. <br /><br />Manufacturer: '+getCookie('user')+'<br /><br />'+recDets+': '+$('.delName').html()+' (Account '+$('.accAddr').html()+')<br /><br />Vehicles: '+$('#selVhclsTbl tr').length);

                let data = {}; //Data to be sent
                data.function_name= transferName; //E.g. manufacturer_to_private
                data.value= $('.accAddr').html(); //Recipent e.g. dealership name
                data.v5cID = v5cID;

                carDets.push(data); //Adds each assets data to array

            });

            transferAssets(carDets);

        } else if(!($('#selVhclsTbl tr').length <= 1)) {
            $('#failTransfer').show();
            $('#failTxt').html('You have not selected any vehicles to transfer.');
        } else {
            $('#failTransfer').show();
            $('#failTxt').html('You have not selected a recipient.');
        }
    });


    $('#scrapPg').click(function(){
        /*
        Formats the transaction request for the scrapping of a V5C. Needs to have at least 1 V5C selected. For each V5C selected
        a separate transaction request is created, these details are also added to the transaction complete pop up which gets shown
        when the transactions are complete.
        */

        setCookie();

        //var table = document.getElementById("selVhclsTbl");
        let index = 1;
        let id;
        let last = false;

        $('#fade').show();

        if($('#selVhclsTbl tr').length >= 1) {
            let spans = '';
            for(let i = 0; i < $('#selVhclsTbl tr').length; i++) {
                spans += '<div class="loaderSpan" id="span'+(i+1)+'"><u>Asset '+(i+1)+'</u><br /><br /><span id="msg'+(i+1)+'Part1"></i>waiting...</i></span><br /><span id="msg'+(i+1)+'Part2"></span><br /><span id="msg'+(i+1)+'Part3"></span><br /><span id="msg'+(i+1)+'Part4"></span><br /></div>&nbsp;';
            }

            $('#loaderMessages').html(spans);

            $('#loader').show();

            let carDets = [];

            $('#selVhclsTbl tr').each(function() {

                let v5cAddr = $(this).find('.v5cID').val();
                if(index == $('#selVhclsTbl tr').length) {
                    last = true;
                }
                $('#confTxt').html('Transaction committed to the blockchain. <br /><br />Scrap Merchant: '+getCookie('user')+'<br /><br />Vehicles: '+$('#selVhclsTbl tr').length);

                let data = {};
                data.v5cID = v5cAddr;

                carDets.push(data);

            });

            scrapAssets(carDets);

        } else {
            $('#failTransfer').show();
            $('#failTxt').html('You have not selected any vehicles to scrap.');
        }
    });

    $('#cclPg').click(function(){
        window.location.href = 'index.html';
    });
});
