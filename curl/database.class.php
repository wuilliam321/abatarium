<?php
/**
 * Definiendo constantes
 */
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'root');
define('DB_NAME', 'mydb');

/**
 * Clase Database para conectarse y guardar todo
 * 
 * @author wuilliam
 *
 */
class Database {
	/**
	 * Objeto para manipular la base de datos
	 * 
	 * @var mixed objeto de la clase
	 */
	public $db;
	
	/** 
	 * Usuario de la base de datos```
	 * @var string
	 */
	public $user;
	
	/**
	 * Clave del usuario
	 * @var string
	 */
	public $pass;
	
	/**
	 * Host de conexion
	 * @var string
	 */
	public $host;
	
	/**
	 * Nombre de la base de datos
	 * @var string
	 */
	public $database;
	
	
	/**
	 * Objeto individual para manipular
	 */
	public $obj;
	
	/**
	 * Objetos varios a manipular
	 */
	public $objs;
	
	/**
	 * Tabla donde se almacenaran los datos
	 */
	public $table;
	
	/**
	 * Campos publicos de la tabla
	 * @var array
	 */
	public $fields;
	
	
	/**
	 * Constructor
	 */
	public function Database() {
		$this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
		$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}
	
	/**
	 * Construye los campos del objeto a guardar
	 * @param array $data
	 * @return string
	 */
	public function buildFieldsValues($data, $fields) {
		foreach ($fields as $field) {
			$txt = '';
			if (!empty($data[$field])) {
				$txt = $data[$field];
			}
			$values[] = "$field = '" . addslashes($txt) . "'";
		}
		return implode(",", $values);
	}
	
	/**
	 * Construye los campos del objeto a guardar
	 * @param array $data
	 * @return string
	 */
	public function buildFields($data) {
		return implode(",", array_values($data));
	}
	
	/** 
	 * Construye los valores de los campos
	 * @param array $data
	 * @param array $fields
	 * @return string
	 */
	public function buildValues($data, $fields) {
		$values = array();
		foreach ($fields as $field) {
			$txt = '';
			if (!empty($data[$field])) {
				$txt = $data[$field];
			}
			$values[] = "'".addslashes($txt)."'";
		}
		return implode(",", array_values($values));
	}
	
	/**
	 * Guarda un objeto
	 */
	public function save() {
		// Obteiene la data del objeto
		$kvs = get_object_vars($this);
		
		// Construye campos y valores
		$fields = $this->buildFields($this->fields);
		$values = $this->buildValues($kvs, $this->fields);
		
		// Construyendo el sql
		$tmpl = "INSERT INTO %s (%s) VALUES (%s);";
		$sql = sprintf($tmpl, $this->table, $fields, $values);
// 		echo "$sql <br />";
		
		// Ejecutando el SQL
 		$r = $this->db->prepare($sql);
 		return $r->execute();
	}
	
	
	/**
	 * Actualiza un objeto
	 */
	public function update() {
		$kvs = get_object_vars($this);
		$field_values = $this->buildFieldsValues($kvs, $this->fields);
		
		$tmpl = "UPDATE %s SET %s , showed = 1, reviewed = 1 WHERE id = '%s'";
		$sql = sprintf($tmpl, $this->table, $field_values, $kvs['id']);
		
		// Ejecutando el SQL
 		$r = $this->db->prepare($sql);
 		return $r->execute();
	}
	
	
	/**
	 * Elimina un objeto
	 */
	public function delete() {
		$tmpl = "UPDATE %s SET showed = 0 WHERE id = '%s'";
		$sql = sprintf($tmpl, $this->table, $this->id);
		
		// Ejecutando el SQL
 		$r = $this->db->prepare($sql);
 		return $r->execute();
	}
	
	/** 
	 * Carga un objeto y lo devuelve
	 * @param int $id
	 * @param string $class
	 */
	public function load($id, $class) {
		$fields = $this->buildFields($this->fields);
		$tmpl = "SELECT %s FROM %s WHERE id = '%s'";
		$sql = sprintf($tmpl, $fields, $this->table, $id);
// 		echo "$sql <br />";
		
		// Ejecutando el SQL
 		$r = $this->db->prepare($sql);
 		$r->execute();
 		return $r->fetchObject($class);
	}
	
	/**
	 * Comprueba si un registro existe
	 * $data debe ser un arreglo array(key => value) donde 
	 * key es el campo en la db, y value el valor a comprar
	 * con ese campo
	 * @param array $data
	 * @return boolean
	 */
	public function isRegistered($data) {
		// Obteniendo campo a buscar y valor
		$key = array_keys($data);
		$value = array_values($data);
		
		// Preparando el sql
		$tmpl = "SELECT * FROM %s WHERE %s = '%s'";
		$sql = sprintf($tmpl, $this->table, $key[0], $value[0]);
		
		// Ejecutando SQL
		$r = $this->db->prepare($sql);
		$r->execute();
		
		// SI hay registros entonces si existe
		if ($r->rowCount() > 0) {
			return true;
		}
		return false;
	}
	
	
	/**
	 * Permite devolver todos los registros de la tabla
	 * @return mixed
	 */
	public function getAll($where) {
		// Template
		$tmpl = "SELECT * FROM %s %s";
		$sql = sprintf($tmpl, $this->table, $where);
		error_log($sql);

		// Ejecutando SQL
		$r = $this->db->prepare($sql);
		$r->execute();
		
		// Si hay registros los devuelve como arreglo
		if ($r->rowCount() > 0) {
			return $r->fetchAll();
		}
		return false;
	}
}