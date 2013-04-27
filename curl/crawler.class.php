<?php
include("simple_html_dom.php");
include("news.class.php");

// Solo vamos a buscar las 5 noticias mas nuevas
define("MAX_URL_CRAWLED", 5);

/**
 * Clase que permite hacer una busqueda de elementos
 * de una pagina web para obtenerlos y alimentar
 * una base de datos de noticias
 *
 * @author wuilliam
 *
*/
class Crawler {
	/**
	 * Variable para controlar los diarios, sus categorias y urls
	 *
	 * @var array
	 */
	var $diaries = array();

	/**
	 * Variable que contiene el objeto que interactua con el
	 * html devuelto por la consulta
	 *
	 * @var simple_html_dom
	*/
	var $html_dom = NULL;

	/**
	 * Objeto News contenedor de la noticia como tal y que permite
	 * interactuar con ella
	 *
	 * @var News
	 */
	var $new_obj = NULL;


	/**
	 * Objeto cURL para abrir las url de los diarios
	 * @var cUrl
	 */
	var $curl_obj = NULL;


	/**
	 * Constructor de la clase Crawler
	 */
	public function Crawler() {
		$this->diaries = array();

		$this->html_dom = new simple_html_dom();
	}
	
	
	/**
	 * Metodo que define el diario al cual hacer crawler
	 * @param array $diary Diario
	 */
	public function setDiary($diary) {
		$this->diaries = $diary;
	}
	
	
	/**
	 * Metodo para hacer el encodign del periodico el mundo
	 * @param string $str texto a codificar
	 */
	public function elmundoes_encode($str) {
		return utf8_encode(html_entity_decode($str));
	}
	
	
	/**
	 * Metodo para hacer el encodign del periodico la vanguardia
	 * @param string $str texto a codificar
	 */
	public function lavanguardia_encode($str) {
		return utf8_encode(html_entity_decode($str));
	}
	
	
	/**
	 * Metodo para hacer el encodign del periodico marca
	 * @param string $str texto a codificar
	 */
	public function marca_encode($str) {
		return html_entity_decode($str);
	}
	
	
	/**
	 * Metodo para obtener el encoding del diario
	 * y ejecuta la funcion correspondiente
	 * @param string $str texto a codificar
	 * @param string $diary Diario
	 */
	public function encode($str, $diary, $field = null) {
		if (!empty($this->diaries[$diary]['encoding'])) {
			if (is_array($this->diaries[$diary]['encoding'])) {
				if (isset($this->diaries[$diary]['encoding'][$field])) {
					$func = $this->diaries[$diary]['encoding'][$field];
					$str = $this->$func($str);
				}
			} else {
				$func = $this->diaries[$diary]['encoding'];
				$str = $this->$func($str);
			}
		}
		return $str;
	}

	/**
	 * Busca el patron en el objeto html dado
	 * @param simple_html_dom $html
	 * @param string $pattern
	 * @return simple_html_dom
	 */
	public function findAll($html, $pattern) {
		$objs = NULL;
		try {
			$objs = $html->find($pattern);
		} catch (Exception $e) {
			error_log("findAll ERROR: " . $e);
		}
		return $objs;
	}

	/**
	 * Busca el patron en el objeto html dado
	 * @param simple_html_dom $html
	 * @param string $pattern
	 * @param int $flag -1 o 0
	 * @return simple_html_dom
	 */
	public function find($html, $pattern, $flag = 0) {
		$objs = NULL;
		try {
			$objs = $html->find($pattern, $flag);
		} catch (Exception $e) {
			error_log("find Error: " . $e);
		}
		return $objs;
	}

	/**
	 * Busca los articulos y devuelve el resultado del find
	 *
	 * @param simple_html_dom $html
	 * @return multitype:
	 */
	public function findArticles($html, $pattern) {
		return $this->findAll($html, $pattern);
	}


	/**
	 * Metodo que hace la extaccion de los datos de la noticia dada
	 * @param News $new
	 * @param simple_html_dom $html
	 */
	public function makeNewCrawl($diary, $new, $html) {
		error_log("LOG1: Starting makeNewCrawl $diary new_id=".$new->id);
		
		// Se cargan los elementos faltantes, estan ordenados por prioridad
		$content = $this->findAll($html, $this->diaries[$diary]['patterns']['content']);
		$author = $this->find($html, $this->diaries[$diary]['patterns']['author']);
		$date = $this->find($html, $this->diaries[$diary]['patterns']['date']);
		$images = $this->findAll($html, $this->diaries[$diary]['patterns']['images']);
		$tags = $this->findAll($html, $this->diaries[$diary]['patterns']['tags']);
		$category_alias = $this->findAll($html, $this->diaries[$diary]['patterns']['category_alias']);
		
		// Si tiene contenido entonces construimos cada bloque de texto
		// tal como viene en la noticia
		if (isset($content) && !empty($content)) {
			// Establenciendo valores
			$content_txt = '';
			foreach ($content as $obj) {
				if (gettype($obj) === "object") {
					$obj->innertext = preg_replace("/\s+/", " ", $obj->innertext);
					$obj->innertext = preg_replace("/\<p\>\&nbsp\;\<\/p\>/", '', $obj->innertext);
					$obj->innertext = preg_replace("'<style[^>]*>.*</style>'", '', $obj->innertext);
					$obj->innertext = preg_replace("'<script[^>]*>.*</script>'", '', $obj->innertext);
					$content_txt .= $obj->innertext;
				}
			}
			$new->setContent($this->encode($content_txt, $diary, 'content'));
		}
		
		// Se buscan las imagenes
		if (isset($images) && !empty($images)) {
			$images_array = array();
			foreach ($images as $obj) {
				if (gettype($obj) === "object") {
					// Algunas imagenes son con url absoluta, otras no, por eso
					// se valida con regex
					$src = (preg_match('/^http/', $obj->src)) ? $obj->src : $this->diaries[$diary]['base_url'] . $obj->src;
					$images_array[] = $src;
				}
			}
			$new->setImages(implode(";", $images_array));
		}
		
		// Se buscan los tags
		if (isset($tags) && !empty($tags)) {
			$tags_array = array();
			foreach ($tags as $obj) {
				if (gettype($obj) === "object") {
					$obj->plaintext = preg_replace("/\s+/", " ", $obj->plaintext);
					$tags_array[] = $this->encode(trim($obj->plaintext), $diary, 'tags');
				}
			}
			$new->setTags(implode(";", $tags_array));
		}
		
		if (isset($author) && !empty($author)) {
			$author->plaintext = preg_replace("/\s+/", " ", $author->plaintext);
			$new->setAuthor($this->encode(trim($author->plaintext), $diary, 'author'));
		}
		
		if (isset($date) && !empty($date)) {
			$date->plaintext = preg_replace("/\s+/", " ", $date->plaintext);
			$new->setDate($this->encode(trim($date->plaintext), $diary, 'date'));
		}
		
		if (isset($category_alias) && !empty($category_alias)) {
			$category_array = array();
			foreach ($category_alias as $obj) {
				if (gettype($obj) === "object") {
					$obj->plaintext = preg_replace("/\s+/", " ", $obj->plaintext);
					$category_array[] = $this->encode(trim($obj->plaintext), $diary, 'category_alias');
				}
			}
			$new->setCategory(implode(";", $category_array));
		}
		
		// Se actualiza la noticia
		$new->update();
		
		// Si luego de guardarse no tiene los campos necesarios
		// Entonces se elimina
		if (!$new->isValid()) {
			error_log("LOG6: Invalid new id=".$new->id." deleting...");
			$new->delete();
		}
		unset($new, $date, $autor, $diary, $tags, $images, $images_array, $tags_array, $content, $content_txt, $html);
	}
	
	
	/**
	 * Hacer el llenado de los campos de las noticias
	 */
	public function fillNews($diary) {
		// Objeto que instanciara la clase y tendra en si los valores de la new
		$obj_new = new News();
		
		// obtenemos todas las noticias del diario que no se estan mostrando ni
		// han sido revisadas por el crawler
		$news = $obj_new->getNews(array("diary" => $diary, "reviewed" => 0));
		
		// Si hay noticias recorremos todas para hacer el crawl
		if (!empty($news)) {
			foreach ($news as $new) {
				// Cargamos la noticia segun su id
				$obj_new->load($new['id']);
				
				// Si no es valida la noticia, es decir, si no tiene resumen
				// contenido o autor (link, title ya estan validados) entonces
				// se busca los datos faltantes
				if (!$obj_new->isValid()) {	
					error_log("LOG4: fillNews $diary " . $new['link'] . " id=" . $obj_new->id);
					
					// Se carga el html de la noticia y se hace el crawl
					$this->html_dom->load("{$this->curl($obj_new->link)}");
					$this->makeNewCrawl($diary, $obj_new, $this->html_dom);
				}
			}
		}
	}

	/**
	 * Hacer la busqueda de los elementos sobre un objeto
	 * simple_html_dom dado
	 *
	 * @param string $diary
	 * @param simple_html_dom $html
	 */
	public function makeCrawl($diary, $html, $category = '') {
		// Buscando los articulos
		$articles_obj = $this->findArticles($html, $this->diaries[$diary]['patterns']['article']);

		// Recorriendo cada articulo encontrado
		$i = 0;
		foreach ($articles_obj as $obj) {
			if ($i++ > MAX_URL_CRAWLED - 1) {
				break;
			}
			// Si es un obj para garantizar que no sea otra cosa
			if (gettype($obj) === "object") {
				// Buscamos el titulo del articulo
				$titles = $this->find($obj, $this->diaries[$diary]['patterns']['title']);

				// Buscando el enlace del articulo
				$links = $this->find($obj, $this->diaries[$diary]['patterns']['link']);

				// Buscando el resumen
				$resumes = $this->find($obj, $this->diaries[$diary]['patterns']['resume']);

				// Si existen ambas cosas se guarda la noticia
				if (isset($titles) && isset($links) && isset($resumes)) {
					// Fix porque a veces no trae la url absoluta
					$links = (preg_match('/^http/', $links->href)) ? $links->href : $this->diaries[$diary]['base_url'] . $links->href;
					
					// Creando el objeto noticia y estableciendo sus valores
					$new_obj = new News();
					$new_obj->setDiary($diary);
					if (!empty($titles->plaintext) && $titles->plaintext) {
						$titles->plaintext = preg_replace("/\s+/", " ", $titles->plaintext);
						$new_obj->setTitle($this->encode(trim($titles->plaintext), $diary, 'title'));
					}
					
					$new_obj->setLink($links);
					
					if (!empty($resumes->plaintext) && $resumes->plaintext) {
						$resumes->plaintext = preg_replace("/\s+/", " ", $resumes->plaintext);
						$new_obj->setResume($this->encode("<p>" . trim($resumes->plaintext) . "</p>", $diary, 'resume'));
					}
					
					// Set temporal de la categoria
					$new_obj->setCategory($category);
					
					// Si la noticia es nueva, se guarda
					if ($new_obj->isNew()) {
						$new_obj->save();
					}
				}
			}
		}
	}
	
	
	/**
	 * Apertura curl y retorno del flujo de la url data
	 * @param string $url Url de la pagina que se abrira
	 */
	public function curl($url) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url); // Define target site
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE); // Return page in string
		curl_setopt($ch, CURLOPT_ENCODING , "gzip");     
		curl_setopt($ch, CURLOPT_TIMEOUT, 120); 
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE); // Follow redirects
		
		$return = curl_exec($ch); 
		$info = curl_getinfo($ch); 
		curl_close($ch);
		return $return;
	}

	/**
	 * Permite recorrer las url de las categorias e ir accediendo a cada una
	 * para obtener las noticias de esa url
	 *
	 * @param string $diary
	 * @param array $categories
	 */
	public function openUrls($diary, $categories) {
		$i = 0;
		foreach($categories as $category => $url) {
			error_log("LOG5: openUrls $diary $url");
			$this->html_dom->load("{$this->curl($url)}");
			$this->makeCrawl($diary, $this->html_dom, $category);
		}
	}

	/**
	 * Funcion principal que corre en si todo el proceso
	 */
	public function run($get = null) {
		foreach ($this->diaries as $diary => $properties) {
			// Abrir cada URL segun la categoria
			$this->openUrls($diary, $properties['categories']);
			
			// Llenar los demas campos de las noticias
			$this->fillNews($diary);
			echo "$diary Done.";
		}
	}
}