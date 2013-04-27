<?php
include("crawler.class.php");

$diary = array(
	'abces' => array(
		'base_url' => 'http://www.abc.es',
		'categories' => array(
			'portada' => 'http://directos.abc.es/Event/Actualidad_2',
		),
		// Patrones de busqueda de elementos
		'patterns' => array(
			// Lo que se extrae de la lista de noticias
			'article' => '#Posts li',
			'title' => 'div.Content',
			'link' => 'div.Content a',
			'resume' => '',

			// Lo que se extrae de la noticia en si
			'images' => '.colAB img, .photo-alt1 img, .photo-alt2 img, div.text img',
			'content' => 'div.text, .noticia-salud',
			'author' => 'div.author, .firma, span.author, .bloque h3, .alias_autor span',
			'date' => 'div.date, div.fecha, .entry-date, .bloque p, .itemDateModified',
			'tags' => '.grupo-codigo a, .cutretags a, .categorias a, .tags a',
                        'category_alias' => '#menu a.activo, ul.nav2 a.activo',
		),
		'encoding' => false,
	),
);
$crawler = new Crawler();
$crawler->setDiary($diary);
$crawler->run();