<?php
include("database.class.php");
/**
 * Clase News para manipular el objeto noticia
 * es alimentado por el Crawler y puede ser
 * guardado en la base de datos posteriormente
 *
 * @author wuilliam
 *
*/
class News extends Database {
	/**
	 * Id de la noticia
	 * @var int
	 */
	var $id;
	/**
	 * Alias del diario
	 * @var string
	 */
	var $diary;

	/**
	 * Titulo de la noticia
	 * @var string
	 */
	var $title;

	/**
	 * Url de enlace
	 * @var string
	 */
	var $link;

	/**
	 * Resumen
	 * @var string
	 */
	var $resume;

	/**
	 * Autor
	 * @var string
	 */
	var $author;

	/**
	 * Fecha de actualizacion
	 * @var string
	 */
	var $date;

	/**
	 * Contenido
	 * @var string
	 */
	var $content;

	/**
	 * Imagenes
	 * @var string
	 */
	var $images;

	/**
	 * Palabras Clave
	 * @var string
	 */
	var $tags;

	/**
	 * Alias de la categoria
	 * @var string
	 */
	var $category_alias;

	/**
	 * Si se muestra a los clientes
	 * @var boolen
	 */
	var $showed;

	/**
	 * Si esta revisada
	 * @var boolean
	 */
	var $reviewed;

	/**
	 * Constructora de la clase parametrizadi
	 * @param array $data
	 */
	public function News() {
		parent::__construct();
		$this->table = "news";
		$this->fields = array(
				"id", "diary", "title", "link", "resume", "author", "category_id",
				"category_alias", "content", "images", "date", 'tags', 'reviewed',
				'showed'
		);
	}

	/**
	 * Setter del id de la noticia
	 * @param string $id
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Setter del alias del diario asociado a la noticia
	 * @param string $diary
	 */
	public function setDiary($diary) {
		$this->diary = $diary;
	}

	/**
	 * Setter del alias del diario asociado a la noticia
	 * @param string $diary
	 */
	public function setTitle($title) {
		$this->title = $title;
	}

	/**
	 * Setter del alias del diario asociado a la noticia
	 * @param string $link
	 */
	public function setLink($link) {
		$this->link = $link;
	}

	/**
	 * Establece el resumen
	 * @param string $resume
	 */
	public function setResume($resume) {
		$this->resume = $resume;
	}

	/**
	 * Establece el resumen
	 * @param string $resume
	 */
	public function setAuthor($author) {
		$this->author = $author;
	}

	/**
	 * Establece el resumen
	 * @param string $resume
	 */
	public function setDate($date) {
		$this->date = $date;
	}

	/**
	 * Establece el contenido
	 * @param string $content
	 */
	public function setContent($content) {
		$this->content = $content;
	}

	/**
	 * Establece las imagenes que posee
	 * @param string $images
	 */
	public function setImages($images) {
		$this->images = $images;
	}

	/**
	 * Establece las palabras claves
	 * @param string $tags
	 */
	public function setTags($tags) {
		$this->tags = $tags;
	}

	/**
	 * Estableciendo la categoria - alias
	 * @param string $category
	 */
	public function setCategory($category) {
		$this->category_alias = $category;
	}


	/**
	 * Establece el objeto noticia en el obj para guardarlo
	 * @param unknown $new
	 */
	public function setObject($new) {
		$this->obj = $new;
	}
	
	
	/**
	 * Determina si una noticia es nueva o no
	 * @return boolean
	 */
	public function isNew() {
		return ($this->isRegistered(array('link' => $this->link))) ? false : true;
	}
	
	
	/**
	 * Devuelve todas las noticias
	 * @return array
	 */
	public function getNews($filter) {
		foreach ($filter as $k => $v) {
			$$k = $v;
		}
		$where = '';
		$and = 'WHERE';
		if (isset($id)) {
			$where .= $and . " LIKE '%$id%'";
			$and = ' AND ';
		}
		if (isset($diary)) {
			$where .= $and . " diary LIKE '%$diary%'";
			$and = ' AND ';
		}
		if (isset($title)) {
			$where .= $and . " title LIKE '%$title%'";
			$and = ' AND ';
		}
		if (isset($link)) {
			$where .= $and . " link LIKE '%$link%'";
			$and = ' AND ';
		}
		if (isset($author)) {
			$where .= $and . " author LIKE '%$author%'";
			$and = ' AND ';
		}
		if (isset($date)) {
			$where .= $and . " date LIKE '%$date%'";
			$and = ' AND ';
		}
		if (isset($category_id)) {
			$where .= $and . " category_id LIKE '%$category_id%'";
			$and = ' AND ';
		}
		if (isset($category_alias)) {
			$where .= $and . " category_alias LIKE '%$category_alias%'";
			$and = ' AND ';
		}
		if (isset($resume)) {
			$where .= $and . " resume LIKE '%$resume%'";
			$and = ' AND ';
		}
		if (isset($content)) {
			$where .= $and . " content LIKE '%$content%'";
			$and = ' AND ';
		}
		if (isset($images)) {
			$where .= $and . " images LIKE '%$images%'";
			$and = ' AND ';
		}
		if (isset($tags)) {
			$where .= $and . " tags LIKE '%$tags%'";
			$and = ' AND ';
		}
		if (isset($showed)) {
			$where .= $and . " showed = $showed";
			$and = ' AND ';
		}
		if (isset($reviewed)) {
			$where .= $and . " reviewed = $reviewed";
			$and = ' AND ';
		}
		return $this->getAll($where);
	}
	
	
	/**
	 * Carga la noticia
	 * @see Database::load()
	 */
	public function load($id) {
		$new = parent::load($id, __CLASS__);
		$this->id = $new->id;
		$this->diary = $new->diary;
		$this->title = $new->title;
		$this->link = $new->link;
		$this->author = $new->author;
		$this->date = $new->date;
		$this->category_alias = $new->category_alias;
		$this->resume = $new->resume;
		$this->content = $new->content;
		$this->images = $new->images;
		$this->tags = $new->tags;
		$this->showed = $new->showed;
		$this->reviewed = $new->reviewed;
		return $new;
	}
	
	
	/**
	 * Verifica que la noticia sea valida, es decir
	 * que tenga lleno el campo content.
	 * Titulo link y otros, ya se han validado
	 * @return boolean
	 */
	public function isValid() {
		$this->load($this->id);
		if (empty($this->content) || empty($this->reviewed)) {
			return false;
		}
		return true;
	}
}