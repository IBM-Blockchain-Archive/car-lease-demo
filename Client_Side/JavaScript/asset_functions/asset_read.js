function loadAssets()
{
	/*
	Retrieves all V5Cs from the blockchain and formats the data to display on a web page. Need the address of the account 
	executing this request, at the moment this is hard coded in the html for each page. 
	*/
	var found = 0;
	var posLast = 0;
	var objects = [];
	var error = false;
	var xhr = new XMLHttpRequest()
	xhr.open("GET", "/blockchain/assets/vehicles", true)
	xhr.overrideMimeType("text/plain");
	xhr.onprogress = function () {
		var data = xhr.responseText;
		var array = data.split("&&");
		
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].trim() != "")
			{
				var obj = JSON.parse(array[i]);
				var found = false;
				
				for(var j = 0; j < objects.length; j++)
				{
					if(objects[j].v5cID == obj.v5cID)
					{
						found = true;
						break;
					}
				}
				if(!found)
				{
					if(pgNm == "Regulator")
					{
						if(obj.status == 0)
						{
							obj.VIN = '&lt;<i>VIN</i>&gt;';
							obj.make = '&lt;<i>make</i>&gt;';
							obj.model = '&lt;<i>model</i>&gt;';
							obj.colour = '&lt;<i>colour</i>&gt;';
							obj.reg = '&lt;<i>registration</i>&gt;';
							objects.push(obj);
						}
					}
					else
					{
						if(typeof obj.message == 'undefined' && obj.VIN > 0 && obj.make.toLowerCase() != 'undefined' && obj.make.trim() != '' && obj.model.toLowerCase() != 'undefined' && obj.model.trim() != '' && obj.reg.toLowerCase() != 'undefined' && obj.reg.trim() != '' && obj.colour.toLowerCase() != 'undefined' && obj.colour.trim() != '' && !obj.scrapped)
						{
							objects.push(obj)
						}
					}
					if(obj.hasOwnProperty("error"))
					{
						error = true
						$("#vhclsTbl").append("Unable to load assets.");
					}
				}
			}
		}
		var plu = 'assets';
		if(objects.length == 1)
		{
			plu = 'asset';
		}
		$('.numFound').html(objects.length + ' ' + plu);
	}
	xhr.onreadystatechange = function (){
		if(xhr.readyState === 4)
		{
			if(!error)
			{
				$("#vhclsTbl").empty();
				for(var i = 0; i < objects.length; i++)
				{
					var data = objects[i];
					$("#vhclsTbl").append("<tr class='vehRw'><td class='vin'>"+data.VIN+"</td><td class='vehDets' ><span class='carInfo'>" + data.make + "</span><span class='carInfo'>" + data.model + ", </span><span class='carInfo'>" + data.colour + ", </span><span class='carInfo'>" + data.reg + "</span></td><td class='chkHldr'><span class='chkSpc' ></span><span class='chkBx' ></span><input class='isChk' type='hidden' value='false' /><input class='v5cID' type='hidden' value='"+data.v5cID+"' /></td></tr>");
				}
				changeBarSize();
			}
		}
	}
	xhr.send()
}

function loadUpdateAssets()
{
	/*
	Retrieves all V5Cs from the blockchain and formats the data to display on a web page. Need the address of the account 
	executing this request, at the moment this is hard coded in the html for each page. 
	*/
	var found = 0;
	var posLast = 0;
	var objects = [];
	var xhr = new XMLHttpRequest()
	xhr.open("GET", "/blockchain/assets/vehicles", true)
	xhr.overrideMimeType("text/plain");
	xhr.onprogress = function () {
		var data = xhr.responseText;
		var array = data.split("&&");
		
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].trim() != "")
			{
				var obj = JSON.parse(array[i]);
				var found = false;
				for(var j = 0; j < objects.length; j++)
				{
					if(objects[j].v5cID == obj.v5cID)
					{
						found = true;
						break;
					}
				}
				
				console.log("UPDATE ASSET READ:", obj)
				
				if(!found && typeof obj.message == 'undefined')
				{
					objects.push(obj)		
				}
			}
		}
		var plu = 'assets';
		if(objects.length == 1)
		{
			plu = 'asset';
		}
		$('#loaderMessages').html(objects.length + ' ' + plu);
	}
	xhr.onreadystatechange = function (){
		if(xhr.readyState === 4)
		{
			var d = objects;
			$('#loader').hide();
			$('#fade').hide();
			for(var i = 0; i < d.length; i++)
			{
				var data = d[i];
				if(data.VIN == 0) data.VIN = '&lt;<i>VIN</i>&gt;';
				if(data.make.toLowerCase() == 'undefined' || data.make.trim() == '') data.make = '&lt;<i>make</i>&gt;';
				if(data.model.toLowerCase() == 'undefined' || data.model.trim() == '') data.model = '&lt;<i>model</i>&gt;';
				if(data.reg.toLowerCase() == 'undefined' || data.reg.trim() == '') data.reg = '&lt;<i>registration</i>&gt;';
				if(data.colour.toLowerCase() == 'undefined' || data.colour.trim() == '') data.colour = '&lt;<i>colour</i>&gt;';
				$('<tr class="foundCars" ><td class="smlBrk"></td><td class="editRw" ><span class="carID">'+data.v5cID+'</span></td><td class="editRw" colspan="2" >[<span class="carVin">'+data.VIN+'</span>] <span class="carMake">'+data.make+'</span> <span class="carModel">'+data.model+'</span>, <span class="carColour">'+data.colour+'</span>, <span class="carReg">'+data.reg+'</span><img src="Icons/Manufacturer/edit.svg" onclick="showEditTbl(this)" class="rtBtn" width="20" height="20" /></td><td class="smlBrk" ></td></tr>').insertAfter('#insAft');
			}
		}
	}
	xhr.send()	
}
