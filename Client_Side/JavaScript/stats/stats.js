'use strict';
let prevFiftyBlocks = []; //Previous 125 block times (when committed to blockchain)
let timeData = [];
let transData = [];
let storeBlock; //Latest block
let blockTime;
let chainHeight;
let blockNum; //Chain height/length
let sum = 0; //Sum of total time between blocks
let avg = 'N/A';
let startBlock;
let stdDev;
let minMax;
let timeDiff; //Time difference between two blocks
let scrollWidth;
let max;
let min;

$(document).ready(function(){

    $('#goTo').bind('keyup', function(e) {
        if ( e.keyCode === 13 ) { // 13 is enter key
            goToBlock();

            $(this).animate({
                marginLeft: '+=545px'
            }, 1000);

            $(this).siblings('#srchLine').animate({
                marginLeft: '+=136px'
            }, 1000);
            searchShowing = false;
        }
    });

    $('.statsTbl').hide();

    let startFuncTime = Date.now() / 1000;

    $('#fade').show();
    $('#loader').show();
    $('.arrow_right_box').hide();
    $('.arrow_left_box').hide();

    let block;
    let lastBlockHash;
    $.ajax({
        type: 'GET',
        dataType : 'json',
        contentType: 'application/json',
        crossDomain:true,
        url: '/blockchain/blocks',
        success: function(d) {
            chainHeight = d.height;
            blockNum = d.height - 1;
            startBlock = d.height - 1;
            storeBlock = d.height - 1;
            lastBlockHash = d.currentBlockHash;
            console.log((d));
        },
        error: function(e){
            console.log(e);
        },
        async: false
    });

    $('#currBlock').html('#'+numberWithCommas(blockNum));

    $('#blockScroll').css('width', ((chainHeight)*85)-10);

    $.ajax({
        type: 'GET',
        dataType : 'json',
        contentType: 'application/json',
        crossDomain:true,
        url: '/blockchain/blocks/' + (blockNum),
        success: function(d) {
            block = d.block;

        },
        error: function(e){
            console.log(e);
        },
        async: false
    });

    let transSpans = '<br /><span class="blocksTransactionsHdr" >Transactions:</span>';

    blockTime = block.nonHashData.localLedgerCommitTimestamp.seconds;

    prevFiftyBlocks.push(block.nonHashData.localLedgerCommitTimestamp.seconds); //Needs changing. Not past 50 blocks.

    if(blockNum > 0) //If not the genesis block..
    {
        for(let i = 0; i < block.transactions.length; i++) {
            transSpans+='<br /><span class="blocksTransactions">'+block.transactions[i].txid+'</span>';
        }

        $('#blockScroll').prepend('<div class="singleBlockContainer"><div class="exBlock notClicked" onclick="changeShape(this)"><span>'+blockNum+'</span></div><br /><div class="triangle_down_big"></div><div class="triangle_down"></div><div class="blockData"><span class="blockHash"></span><br /><br /><span class="prevHash"><b>Previous Block Hash: </b><br />'+block.previousBlockHash+'</span><br /><br /><span class="blockTimeAdded"><b>Added to Chain: </b><br />'+timeConverter(block.nonHashData.localLedgerCommitTimestamp.seconds)+'</span><br />'+transSpans+'</div><input type="hidden" class="height" value="'+(351+(39*block.transactions.length))+'"></input></div>');

        $('.singleBlockContainer:last-child').find('.blockHash').html('<b>Block Hash: </b><br />'+lastBlockHash);

        lastBlockHash = block.previousBlockHash;

        blockTime = block.nonHashData.localLedgerCommitTimestamp.seconds;

        prevFiftyBlocks.push(block.nonHashData.localLedgerCommitTimestamp.seconds);

        transData.push(block.transactions.length);
        $('#transLast').html(block.transactions.length);

        for(let i = 1; i < 126; i++)
        {
            if(blockNum - i > 0)
            {
                let blk;

                $.ajax({
                    type: 'GET',
                    dataType : 'json',
                    contentType: 'application/json',
                    crossDomain:true,
                    url: '/blockchain/blocks/'+(blockNum-i),
                    success: function(d) {
                        blk = d.block;
                    },
                    error: function(e){
                        console.log(e);
                    },
                    async: false
                });

                prevFiftyBlocks.push(blk.nonHashData.localLedgerCommitTimestamp.seconds);
		blk.transactions = blk.transactions || [];

                transData.push(blk.transactions.length);

                transSpans = '<br /><span class="blocksTransactionsHdr" >Transactions:</span>';

                if (block.transactions) {
                    for(let j = 0; j < blk.transactions.length; j++)
                    {
                        transSpans+='<br /><span class="blocksTransactions" onclick="showTransaction(\''+blk.transactions[j].txid+'\') ">'+blk.transactions[j].txid+'</span>';
                    }

                    $('#blockScroll').prepend('<div class="singleBlockContainer"><div class="exBlock notClicked" onclick="changeShape(this)"><span>'+(blockNum-i)+'</span></div><br /><div class="triangle_down_big"></div><div class="triangle_down"></div><div class="blockData"><span class="blockHash"><b>Block Hash: </b><br />'+lastBlockHash+'</span><br /><br /><span class="prevHash"><b>Previous Block Hash: </b><br />'+blk.previousBlockHash+'</span><br /><br /><span class="blockTimeAdded"><b>Added to Chain: </b><br />'+timeConverter(blk.nonHashData.localLedgerCommitTimestamp.seconds)+'</span><br />'+transSpans+'</div><input type="hidden" class="height" value="'+(351+(39*blk.transactions.length))+'"></input></div>');
                }

                lastBlockHash = blk.previousBlockHash;
            }
            else if(blockNum - i == 0) //If genesis block..
            {

                let blk;

                $.ajax({
                    type: 'GET',
                    dataType : 'json',
                    contentType: 'application/json',
                    crossDomain:true,
                    url: '/blockchain/blocks/'+(blockNum-i),
                    success: function(d) {
                        blk = d.block;

                    },
                    error: function(e){
                        console.log(e);
                    },
                    async: false
                });

                $('#blockScroll').prepend('<div class="singleBlockContainer"><div class="exBlock notClicked" onclick="changeShape(this)"><span>'+(blockNum-i)+'</span></div><br /><div class="triangle_down_big"></div><div class="triangle_down"></div><div class="blockData"><span class="blockHash"><b>Block Hash: </b><br />'+lastBlockHash+'</span><br /><br /><span class="blockTimeAdded"><b>Added to Chain: </b><br />'+timeConverter(blk.nonHashData.localLedgerCommitTimestamp.seconds)+'</span><br /><br /><span class="blocksTransactionsHdr" >Transactions:</span><br /><span class="blocksTransactions">No transactions in the Genesis block.</span></div><input type="hidden" class="height" value="'+270+'"></input></div>');
            }
            else
            {
                break;
            }
        }
    }
    else
    {
        transData.push(0);
        $('#transLast').html(0);

        transSpans+='<br /><span class="blocksTransactions">No transactions in the Genesis block.</span>';

        $('#blockScroll').prepend('<div class="singleBlockContainer"><div class="exBlock notClicked" onclick="changeShape(this)"><span>'+blockNum+'</span></div><br /><div class="triangle_down_big"></div><div class="triangle_down"></div><div class="blockData"><span class="blockHash">No block hash available</span><br /><br /><span class="blockTimeAdded"><b>Added to Chain: </b><br />'+timeConverter(block.nonHashData.localLedgerCommitTimestamp.seconds)+'</span><br />'+transSpans+'</div><input type="hidden" class="height" value="'+270+'"></input></div>');
    }

    //If there are more than 125 blocks, HTML is created but data isn't filled. Used to reduce page load.
    for(let i = blockNum - 126; i > -1; i--)
    {
        $('#blockScroll').prepend('<div class="singleBlockContainer"><div class="exBlock notClicked noData" onclick="changeShape(this)"><span>'+(i)+'</span></div><br /><div class="triangle_down_big"></div><div class="triangle_down"></div><div class="blockData" style="text-align:center" ><span><img src="Images/loading.gif" style="margin-top:10px; padding:10px" height="50" width="50" /><br />Loading Block Data...</span></div><input type="hidden" class="height" value="110"></input></div>');
    }

    for(let i = 0; i < prevFiftyBlocks.length-1; i++)
    {
        timeDiff = prevFiftyBlocks[i] - prevFiftyBlocks[i+1];

        if(timeDiff > 5000) {timeDiff=5000;}

        sum += timeDiff;
        timeData.push(timeDiff);
    }

    let endFuncTime = Date.now() / 1000;

    avg = sum/(prevFiftyBlocks.length+(blockNum - startBlock)); //Average time for a block to be added

    minMax = calcStdDeviation(prevFiftyBlocks, avg);

    if(blockNum === 0)
    {
        $('#avgTime').html('NA');
    }
    else
    {
        $('#avgTime').html((Math.round((avg) * 10) / 10)+'s');
    }

    if(chainHeight < 126) //Genesis block is visible. Apply styling to show Block 0.
    {
        $('.timeCont').html('<g><span class="startBar"></span><span class="startMark" >Block 0</span></g>');
        $('.transCont').html('<g><span class="startBar"></span><span class="startMark" >Block 0</span></g>');
    }

    makeCharts(); //Charts.js

    let curr = Date.now()/1000;

    $('#timeSince').html(parseInt((curr-blockTime))+'s ago'); //How long the last block was added

    window.setInterval(updateTime, 1000);
    window.setInterval(updatePage, 10000);

    $('#blockHolder').animate({
        scrollLeft: '+='+$('#blockScroll').width()
    }, 1000, 'easeOutElastic');

    if($('#blockScroll').width() > $('#blockHolder').width())
    {
        $('.arrow_left_box').show();
    }

    $('#fade').hide();
    $('#loader').hide();
    $('.statsTbl').show();

    scrollWidth = $('#blockScroll').width();

    console.log('Total: ', $('.timeCont > g').length);

});

function updatePage()
{
    let startFuncTime = Date.now() / 1000;
    let block;
    let lastBlockHash;

    $.ajax({

        type: 'GET',
        dataType : 'json',
        contentType: 'application/json',
        crossDomain:true,
        url: '/blockchain/blocks',
        success: function(d) {
            blockNum = d.height - 1;
            lastBlockHash = d.currentBlockHash;

        },
        error: function(e){
            console.log(e);
        },
        async: false
    });

    chainHeight === blockNum; //Don't do this.

    if(storeBlock < blockNum) //If latest block number is less than chain height
    {
        $.ajax({
            type: 'GET',
            dataType : 'json',
            contentType: 'application/json',
            crossDomain:true,
            url: '/blockchain/blocks/' + blockNum,
            success: function(d) {
                block = d.block;

            },
            error: function(e){
                console.log(e);
            },
            async: false
        });

        blockTime = block.nonHashData.localLedgerCommitTimestamp.seconds;

        storeBlock = blockNum;

        let transSpans = '<br /><span class="blocksTransactionsHdr" >Transactions:</span>';

        for(let i = 0; i < block.transactions.length; i++)
            {
            transSpans+='<br /><span class="blocksTransactions" >'+block.transactions[i].uuid+'</span>';
        }

        $('#blockScroll').append('<div class="singleBlockContainer"><div class="exBlock notClicked" onclick="changeShape(this)"><span>'+(blockNum)+'</span></div><br /><div class="triangle_down_big"></div><div class="triangle_down"></div><div class="blockData"><span class="blockHash"><b>Block Hash: </b><br />'+lastBlockHash+'</span><br /><br /><span class="prevHash"><b>Previous Block Hash: </b><br />'+block.previousBlockHash+'</span><br /><br /><span class="blockTimeAdded"><b>Added to Chain: </b><br />'+timeConverter(block.nonHashData.localLedgerCommitTimestamp.seconds)+'</span><br />'+transSpans+'</div><input type="hidden" class="height" value="'+(351+(39*block.transactions.length))+'"></input></div>');
        $('#blockScroll').css('width', parseInt($('#blockScroll').css('width').replace('px',''))+85);

        $('.singleBlockContainer:last-child').find('.blockHash').html('<b>Block Hash: </b><br />'+lastBlockHash);

        $('.arrow_right_box').show();

        prevFiftyBlocks.unshift(blockTime);

        timeData.unshift(prevFiftyBlocks[0] - prevFiftyBlocks[1]);
        transData.unshift(block.transactions.length);

        $('.cont').html('');

        timeDiff = prevFiftyBlocks[0] - prevFiftyBlocks[1];

        if(timeDiff>5000) {timeDiff=5000;}

        let curr = Date.now()/1000;

        $('#timeSince').html(parseInt(curr-blockTime)+'s ago');

        sum += timeDiff;

        avg = sum/(prevFiftyBlocks.length+(blockNum - startBlock));

        minMax = calcStdDeviation(prevFiftyBlocks, avg);

        $('#avgTime').html((Math.round((avg) * 10) / 10)+'s');

        $('#currBlock').html('#'+numberWithCommas(blockNum));
        $('#transLast').html(block.transactions.length);

        makeCharts();
    }
}

function updateTime()
{
    let currStarted = $('#timeSince').html().substring(0, $('#timeSince').html().indexOf('s'));

    $('#timeSince').html((parseInt(currStarted) + 1) + 's ago');

    avg = sum/(prevFiftyBlocks.length+(blockNum - startBlock));
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function calcStdDeviation(data, avg)
{
    let letiance = 0;
    let diff;
    let res = [];

    for(let i = 0; i < prevFiftyBlocks.length-1; i++)
    {
        diff = prevFiftyBlocks[i] - prevFiftyBlocks[i+1];

        if(diff>5000){diff=5000;}

        letiance += Math.pow((diff - avg),2);
    }

    letiance /= (prevFiftyBlocks.length+(blockNum - startBlock));
    stdDev = Math.sqrt(letiance);
    max = avg + (0.5 * stdDev);
    min = avg - (0.17 * stdDev);

    res.push(Math.floor(min));
    res.push(Math.floor(max));

    return res;
}

function timeConverter(UNIX_timestamp){

    let a = new Date(UNIX_timestamp * 1000);

    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();

    let hour = a.getHours();
    let mins = a.getMinutes();
    let sec = a.getSeconds();
    let time = pad(date) + ' ' + month + ' ' + pad(year) + ' ' + pad(hour) + ':' + pad(mins) + ':' + pad(sec) ;

    return time;
}

function getBlockData(number, el)
{
    let lastBlockHash;

    $.ajax({
        type: 'GET',
        dataType : 'json',
        contentType: 'application/json',
        crossDomain:true,
        url: '/blockchain/blocks/' + (number),
        success: function(d) {
            block = d.block;

        },
        error: function(e){
            console.log(e);
        },
        async: false
    });

    $.ajax({
        type: 'GET',
        dataType : 'json',
        contentType: 'application/json',
        crossDomain:true,
        url: '/blockchain/blocks/' + (parseInt(number)+1),
        success: function(d) {
            lastBlockHash = d.block.previousBlockHash;
        },
        error: function(e){
            console.log(e);
        },
        async: false
    });

    if(number === 0)
    {

        $(el).html('<span class="blockHash" style="display:inline-block"><b>Block Hash: </b><br />'+lastBlockHash+'</span><br /><br /><span class="blockTimeAdded"  style="display:inline-block"><b>Added to Chain: </b><br />'+timeConverter(block.nonHashData.localLedgerCommitTimestamp.seconds)+'</span><br /><br /><span style="display:inline-block" class="blocksTransactionsHdr" >Transactions:</span><br /><span class="blocksTransactions" style="display:inline-block">No transactions in the Genesis block.</span>');
        $(el).css('text-align', 'left');
        $(el).siblings('.height').val(270);

        $(el).animate({
            height: '+=160px',
        }, 1000);
    }
    else
    {
        let transSpans = '<br /><span style="display:inline-block" class="blocksTransactionsHdr" >Transactions:</span>';

        for(let i = 0; i < block.transactions.length; i++)
        {
            transSpans+='<br /><span class="blocksTransactions" style="display:inline-block">'+block.transactions[i].uuid+'</span>';
        }

        $(el).html('<span class="blockHash" style="display:inline-block"><b>Block Hash: </b><br />'+lastBlockHash+'</span><br /><br /><span class="prevHash" style="display:inline-block"><b>Previous Block Hash: </b><br />'+block.previousBlockHash+'</span><br /><br /><span class="blockTimeAdded"  style="display:inline-block"><b>Added to Chain: </b><br />'+timeConverter(block.nonHashData.localLedgerCommitTimestamp.seconds)+'</span><br />'+transSpans);
        $(el).css('text-align', 'left');
        $(el).siblings('.height').val((351+(39*block.transactions.length)));
        $(el).animate({
            height: '+='+(351+(39*block.transactions.length)-110)+'px',
        }, 1000);
    }
}

//=====================================================================================================================================================

//    Block Viewer Stuff

//=====================================================================================================================================================

function scrollBlocksLeft(){

    $('.arrow_right_box').show();

    if($('#blockHolder').scrollLeft() - $('#blockHolder').width() <= 0)
    {
        let toScroll = $('#blockHolder').scrollLeft();

        $('#blockHolder').animate({
            scrollLeft: '-='+toScroll
        }, 1000, 'easeOutElastic');

        $('.arrow_left_box').hide();
    }
    else
    {
        $('#blockHolder').animate({
            scrollLeft: '-='+($('#blockHolder').width()*0.75)
        }, 1000, 'easeOutElastic');
    }
}

function scrollBlocksRight(){

    $('.arrow_left_box').show();

    if($('#blockHolder').scrollLeft() <= $('#blockScroll').width()-$('#blockHolder').width()-27)
    {

        let toScroll = ($('#blockScroll').width()-$('#blockHolder').width())-$('#blockHolder').scrollLeft();

        $('#blockHolder').animate({
            scrollLeft: '+='+toScroll
        }, 1000, 'easeOutElastic');

        $('.arrow_right_box').hide();
    }
    else
    {
        $('#blockHolder').animate({
            scrollLeft: '+='+($('#blockHolder').width()*0.75)
        }, 1000, 'easeOutElastic');
    }
}

function changeShape(el){

    if($(el).hasClass('notClicked')){
        growBlock($(el));
    }
    else if($(el).hasClass('clicked')){
        shrinkBlock($(el));
    }
}

let searchShowing = false;

function toggleSearch(el)
{
    if(!searchShowing){
        $(el).siblings('#goTo').animate({
            marginLeft: '-=545px'
        }, 1000, function(){
            $(el).siblings('#goTo').focus();
        });

        $(el).siblings('#srchLine').animate({
            marginLeft: '-=136px'
        }, 1000);
    }
    else
    {
        goToBlock();

        $(el).siblings('#goTo').animate({
            marginLeft: '+=545px'
        }, 1000);

        $(el).siblings('#srchLine').animate({
            marginLeft: '+=136px'
        }, 1000);
    }
    searchShowing = !searchShowing;
}

function goToBlock() //Search for block
{
    //scrollWidth - $('#blockScroll').width()

    let val = $('#goTo').val(); //Value entered

    let stringPresent = /[a-zA-Z]/.test(val); //Check to see if string is present
    let numberPresent = /[0-9]/.test(val); //Check to see if number is present
    let symbolPresent = /[^a-zA-Z0-9]/.test(val);

    if(numberPresent && !stringPresent){ //Checks to see if ONLY a number is present

        if(val > blockNum){ //Is value entered greater than chain height?
            $('#failTxt').text('Block number '+val+' doesn\'t exist.');
            $('#failTransfer').show();
        }
        else if(val < 0 || symbolPresent){ //Is value entered negative or a non-integer?
            $('#failTxt').text('Block number '+val+' is invalid. Block number must be a non-negative integer.');
            $('#failTransfer').show();
        }
        else{ //Value entered is legal
            let left = $($('#blockScroll').children('.singleBlockContainer').eq($('#goTo').val()).find('.exBlock')).position().left;
            let grown = 0;
            $('#blockScroll').children('.singleBlockContainer').eq(val).prevAll().each(function(){
                if($(this).children('.exBlock').hasClass('clicked'))
                {
                    grown++;
                }
            });

            let rhs = 14;

            if(!($('.arrow_right_box').is(':visible')))
            {
                rhs = 0;
            }

            if(!($('.arrow_left_box').is(':visible')))
            {
                rhs = 0;
            }

            if(left > $(document).width()/2)
            {
                rhs += 425;
            }

            if(chainHeight == val)
            {
                rhs -= 27;
            }

            $('#blockHolder').animate({
                scrollLeft: ((val- grown)*85 + grown*510 - $('#blockHolder').width()/2 + 265 - rhs) + 'px'
            }, 1000, 'easeOutCubic', function(){
                if($('#blockHolder').scrollLeft() <= $('#blockScroll').width()-$('#blockHolder').width()-27)
                {
                    $('.arrow_right_box').show();
                }
                else
                {
                    $('.arrow_right_box').hide();
                }
                if($('#blockHolder').scrollLeft() > 0)
                {
                    $('.arrow_left_box').show();
                }
                else
                {
                    $('.arrow_left_box').hide();
                }
                if($($('#blockScroll').children('.singleBlockContainer').eq(val).find('.exBlock')).hasClass('notClicked')){
                    growBlock($($('#blockScroll').children('.singleBlockContainer').eq(val).find('.exBlock')));
                }
            });
        }
    }
    else{ //If any non-numeric characters are detected, alert user to error.
        $('#failTxt').text('Invalid input. Non-numeric characters are not permitted.');
        $('#failTransfer').show();
    }
}

function growBlock(el) {

    $(el).removeClass('notClicked');

    let left = $(el).position().left;
    let top = $(el).position().top;

    $(el).parent().find('.blockData').show(0);

    let height = $(el).parent().find('.height').val();

    if(parseInt($('#blockHolder').css('height').replace('px','')) < (149+parseInt(height)))
    {
        $('#blockHolder').css('height', (149+parseInt(height))+'px');
    }

    $(el).parent().find('.blockData').hide(0);
    $(el).parent().find('.blockData').height(0);

    if(left > $(document).width()/2)
    {
        $(el).animate({
            width: '+=425px'
        }, 1000, function(){

            $('.arrow_left_box').show();
            $(el).addClass('clicked');
            $(el).parent().find('.blockData').show(0);
            $(el).parent().find('.blockData').find('span').hide(0);
            $(el).parent().find('.blockData').animate({
                height: '+='+height+'px',
                marginTop: '+=20px'
            },1000, function(){
                $(el).parent().find('.triangle_down_big').show();
                $(el).parent().find('.triangle_down').show();
                $(el).parent().find('.blockData').css('margin-top', '-2px');
                $(el).parent().find('.triangle_down_big').animate({
                    marginTop: '+=26px'
                }, 1000, function(){
                    $(el).parent().find('.blockData').find('span').fadeIn(500);
                    $(el).parent().find('.triangle_down').animate({
                        borderTopColor: '#00648D'
                    }, 1000);

                    $(el).animate({
                        backgroundColor: '#00648D',
                        color: '#FFF'
                    }, 1000, function(){
                        if($('#blockHolder').scrollLeft() > $('#blockScroll').width()-$('#blockHolder').width()-27)
                        {
                            $('.arrow_right_box').hide();
                        }
                        if($(el).hasClass('noData')){
                            $(el).removeClass('noData');
                            getBlockData($(el).children('span').html(), $(el).parent().find('.blockData'));
                        }
                    });
                });
                $(el).parent().find('.blockData').animate({
                    marginTop: '-=26px'
                }, 1000);
            });
        });

        $('#blockScroll').animate({
            width: '+=425px'
        }, 1000);

        $('#blockHolder').animate({
            scrollLeft: '+=425px'
        }, 1000);
    }
    else
    {
        $(el).animate({
            width: '+=425px'
        }, 1000, function(){

            $('.arrow_right_box').show();

            $(el).addClass('clicked');
            $(el).parent().find('.blockData').show(0);
            $(el).parent().find('.blockData').find('span').hide(0);
            $(el).parent().find('.blockData').animate({
                height: '+='+height+'px',
                marginTop: '+=20px'
            },1000, function(){

                $(el).parent().find('.triangle_down_big').show();
                $(el).parent().find('.triangle_down').show();
                $(el).parent().find('.hider').show();
                $(el).parent().find('.blockData').css('margin-top', '-2px');
                $(el).parent().find('.triangle_down_big').animate({
                    marginTop: '+=26px'
                }, 1000, function(){
                    $(el).parent().find('.blockData').find('span').fadeIn(500);
                    $(el).parent().find('.triangle_down').animate({
                        borderTopColor: '#00648D'
                    }, 1000);

                    $(el).animate({
                        backgroundColor: '#00648D',
                        color: '#FFF'
                    }, 1000, function(){
                        if($('#blockHolder').scrollLeft() <= 0)
                        {
                            $('.arrow_left_box').hide();
                        }
                        if($(el).hasClass('noData')){
                            $(el).removeClass('noData');
                            getBlockData($(el).children('span').html(), $(el).parent().find('.blockData'));
                        }
                    });
                });
                $(el).parent().find('.blockData').animate({
                    marginTop: '-=26px'
                }, 1000);
            });
        });

        $('#blockScroll').animate({
            width: '+=425px'
        }, 1000);
    }
}

function shrinkBlock(el) {

    $(el).removeClass('clicked');

    let left = $(el).position().left;
    let top = $(el).position().top;

    $(el).parent().find('.blockData').find('span').fadeOut(500);
    $(el).parent().find('.triangle_down').animate({
        borderTopColor: '#FFF'
    }, 250);

    $(el).animate({
        backgroundColor: '#FFF',
        color: '#00648D'
    }, 250, function(){
        $(el).parent().find('.triangle_down_big').animate({
            marginTop: '-=26px'
        }, 250);

        $(el).parent().find('.blockData').animate({
            marginTop: '+=26px'
        }, 250, function(){
            $(el).parent().find('.blockData').animate({
                height: '0px',
                marginTop: '-=28px'
            },250, function(){

                $(el).parent().find('.blockData').css('margin-top', '-20px');
                $(el).parent().find('.blockData').hide();
                $(el).parent().find('.triangle_down_big').hide();
                $(el).parent().find('.triangle_down').hide();
                $(el).parent().find('.hider').hide();

                if(left > $(document).width()/2)
                {
                    $(el).animate({
                        width: '-=425px'
                    }, 250, function(){
                        $(el).addClass('notClicked');
                    });

                    $('#blockScroll').animate({
                        width: '-=425px'
                    }, 250);

                    $('#blockHolder').animate({
                        scrollLeft: '-=425px'
                    }, 250, function(){

                        $('.arrow_left_box').show();
                        $('.arrow_right_box').show();
                        if($('#blockHolder').scrollLeft() + $('#blockHolder').width()+27 >= $('#blockScroll').width()) {
                            $('.arrow_right_box').hide();
                        }

                        if($('#blockHolder').scrollLeft() <= 0)
                        {
                            $('.arrow_left_box').hide();
                        }
                    });
                }
                else
                {
                    $(el).animate({
                        width: '-=425px'
                    }, 250, function(){
                        $(el).addClass('notClicked');
                    });

                    $('#blockScroll').animate({
                        width: '-=425px'
                    }, 250, function(){

                        $('.arrow_left_box').show();
                        $('.arrow_right_box').show();

                        if($('#blockHolder').scrollLeft() + $('#blockHolder').width()+27 >= $('#blockScroll').width()) {
                            $('.arrow_right_box').hide();
                        }
                        if($('#blockHolder').scrollLeft() <= 0)
                        {
                            $('.arrow_left_box').hide();
                        }
                    });
                }
            });
        });
    });
}

function pad(value) { //Used for time so that, 12:04 isn't show as 12:4.
    if(value < 10) {
        return '0' + value;
    } else {
        return value;
    }
}
