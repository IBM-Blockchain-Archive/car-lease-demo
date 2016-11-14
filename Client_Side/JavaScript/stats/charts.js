function makeCharts(){

	var scaleTime = d3.scale.linear()
		.domain([0, minMax[1]])
		.range([1, 75]);

	var scaleTrans = d3.scale.linear()
		.domain([0, d3.max(transData)])
		.range([0, 75]);

	var a = d3.select(".timeCont") //Block Time graph
	  .selectAll("span")
		.data(timeData)
	  .enter().insert("g",":first-child");

	a.append("span")
		.classed("bar-behind", true)
		.style("height", "100%")

	a.append("span")
		.classed("bar", true)
		.style("height", function(d) {if(d <= minMax[0]){return scaleTime(minMax[0]) + "px"}else if(d>=minMax[1]){return scaleTime(minMax[1]) + "px"}else { return scaleTime(d) + "px" }})
		.append('span')
			.html(function(d){if(d <= minMax[0]){return "< " + numberWithCommas(minMax[0]) + "s"}else if(d>=minMax[1]){return "> " + numberWithCommas(minMax[1]) + "s"}else{return numberWithCommas(d) + "s"}})
			.classed("hover-span", true)
			.append('div')

	var b = d3.select(".transCont") //Transactions per block graph
	  .selectAll("span")
		.data(transData)
	  .enter().insert("g",":first-child");

	b.append("span")
		.classed("bar-behind", true)
		.style("height", "100%")

	b.append("span")
		.classed("bar", true)
		.style("height", function(d) { return scaleTrans(d) + "px"; })
		.append('span')
			.html(function(d){return d})
			.classed("hover-span", true)
			.append('div')
}

$(document).ready(function(){

	$(document).on('mouseenter', 'span.bar', function() { //Adds hoverspan
		$('.hover-span').hide();
		$(this).children('span').show();

		var top = $(this).position().top;
		var left = $(this).position().left;
		var height = $(this).height();
		var width = ($(this).children('span').width() + 20)/2;

		$(this).children('span').css('top', top + height + 15);
		$(this).children('span').css('left', left-width);
		$(this).children('span').children('div').css('margin-left', width-18);
	})

	$(document).on('mouseenter', 'span.bar-behind', function() {

		$('.hover-span').hide();

		if($(this).siblings('.bar').children('span').html()[0] != '0')
		{
			$(this).siblings('.bar').children('span').show();

			var top = $(this).siblings('.bar').position().top;
			var left = $(this).siblings('.bar').position().left;
			var height = $(this).siblings('.bar').height();
			var width = ($(this).siblings('.bar').children('span').width() + 20)/2;

			$(this).siblings('.bar').children('span').css('top', top + height + 15);
			$(this).siblings('.bar').children('span').css('left', left-width);
			$(this).siblings('.bar').children('span').children('div').css('margin-left', width-18);
		}
	})

	$(document).on('mouseout', 'span.bar', function() {
		$(this).children('span').hide();
	})

	$(document).on('mouseout', 'span.bar-behind', function() {
		$(this).siblings('.bar').children('span').hide();
	})
})

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

