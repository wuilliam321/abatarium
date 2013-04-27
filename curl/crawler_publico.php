<?php
include("crawler.class.php");

$diary = array(
	'publico' => array(
		'base_url' => 'http://www.publico.es',
		'categories' => array(
			'portada' => 'http://www.publico.es/',
		),
		// Patrones de busqueda de elementos
		'patterns' => array(
			// Lo que se extrae de la lista de noticias
			'article' => 'div.contenedor div.articulo',
			'title' => 'h3',
			'link' => 'h3 a',
			'resume' => '.entradillaPNoticia',

			// Lo que se extrae de la noticia en si
			'images' => '.contImagen img, .aperturaCont img',
			'content' => '#cuerpoNoticia',
			'author' => '.meta .autor, .contbio h3',
			'date' => '.meta .fecha, .fecha',
			'tags' => 'h1, .herramientas a[rel=tag]',
                        'category_alias' => "#subMenu .chatafaca a[!title], .meta .lugar",
		),
		'encoding' => false,
	),
);
$crawler = new Crawler();
$crawler->setDiary($diary);
$crawler->run();