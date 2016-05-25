var selRw;
$(document).ready(function(){
	loadLogo(pgNm);
	
	$("#cclPg").click(function(){
		window.location.href = "index.html";
	})

	$(document).on('click', '.userHldr', function(){	
		$('.foundCars').remove();
		$('#loaderMessages').html('0 assets')
		$('#loader').show();
		$('#fade').show();		
		loadUpdateAssets()
	});

})

function showEditTbl(el)
{
	$('#chooseOptTbl').fadeIn(1000);
	$('#fade').fadeIn(1000);
	$('#v5cID').val($(el).parent().parent().find('.carID').html());
	if($(el).siblings('.carVin').html() != '&lt;<i>VIN</i>&gt;')
	{
		$('#vin').prop('readonly', true);
		$('#vin').css('cursor', 'not-allowed');
	}
	else
	{
		$('#vin').prop('readonly', false);
		$('#vin').css('cursor', 'text');
	}
	var vin = $(el).siblings('.carVin').html()
	if(vin == '&lt;<i>VIN</i>&gt;')
	{
		vin = 0;
	}
	var make = $(el).siblings('.carMake').html()
	if(make == '&lt;<i>make</i>&gt;')
	{
		make = 'undefined'
	}
	var model = $(el).siblings('.carModel').html()
	if(model == '&lt;<i>model</i>&gt;')
	{
		model = 'undefined'
	}
	var colour = $(el).siblings('.carColour').html()
	if(colour == '&lt;<i>colour</i>&gt;')
	{
		colour = 'undefined'
	}
	var reg = $(el).siblings('.carReg').html()
	if(reg == '&lt;<i>registration</i>&gt;')
	{
		reg = 'undefined'
	}
	$('#vin').val(vin);
	$('#make').val(make);
	$('#model').val(model);
	$('#colour').val(colour);
	$('#reg').val(reg);
	
	$('#hidVin').val(vin);
	$('#hidMake').val(make);
	$('#hidModel').val(model);
	$('#hidColour').val(colour);
	$('#hidReg').val(reg.toUpperCase());
}

function closeEditTbl()
{
	$('#chooseOptTbl').hide();
	$('#errorRw').hide();
	$('#fade').hide();
}

function validate(el)
{
	
	/*
	Validation on if details have been filled in for updating a car. This is not validation on what the person is allowed to update,
	that is done within the contract on the blockchain.
	*/
	
	$('#errorRw').html('<ul></ul>');
	var failed = false;
	if(isNaN(parseInt($('#vin').val().trim())))
	{
		$('#errorRw').find('ul').append('<li>VIN must be a number</li>')
		failed = true;
	}
	if($('#vin').val().trim().length != 15 && $('#vin').val().trim() != 0)
	{
		
		$('#errorRw').find('ul').append('<li>VIN must be 15 characters (Currently ' + $('#vin').val().trim().length + ' characters)</li>')
		failed = true;
	}
	if($('#vin').val().trim() == 0 && $('#hidVin').val().trim() != 0)
	{
		$('#errorRw').find('ul').append('<li>VIN cannot be reset to 0</li>')
		failed = true;
	}
	if($('#make').val().trim() == '')
	{
		$('#errorRw').find('ul').append('<li>Make cannot be blank</li>')
		failed = true;
	}
	if($('#make').val().trim().toLowerCase() == 'undefined' && $('#hidMake').val().trim().toLowerCase() != 'undefined')
	{
		$('#errorRw').find('ul').append('<li>Make cannot be reset to undefined</li>')
		failed = true;
	}
	if($('#model').val().trim() == '')
	{
		$('#errorRw').find('ul').append('<li>Model cannot be blank</li>')
		failed = true;
	}
	if($('#model').val().trim().toLowerCase() == 'undefined' && $('#hidModel').val().trim().toLowerCase() != 'undefined')
	{
		$('#errorRw').find('ul').append('<li>Model cannot be reset to undefined</li>')
		failed = true;
	}
	if($('#colour').val().trim() == '')
	{
		$('#errorRw').find('ul').append('<li>Colour cannot be blank</li>')
		failed = true;
	}
	if($('#colour').val().trim().toLowerCase() == 'undefined' && $('#hidColour').val().trim().toLowerCase() != 'undefined')
	{
		$('#errorRw').find('ul').append('<li>Colour cannot be reset to undefined</li>')
		failed = true;
	}
	if($('#reg').val().trim() == '')
	{
		$('#errorRw').find('ul').append('<li>Registration cannot be blank</li>')
		failed = true;
	}
	if($('#reg').val().trim().toLowerCase() == 'undefined' && $('#hidReg').val().trim().toLowerCase() != 'undefined')
	{
		$('#errorRw').find('ul').append('<li>Registration cannot be reset to undefined</li>')
		failed = true;
	}
	if(!failed)
	{
		$('#errorRw').hide();
		updateAsset($('#vin').val().trim(), $('#make').val().trim(), $('#model').val().trim(), $('#colour').val().trim(), $('#reg').val().trim().toUpperCase(), $('#v5cID').val(), el)
	}
	else
	{
		$('#errorRw').show();
	}
}
