$(document).ready(function(){

	$('#addToVhcls').click(function(){
	
		setCookie()
		$("#vhclsTbl").html('<tr><td style="text-align:center;"><img src="Images/'+pgNm+'/loading.gif" height="50" width="50" alt="loading" text="please wait..." /><br /><i>Found: <span class="numFound">0 assets</span></i></td></tr>');
		$('#chooseOptTbl').fadeIn(1000);
		$('#fade').fadeIn(1000);
		loadAssets();
	})
	$('#cclOpt').click(function(){
		$('#chooseOptTbl').hide();
		$('#fade').hide();
	})
	$('#clsOpt').click(function(){
		$('#chooseOptTbl').hide();
		$('#fade').hide();
	})
	
	$("#doneOpt").on('click', function(){
		$('.vehRw').each(function(){
			if($(this).find('.isChk').val() == "true")
			{
				var exists = false;
				var rw = $(this);
				$('.selVehRw').each(function(){
					if($(this).find('.v5cID').val() == $(rw).find('.v5cID').val())
					{
						exists = true;
					}
				})
				if(!exists)
				{
					$(this).find('.isChk').val('false')
					$(this).find('.chkBx').css('background-image','url("")')
					var nwRw = $(this).html().replace('<span class="chkSpc"></span><span style="background-image: url(&quot;&quot;);" class="chkBx"></span><input class="isChk" value="false" type="hidden">', '<span onclick="removeRowFromSelectedVehicles(this)" style="float:right; margin-right:10px; cursor:pointer;"><img src="Icons/'+pgNm+'/minus.svg" width="15" /></span>')
					$("#selVhclsTbl").append('<tr class="selVehRw">' + nwRw + '</tr>');
				}
			}
		})
		$('#chooseOptTbl').hide();
		$('#fade').hide();
		changeBarSize();
	});
})

function removeRowFromSelectedVehicles(el)
{
	$(el).parent().parent().remove();
	$('#selVhclsTbl').parent().css('margin-top','0px');
	$('#selVhclsTbl').parent().parent().siblings('.scrlHldr').children('.scrlBr').css('top', "0px")
	changeBarSize();
}
