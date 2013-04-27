<?php
App::uses('AppController', 'Controller');
App::uses('CakeEmail', 'Network/Email');
/**
 * Users Controller
 *
 * @property User $User
 */
class UsersController extends AppController {
	public function beforeFilter() {
		$this->response->header('Access-Control-Allow-Origin: *');
	}

/**
 * index method
 *
 * @return void
 */
	//public function index() {
	//	$this->User->recursive = 0;
	//	$users = $this->User->find("all");
	//	$this->layout = false;
	//	
	//	echo "callback(";
	//	echo json_encode($users);
	//	echo ")";
	//	$this->render(false);
	//}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	//public function view($id = null) {
	//	$this->User->id = $id;
	//	if (!$this->User->exists()) {
	//		throw new NotFoundException(__('Invalid user'));
	//	}
	//	$this->set('user', $this->User->read(null, $id));
	//}
	
	public function generateRandomString($length = 4) {
		$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$randomString = '';
		for ($i = 0; $i < $length; $i++) {
			$randomString .= $characters[rand(0, strlen($characters) - 1)];
		}
		return $randomString;
	}

/**
 * add method
 *
 * @return void
 */
	public function create() {
		if ($this->request->is('get')) {
			$user = $this->User->create();
			$user['User']['email'] = $this->request->query['data']['User']['email'];
			$pass = $this->generateRandomString();
			$user['User']['password'] = md5($pass);
			$aux = $this->User->find("first", array("conditions" => array("User.email" => $user['User']['email'])));
			if ($aux) {
				$action = $this->codes[3]; // exists
			} else if ($this->User->save($user)) {
				$action = $this->codes[1]; // success
				$email = new CakeEmail();
				$email->from(array('info@wlacruz.com.ve' => 'Abatarium'))
				    ->to($user['User']['email'])
				    ->subject('Contraseña de usuario')
				    ->send('Su clave es: ' . $pass);
			} else {
				$action = $this->codes[0]; // error
			}
		} else {
			$action = $this->codes[0];
		}
		echo "callback(";
		echo json_encode($action);
		echo ")";
		$this->render(false);
	}

/**
 * add method
 *
 * @return void
 */
	public function recovery() {
		if ($this->request->is('get')) {
			$user = $this->User->find("first", array("conditions" => array("User.email" => $this->request->query['data']['User']['email'])));
			if ($user) {
				$pass = $this->generateRandomString();
				$user['User']['password'] = md5($pass);
			}
			if ($this->User->save($user)) {
				$action = $this->codes[1]; // success
				$email = new CakeEmail();
				$email->from(array('info@wlacruz.com.ve' => 'Abatarium'))
				    ->to($user['User']['email'])
				    ->subject('Nueva Contraseña')
				    ->send('Su nueva clave es: ' . $pass);
			} else {
				$action = $this->codes[0]; // error
			}
		} else {
			$action = $this->codes[0];
		}
		echo "callback(";
		echo json_encode($action);
		echo ")";
		$this->render(false);
	}

/**
 * add method
 *
 * @return void
 */
	public function login() {
		if ($this->request->is('get')) {
			$user = $this->User->find("first", array("conditions" => array("User.email" => $this->request->query['data']['User']['email'])));
			if ($user) {
				$data = md5($user['User']['email'] . $user['User']['password']);
				if ($data == $this->request->query['q']) {
					$action = $this->codes[1] + array("item" => $user);
				} else {
					$action = $this->codes[0];
				}
				
			} else {
				$action = $this->codes[2]; // error
			}
		} else {
			$action = $this->codes[0];
		}
		echo "callback(";
		echo json_encode($action);
		echo ")";
		$this->render(false);
	}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function update() {
		$this->User->id = $this->request->query['data']['User']['id'];
		if (!$this->User->exists()) {
			$action = $this->codes[2];
		}
		if ($this->request->is('get')) {
			$user = $this->request->query['data']['User'];
			if ($this->User->save($user)) {
				$action = $this->codes[1] + array("item" => array('User' => $user));
			} else {
				$action = $this->codes[0];
			}
		} else {
			$action = $this->codes[2];
		}
		echo "callback(";
		echo json_encode($action);
		echo ")";
		$this->render(false);
	}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function password() {
		$this->User->id = $this->request->query['data']['User']['id'];
		if (!$this->User->exists()) {
			$action = $this->codes[2];
		}
		if ($this->request->is('get')) {
			$user = $this->User->read(null, $this->request->query['data']['User']['id']);
			if (($this->request->query['data']['User']['password_old'] == $user['User']['password'])
			    && ($this->request->query['data']['User']['password_new'] == $this->request->query['data']['User']['password_confirm'])) {
				$user['User']['password'] = $this->request->query['data']['User']['password_new'];
				if ($this->User->save($user)) {
					$action = $this->codes[1] + array("item" => array('User' => $user));
				} else {
					$action = $this->codes[2];
				}
			} else {
				$action = $this->codes[0];
			}
			
		} else {
			$action = $this->codes[2];
		}
		echo "callback(";
		echo json_encode($action);
		echo ")";
		$this->render(false);
	}

/**
 * delete method
 *
 * @throws MethodNotAllowedException
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	//public function delete($id = null) {
	//	if (!$this->request->is('post')) {
	//		throw new MethodNotAllowedException();
	//	}
	//	$this->User->id = $id;
	//	if (!$this->User->exists()) {
	//		throw new NotFoundException(__('Invalid user'));
	//	}
	//	if ($this->User->delete()) {
	//		$this->Session->setFlash(__('User deleted'));
	//		$this->redirect(array('action' => 'index'));
	//	}
	//	$this->Session->setFlash(__('User was not deleted'));
	//	$this->redirect(array('action' => 'index'));
	//}
}
