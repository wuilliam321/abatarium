/** 
 * Name:    Ajax Mobile Form Contact
 * Version: 2.0 (2011-07-18)
 * Author:  Schizzoweb Web Agency
 * Website: www.schizzoweb.com
 *
 * Copyright 2011, C.R.C. di Daniele De Matteo
 *
 */

$(document).ready(function()	{
	generate_catpcha();
	
	$('#form1').submit(function()	{
		var loader = $('<img />', {'src':'assets/images/ajax-loader.gif', 'id':'loader'});
		loader.appendTo('.ui-block-b');
		$('#sbm').attr('disabled','disabled');
		$.ajax({
			url:		'assets/contact/assets/send.php',
			data:		$("#form1").serialize(),
			type:		'post',
			dataType:	'json',
			success:	function(data)	{
				$('#sbm').removeAttr('disabled');
				$('#loader').fadeOut(function()	{
					$(this).remove();
				});
				if(data.response)	{
					generate_catpcha();
					$.mobile.changePage('#done', 'flip');
					$(':textare, :text', '#form1').val('');
					$(':input','#form1')
						.removeAttr('checked')
						.removeAttr('selected');
				}
				else if(data.response == false && data.error['status'])	{
					$('#errors').html(data.error['msg']).fadeIn('slow', function()	{
						$.mobile.silentScroll(50);
					});
				}
			}
		});
		return false;
	});
	
});

function generate_catpcha()	{
	$.ajax({
		url:		'assets/contact/assets/captcha.php',
		data:		'do=generate',
		dataType:	'json',
		success:	function(data)	{
			if(data.response)	{
				$('#are_you_human').html(data.answer);
			}
			else
				alert('Captcha error!');
		}
	});
}
