<?php include_once('assets/contact/assets/config.php'); ?>
<?php include_once('assets/contact/assets/language.php'); ?>
<!DOCTYPE html> 
<html> 
<head>
	<meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
	<title>Mobilize</title> 
    <link rel="apple-touch-icon" href="assets/images/apple-touch-icon.png"/>
    
    <meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black">

    <!-- scripts -->
	<script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
    <script>
            $(document).bind("mobileinit", function () {
                $.mobile.ajaxEnabled = false;
            });      
    </script>
	<script src="http://code.jquery.com/mobile/1.0.1/jquery.mobile-1.0.1.min.js"></script>
    <script src="assets/contact/js/contact.js"></script>
    
    <!-- css -->
   	<link rel="stylesheet" href="assets/css/style1.css">

</head> 
<body>

<div data-role="page">
    
    <!-- header -->
	<div data-role="header" class="page-header" data-add-back-btn="true">
    	<a href="index.html" data-icon="arrow-l" data-iconpos="notext" data-direction="reverse" data-rel="back" rel="external">Back</a>
    		<div class="logo"></div>
    	<a href="index.html" data-icon="home" data-iconpos="notext" data-direction="reverse"  rel="external" class="ui-btn-right">Home</a>
	</div>
    <!--/header -->
    
	<!-- banner & title -->
	<div class="bannerContainer">
		<img src="assets/images/headers/1.jpg" class="banner">	
    </div>
  	<h2 class="pageTitle"><span>Contact Us</span></h2>
	<div class="shadow1box"><img src="assets/images/shadow1.png" class="shadow1" alt="shadow"></div>
	<!-- /banner & title -->
    
    <!-- main content -->
    <div data-role="content">

  
  
    
    <p>Fill out the form to contact us today!</p></p>
    
    
		<div id="errors" class="hide ui-corner-all"></div>
		<p align="right">* <?php echo $language->field_required?></p>
		<form name="form1" id="form1">
			<div data-role="fieldcontain">
				<label for="name"><?php echo $language->name?> *</label>
				<input type="text" name="name" id="name" autofocus />
			</div>
			<div data-role="fieldcontain">
				<label for="lastname"><?php echo $language->lastname?> *</label>
				<input type="text" name="lastname" id="lastname" />
			</div>
			<div data-role="fieldcontain">
				<label for="email"><?php echo $language->email?> *</label>
				<input type="text" name="email" id="email" />
			</div>
            <div data-role="fieldcontain">
				<label for="phone"><?php echo $language->phone?> *</label>
				<input type="text" name="phone" id="phone" />
			</div>
			<div data-role="fieldcontain">
				<label for="subject"><?php echo $language->subject?> *</label>
				<input type="text" name="subject" id="subject" />
			</div>
			<div data-role="fieldcontain">
				<label for="message"><?php echo $language->message?> *</label>
				<textarea name="message" id="message" rows="8" cols="25"></textarea>
			</div>
            <?php if($mailing_list) : ?>
			<div data-role="fieldcontain">
				<fieldset data-role="controlgroup" data-type="horizontal">
					<legend><?php echo $language->join_mailing_list?></legend>
					<input type="radio" name="mailing_list" id="mailing_list-1" value="yes" checked="checked" />
					<label for="mailing_list-1"><?php echo $language->yes_please?></label>
					<input type="radio" name="mailing_list" id="mailing_list-0" value="no" />
					<label for="mailing_list-0"><?php echo $language->no_thanks?></label>
				</fieldset>
			</div>
            <?php endif ?>
            <?php if($how_you_found_us) : ?>
			<div data-role="fieldcontain">
				<label for="how_you_found_us"><?php echo $language->how_did_you_find_us?></label>
				<select id="how_you_found_us" name="how_you_found_us">
					<?php	if(is_array($how_you_found_us_options)) : 
								foreach($how_you_found_us_options as $value) :
									echo '<option value="'.$value.'">'.$value.'</option>';
								endforeach;
							endif
					?>
				</select>
			</div>
            <?php endif ?>
			<div data-role="fieldcontain">
				<label for="captcha"><?php echo $language->are_you_human?> *</label>
				<span id="are_you_human"></span><input type="text" name="captcha" id="captcha" />
			</div>
			<div data-role="fieldcontain">
				<fieldset data-role="controlgroup">
					<label for="copy"><?php echo $language->send_yourself?></label>
					<input name="copy" type="checkbox" id="copy" value="y" />
				</fieldset>
			</div>
			<fieldset class="ui-grid-a">
				<div class="ui-block-a">
					<button type="reset"><?php echo $language->cancel?></button>
				</div>
				<div class="ui-block-b">
					<button type="submit" id="sbm"><?php echo $language->submit?></button>
				</div>
			</fieldset>
		</form>
	</div>
    
    <!-- footer -->
	<div data-role="footer">
		<div data-role="navbar" class="custom-icons" data-grid="c">
			<ul>
				<li><a href="http://bit.ly/yx2mXZ" id="map" data-icon="custom" data-theme="b">Directions</a></li>
				<li><a href="tel:18005551234" id="phone" data-icon="custom" data-theme="b">Call Us</a></li>
				<li><a href="portfolio.html" id="camera" data-icon="custom" data-theme="b" data-ajax="false">Portfolio</a></li>
				<li><a href="twitter.html" id="twitter2" data-icon="custom" data-theme="b" data-ajax="false">Tweets</a></li>
			</ul>
		</div>
       
	</div>
	<!-- /footer -->
    
</div>





<!-- after submit -->
<div data-role="page" id="done">
	
    <!-- header -->
	<div data-role="header" class="page-header" data-add-back-btn="true">
    	<a  data-icon="arrow-l" data-iconpos="notext" data-direction="reverse" data-rel="back" rel="external" href="#">Back</a>
    		<div class="logo"></div>
    	<a href="index.html" data-icon="home" data-iconpos="notext" data-direction="reverse"  rel="external" class="ui-btn-right">Home</a>
	</div>
    <!--/header -->
	
    
    <!-- title -->
  	<h2 class="pageTitle"><span>Success!</span></h2>
    <div class="shadow1box"><img src="assets/images/shadow1.png" class="shadow1" alt="shadow"></div>
	<!-- /title -->
    
    <div data-role="content">
		
        <h4>Your email has been sent successfully!</h4>
        <p>We will be in touch soon.</p>
        
	</div>
    
    <!-- footer -->
	<div data-role="footer">
		<div data-role="navbar" class="custom-icons" data-grid="c">
			<ul>
				<li><a href="http://bit.ly/yx2mXZ" id="map" data-icon="custom" data-theme="b">Directions</a></li>
				<li><a href="tel:18005551234" id="phone" data-icon="custom" data-theme="b">Call Us</a></li>
				<li><a href="portfolio.html" id="camera" data-icon="custom" data-theme="b" data-ajax="false">Portfolio</a></li>
				<li><a href="twitter.html" id="twitter2" data-icon="custom" data-theme="b" data-ajax="false">Tweets</a></li>
			</ul>
		</div>
       
	</div>
	<!-- /footer -->
    
    
</div>
<!-- /after submit -->


 

</body>
</html>