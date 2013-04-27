<?php
/**
 * Definiendo constantes
 */
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'root');
define('DB_NAME', 'mydb');

class SPDO extends PDO {
	/**
	 * Instancia de la clase
	 *
	 * @var mixed objeto de la clase
	 */
	private static $instance;

	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct(
			'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS
		);
	}
	
	/**
	 * Singleton
	 * @return mixed
	 */
	public static function singleton() {
		if( self::$instance == null ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
	
}