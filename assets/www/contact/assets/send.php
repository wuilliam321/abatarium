<?php
session_start();

include_once('config.php');
include_once('language.php');

// Please don't edit this code below

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

// Fields validation
$error['status']	= 0;
$msg				= '<h3>'.$language->attention_please.'</h3><ul>';

$_POST['name']		= trim($_POST['name']);
$_POST['lastname']	= trim($_POST['lastname']);
$_POST['email']		= trim(strtolower($_POST['email']));
$_POST['subject']	= trim($_POST['subject']);
$_POST['message']	= trim($_POST['message']);

if(empty($_POST['name']))	{
	$error['status']	= 1;
	$msg				.= '<li>'.$language->name_required.'</li>';
}
if(empty($_POST['lastname']))	{
	$error['status']	= 1;
	$msg				.= '<li>'.$language->lastname_required.'</li>';
}
if(empty($_POST['email']))	{
	$error['status']	= 1;
	$msg				.= '<li>'.$language->email_required.'</li>';
}
elseif(!is_email($_POST['email']))	{
	$error['status']	= 1;
	$msg				.= '<li>'.$language->email_valid.'</li>';
}
if(empty($_POST['phone']))	{
	$error['status']	= 1;
	$msg				.= '<li>'.$language->phone_required.'</li>';
}
if(empty($_POST['subject']))	{
	$error['status']	= 1;
	$msg				.= '<li>'.$language->subject_required.'</li>';
}
if(empty($_POST['message']))	{
	$error['status']	= 1;
	$msg				.= '<li>'.$language->message_required.'</li>';
}
if(empty($_POST['captcha']))	{
	$error['status']	= 1;
	$msg				.= '<li>'.$language->areyouhuman_required.'</li>';
}
elseif($_POST['captcha'] != $_SESSION['mobile_form']['captcha'])	{
	$error['status']	= 1;
	$msg				.= '<li>'.$language->areyouhuman_valid.'</li>';
}

$msg .= '</ul>';
// End fields validation

if($error['status'] == 1)	{
	$error['msg'] = $msg;
	$data->response = false;
	$data->error = $error;
	die(json_encode($data));
}
elseif($error['status'] == 0)	{
	$fields_ignored = array('button', 'captcha', 'copy');
	$headers = NULL;
	if($type == 'html')	{
		$headers .=	'Content-type: text/html; charset='.$charset.PHP_EOL.
					'MIME-Version: 1.0'.PHP_EOL;
		$template = file_get_contents('template.html');
		
		$message		= '<table width="100%" border="0" cellspacing="0" cellpadding="5">';
		$row_structure	= '<tr width="30%"><td><strong>{field}:</strong></td><td>{value}</td></tr>';
		foreach($_POST as $field => $value)	{
			if(!in_array($field, $fields_ignored))	{
				$message .= str_replace(array('{field}','{value}'),array(str_replace('_',' ',$field),nl2br(strip_tags($value))),$row_structure);
			}
		}
		$message .= '</table>';
		$message = str_replace(array('{header}','{fields}'),array($email_header,$message),$template);
		$message = str_replace(array('{page}','{ip}','{date}','{time}','{user_agent}'), array($_SERVER['HTTP_REFERER'],$_SERVER['REMOTE_ADDR'],date('d F Y'),date('H:i:s'),$_SERVER['HTTP_USER_AGENT']), $message);
	}
	else	{
		$headers .=	'Content-type: text/plain; charset='.$charset.PHP_EOL.
					'MIME-Version: 1.0'.PHP_EOL;
		$message = $email_header.PHP_EOL.'------------------------------------------------------'.PHP_EOL.PHP_EOL;
		foreach($_POST as $field => $value)	{
			if(!in_array($field, $fields_ignored))	{
				$message .= str_replace('_',' ',$field).':'.PHP_EOL.strip_tags($value).PHP_EOL.PHP_EOL;
			}
		}
	}
	$headers .= 'From: "'.utf8_decode($_POST['name']).' '.utf8_decode($_POST['lastname']).'" <'.$_POST['email'].'>'.PHP_EOL;
	if(isset($_POST['copy']) && $_POST['copy'] == 'y')
		$headers .= 'Cc: "'.utf8_decode($_POST['name']).' '.utf8_decode($_POST['lastname']).'" <'.$_POST['email'].'>'.PHP_EOL;
	if(!empty($reply_to))
		$headers .= 'Reply-To: '.$your_name.'" <'.$reply_to.'>'.PHP_EOL;
	$headers .= 'X-Mailer: PHP-' . phpversion().PHP_EOL;
	
	if(mail($send_to, $_POST['subject'], $message, $headers))	{
		$data->response = true;
		echo json_encode($data);
		session_destroy();
	}
	else	{
		$data->response = false;
		echo json_encode($data);
	}
}
else	{
	$data->response = false;
	$data->error = $error;
	die(json_encode($data));
}

function is_email($email){
	return preg_match('/^[_a-zA-Z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/', $email);
}
?>