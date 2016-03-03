var prevFiftyBlocks = [];
var timeData = [];
var transData = [];
var storeBlock;
var blockTime;
var chainHeight;
var blockNum;
var sum = 0;
var avg = "N/A";
var startBlock;
var stdDev;
var minMax;
var timeDiff;

$(document).ready(function(){

	var startFuncTime = Date.now() / 1000;

	$('#fade').show();
	$('#loader').show();

	var block;

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
		},
		error: function(e){
			console.log(e)
		},
		async: false
	});

	$('#currBlock').html('#'+numberWithCommas(blockNum));
	
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
			 console.log(e)
		},
		async: false
	});

	blockTime = block.nonHashData.localLedgerCommitTimestamp.seconds;
	
	var curr = Date.now()/1000;

	$('#timeSince').html(parseInt((curr-blockTime))+'s ago');

	prevFiftyBlocks.push(block.nonHashData.localLedgerCommitTimestamp.seconds);

	if(blockNum > 0)
	{

		transData.push(block.transactions.length)
		$('#transLast').html(block.transactions.length)

		for(var i = 1; i < 126; i++)
		{
			if(blockNum - i > 0)
			{
				var blk;

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
						console.log(e)
					},
					async: false
				});

				prevFiftyBlocks.push(blk.nonHashData.localLedgerCommitTimestamp.seconds)

				transData.push(blk.transactions.length)
			}
			else
			{
				break;
			}
		}
	}
	else
	{
		transData.push(0)
		$('#transLast').html(0)
	}

	for(var i = 0; i < prevFiftyBlocks.length-2; i++)
	{

		timeDiff = prevFiftyBlocks[i] - prevFiftyBlocks[i+1]

		if(timeDiff > 5000){timeDiff=5000;}

		sum += timeDiff

		timeData.push(timeDiff)
	}

	var endFuncTime = Date.now() / 1000;

	avg = sum/(prevFiftyBlocks.length+(blockNum - startBlock));

	minMax = calcStdDeviation(prevFiftyBlocks, avg);
	
	if(blockNum == 0)
	{
		$('#avgTime').html('NA');
	}
	else
	{
		$('#avgTime').html((Math.round((avg) * 10) / 10)+'s');	
	}

	if(prevFiftyBlocks.length < 126)
	{
		$('.timeCont').html('<g><span class="startBar"></span><span class="startMark" >Block 0</span></g>')

		$('.transCont').html('<g><span class="startBar"></span><span class="startMark" >Block 0</span></g>')
	}

	makeCharts();

	window.setInterval(updatePage, 10000);
	window.setInterval(updateTime, 1000);

	$('#fade').hide();
	$('#loader').hide();
})

function updatePage()
{
	var startFuncTime = Date.now() / 1000;
	var block;

	$.ajax({

		type: 'GET',
		dataType : 'json',
		contentType: 'application/json',
		crossDomain:true,
		url: '/blockchain/blocks',
		success: function(d) {
			blockNum = d.height - 1;
		},
		error: function(e){
			console.log(e)
		},
		async: false
	});

	if(storeBlock < blockNum)
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
				console.log(e)
			},
			async: false
		});

		blockTime = block.nonHashData.localLedgerCommitTimestamp.seconds;
		storeBlock = blockNum;

		$('#timeSince').html('0s ago');

		prevFiftyBlocks.unshift(block.nonHashData.localLedgerCommitTimestamp.seconds)

		timeData.unshift(prevFiftyBlocks[0] - prevFiftyBlocks[1])
		transData.unshift(block.transactions.length)

		$('.cont').html('');

		timeDiff = prevFiftyBlocks[0] - prevFiftyBlocks[1];

		if(timeDiff>5000){timeDiff=5000;}
		
		sum += timeDiff;
		
		avg = sum/(prevFiftyBlocks.length+(blockNum - startBlock));
		minMax = calcStdDeviation(prevFiftyBlocks, avg);

		$('#avgTime').html((Math.round((avg) * 10) / 10)+'s');
		$('#currBlock').html('#'+numberWithCommas(blockNum));

		$('#transLast').html(block.transactions.length)
		
		makeCharts();
	}
}

function updateTime()
{
	var currStarted = $('#timeSince').html().substring(0, $('#timeSince').html().indexOf('s'));

	$('#timeSince').html((parseInt(currStarted) + 1) + 's ago');

	avg = sum/(prevFiftyBlocks.length+(blockNum - startBlock));
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function calcStdDeviation(data, avg)
{
	var variance = 0;
	var diff;
	var res = [];

	for(var i = 0; i < prevFiftyBlocks.length-1; i++)
	{
		diff = prevFiftyBlocks[i] - prevFiftyBlocks[i+1]

		if(diff>5000){diff=5000;}		

		variance += Math.pow((diff - avg),2)
	}
	
	variance /= (prevFiftyBlocks.length+(blockNum - startBlock))

	stdDev = Math.sqrt(variance);

	max = avg + (0.5 * stdDev);
	min = avg - (0.17 * stdDev);

	res.push(Math.floor(min))
	res.push(Math.floor(max))

	return res
}