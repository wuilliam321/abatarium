<?php
session_start();

// JSON integration for PHP 4
if(!function_exists(json_encode))	{
	include_once('json.php');
	
	function json_encode($data) {
		$json = new Services_JSON();
		return( $json->encode($data) );
	}
 
	function json_decode($data) {
		$json = new Services_JSON();
		return( $json->decode($data) );
	}
}

if(isset($_GET['do']) && $_GET['do'] == 'generate')	{
	$f = rand(2,10);
	$s = rand(2,10);
	if($_SESSION['mobile_form']['captcha'] = $f+$s)	{
		$data->response = true;
		$data->answer = $f.'+'.$s.' = ';
	}
	else	{
		$data->response = false;
	}
	echo json_encode($data);
}
elseif(isset($_GET['do']) && $_GET['do'] == 'validate')	{
	if($_SESSION['mobile_form']['captcha'] == $_GET['captcha'])
		echo 'true';
	else
		echo 'false';
}
?>