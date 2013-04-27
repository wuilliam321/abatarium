<?php
include("crawler.class.php");

$diary = array(
	'elpais' => array(
		'base_url' => 'http://elpais.com',
		'categories' => array(
			'portada' => 'http://elpais.com/tag/fecha/hoy'
		),
		// Patrones de busqueda de elementos
		'patterns' => array(
			// Lo que se extrae de la lista de noticias
			'article' => 'div.article',
			'title' => 'h1, h2, h4',
			'link' => 'h1 a, h2 a, h4 a',
			'resume' => 'p',

			// Lo que se extrae de la noticia en si
			'images' => '.foto img, .media img',
			'content' => 'div#cuerpo_noticia, .article-content',
			'author' => '.autor a, p.author',
			'date' => 'a.actualizado, p.date',
			'tags' => '.tags a',
                        'category_alias' => '.seccion h6, .firma .data, .antetitulo span',
		),
		'encoding' => false,
	),
);
$crawler = new Crawler();
$crawler->setDiary($diary);
$crawler->run();