<?php
include("crawler.class.php");

$diary = array(
	'cincodias' => array(
		'base_url' => 'http://cincodias.com',
		'categories' => array(
			'portada' => 'http://cincodias.com/tag/fecha/hoy',
		),
		// Patrones de busqueda de elementos
		'patterns' => array(
			// Lo que se extrae de la lista de noticias
			'article' => 'div.article',
			'title' => 'h2',
			'link' => 'h2 a',
			'resume' => 'p',

			// Lo que se extrae de la noticia en si
			'images' => '.izquierda img',
			'content' => '.txt_noticia',
			'author' => '#contenido .autor',
			'date' => '.fecha',
			'tags' => '.tags_relacionados ul li',
                        'category_alias' => '#menu li.marcado span',
		),
		'encoding' => false,
	),
);
$crawler = new Crawler();
$crawler->setDiary($diary);
$crawler->run();