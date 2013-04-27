<?php
include("crawler.class.php");

$diary = array(
	'elmundoes' => array(
		'base_url' => 'http://www.elmundo.es',
		'categories' => array(
			'portada' => 'http://www.elmundo.es/elmundo/ultimas24horas.html',
		),
		// Patrones de busqueda de elementos
		'patterns' => array(
			// Lo que se extrae de la lista de noticias
			'article' => '#ultimasnoticias li',
			'title' => 'h1',
			'link' => 'h1 a',
			'resume' => '',

			// Lo que se extrae de la noticia en si
			'images' => '.foto img',
			'content' => '#tamano',
			'author' => '.firma em',
			'date' => 'strong.fecha',
			'tags' => '',
                        'category_alias' => '#cabecera h1 a.seccion, .antetitulo .seccion a',
		),
		'encoding' => false,
	),
);
$crawler = new Crawler();
$crawler->setDiary($diary);
$crawler->run();