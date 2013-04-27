<?php
include("crawler.class.php");

$diary = array(
	'marca' => array(
		'base_url' => 'http://www.marca.com',
		'categories' => array(
			'portada' => 'http://www.marca.com/',
		),
		// Patrones de busqueda de elementos
		'patterns' => array(
			// Lo que se extrae de la lista de noticias
			'article' => '.apertura-2columnas, #estructura-2col .principal, #estructura-2col .secundaria',
			'title' => 'h2',
			'link' => 'h2 a',
			'resume' => 'p[!class]',

			// Lo que se extrae de la noticia en si
			'images' => '.bloque-foto img, .foto_noticia img',
			'content' => '.cuerpo_articulo',
			'author' => '.firma .nombre',
			'date' => '.firma .fecha',
			'tags' => 'h1',
                        'category_alias' => '#cont_cabecera h2 a[!class], #migas .nivel1 a, #migas .nivel2 a',
		),
		'encoding' => 'marca_encode',
	),
);
$crawler = new Crawler();
$crawler->setDiary($diary);
$crawler->run();