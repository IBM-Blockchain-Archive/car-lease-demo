var recipients = [];
$(document).ready(function(){

	$('#addToRec').click(function(){
		$("#recsTbl").html('<tr><td style="text-align:center;"><img src="Images/'+pgNm+'/loading.gif" height="50" width="50" alt="loading" text="please wait..." /></td></tr>');
		$('#chooseRecTbl').fadeIn(1000);
		$('#fade').fadeIn(1000);
		recipients = loadRecipients();
	})
	
	$('#cclRec').click(function(){
		$('#chooseRecTbl').hide();
		$('#fade').hide();
	})
	
	$('#clsRec').click(function(){
		$('#chooseRecTbl').hide();
		$('#fade').hide();
	})
	
	$("#doneRec").on('click', function(){
		$('.recRw').each(function(){
			if($(this).find('.isChk').val() == "true")
			{
				var i = parseInt($(this).find('.posArr').val());
				$("#recipientInfo").html("<div><span class='delName'>"+recipients[i].name+"</span> - Identity (<span class='accAddr'>"+recipients[i].identity+"</span>)</div><br />"+getAddress(recipients[i])+"<div>"+recipients[i].postcode+"</div><br /><input id='recAcc' type='hidden' value='" + recipients[i].identity + "'/>")
			}
		})
		$('#chooseRecTbl').hide();
		$('#fade').hide();
		changeBarSize();
	});
	
	$("#remFrmRec").on('click', function(){
		$("#recipientInfo").empty();
	});
})
