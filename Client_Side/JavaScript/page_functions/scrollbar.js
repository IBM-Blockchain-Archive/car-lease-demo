var currTop;
$(document).ready(function(){
	$('.scrlBr').draggable({containment: 'parent', axis: "y"});
	$('.scrlBr').mousedown(function(){currTop = $(this).position().top; var sel = $(this); $(document).on('mousemove', function(){dragged($(sel).position().top, $(sel))});})
	$(document).mouseup(function(){$(document).off('mousemove');})
	$('.scrlBr').off('mousemove');
	$('.content').mousewheel(function(e){
		e.preventDefault();
		var scroll = e.deltaY*5;
		var mult = Math.ceil($(this).parent().siblings('.scrlHldr').children('.scrlBr').children('.mult').val());
		var childPos = parseInt($(this).css('margin-top').replace('px',''));
		
		var barPosAcc = parseInt($(this).parent().siblings('.scrlHldr').children('.scrlBr').css('top').replace('px',''))
		var barPos = 5*Math.round(barPosAcc/5);
		$(this).parent().siblings('.scrlHldr').children('.scrlBr').css('top',barPos+"px");
		var barHeight = $(this).parent().siblings('.scrlHldr').children('.scrlBr').height();
		var hldrHeight = $(this).parent().siblings('.scrlHldr').height();
		var scrolled = false;
		if(barPos > 0 && barPos + barHeight < hldrHeight - 5)
		{
			scrolled = true;
			$(this).css('margin-top', (childPos + (scroll*mult)) + "px");
			$(this).parent().siblings('.scrlHldr').children('.scrlBr').css('top', (barPos-scroll)+"px")
		}
		if(!scrolled && scroll > 0)
		{
			if(barPos <= 0)
			{
				
			}
			else
			{
				scrolled = true;
				$(this).css('margin-top', (childPos + (scroll*mult)) + "px");
				$(this).parent().siblings('.scrlHldr').children('.scrlBr').css('top', (barPos-scroll)+"px")
			}
		}
		if(!scrolled && scroll < 0)
		{
			if(barPos + barHeight > hldrHeight - 5)
			{
				
			}
			else
			{
				scrolled = true;
				$(this).css('margin-top', (childPos + ((scroll)*mult)) + "px");
				$(this).parent().siblings('.scrlHldr').children('.scrlBr').css('top', (barPos-scroll)+"px")
			}
		}
	})
})
function changeBarSize()
{
	$('.scrlBr').each(function(){
		var height = 305;
		var overflow = $(this).parent().siblings('.contentHldr').children('.content').height();
		var offset = overflow-height;
		if(offset > 0)
		{
			if(offset > height - 25)
			{
				var mult = offset/(height - 25);
				mult = Math.ceil(mult);
				var spaceBtm = ((height-25)*mult)- offset
				$(this).children('.mult').val(offset/(height - 25));
				
				$(this).height(25+(spaceBtm/mult)) //set the height of the bar to add on the whitespace left over due to rounding for each pixel it moves
			}
			else
			{
				offset = offset - 10;
				$(this).height(height-offset)
			}
		}
		else
		{
			$(this).height(305);
		}
	})
}

function dragged(moveTop, bar)
{
	var mult = Math.ceil($(bar).children('.mult').val());
	var diff = moveTop - currTop;
	var childPos = parseInt($(bar).parent().siblings('.contentHldr').children('.content').css('margin-top').replace('px',''));
	$(bar).parent().siblings('.contentHldr').children('.content').css('margin-top', (childPos - (diff*mult)) + "px");
	currTop = moveTop
}
