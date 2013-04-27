<?php
include("crawler.class.php");

$diary = array(
	'lavanguardia' => array(
		'base_url' => 'http://www.lavanguardia.com',
		'categories' => array(
			'portada' => 'http://www.lavanguardia.com/alminuto/index.html',
		),
		// Patrones de busqueda de elementos
		'patterns' => array(
			// Lo que se extrae de la lista de noticias
			'article' => '.alminuto',
			'title' => 'h2',
			'link' => 'h2 a',
			'resume' => '',

			// Lo que se extrae de la noticia en si
			'images' => '.foto img, .contenido img',
			'content' => '.text',
			'author' => '.top_new p',
			'date' => '.p2',
			'tags' => '',
                        'category_alias' => '.middle h2, .listPages li.select, .listPages2 li.select',
		),
		'encoding' => "lavanguardia_encode",
	),
);
$crawler = new Crawler();
$crawler->setDiary($diary);
$crawler->run();