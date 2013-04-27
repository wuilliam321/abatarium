<?php
App::uses('AppController', 'Controller');
/**
 * Settings Controller
 *
 * @property Setting $Setting
 */
class SettingsController extends AppController {
	public function beforeFilter() {
		$this->response->header('Access-Control-Allow-Origin: *');
	}

/**
 * add method
 *
 * @return void
 */
	public function save() {	
		$this->loadModel('User');
		if ($this->request->is('get')) {
			$setting = $this->Setting->create();
			$setting['Setting']['user_id'] = $this->request->query['data']['User']['id'];
			$setting['Setting']['value'] = $this->request->query['data']['Setting']['showed_news'];
			$aux = $this->Setting->find("first", array("conditions" => array(
				"Setting.name" => "showed_news",
				"Setting.user_id" => $this->request->query['data']['User']['id'],
			)));
			if ($aux) {
				$setting['Setting']['id'] = $aux['Setting']['id'];
			}
			if ($this->Setting->save($setting)) {
				$action = $this->codes[1] + array("item" => $setting);
				$user = $this->User->find("first", array("conditions" => array("User.id" => $this->request->query['data']['User']['id'])));
				$user['Keyword'] = $this->request->query['data']['Keyword'];
				$this->User->save($user);
			} else {
				$action = $this->codes[0];
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
 * index method
 *
 * @return void
 */
	//public function index() {
	//	$this->Setting->recursive = 0;
	//	$this->set('settings', $this->paginate());
	//}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	//public function view($id = null) {
	//	$this->Setting->id = $id;
	//	if (!$this->Setting->exists()) {
	//		throw new NotFoundException(__('Invalid setting'));
	//	}
	//	$this->set('setting', $this->Setting->read(null, $id));
	//}

/**
 * add method
 *
 * @return void
 */
	//public function add() {
	//	if ($this->request->is('post')) {
	//		$this->Setting->create();
	//		if ($this->Setting->save($this->request->data)) {
	//			$this->Session->setFlash(__('The setting has been saved'));
	//			$this->redirect(array('action' => 'index'));
	//		} else {
	//			$this->Session->setFlash(__('The setting could not be saved. Please, try again.'));
	//		}
	//	}
	//	$users = $this->Setting->User->find('list');
	//	$this->set(compact('users'));
	//}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	//public function edit($id = null) {
	//	$this->Setting->id = $id;
	//	if (!$this->Setting->exists()) {
	//		throw new NotFoundException(__('Invalid setting'));
	//	}
	//	if ($this->request->is('post') || $this->request->is('put')) {
	//		if ($this->Setting->save($this->request->data)) {
	//			$this->Session->setFlash(__('The setting has been saved'));
	//			$this->redirect(array('action' => 'index'));
	//		} else {
	//			$this->Session->setFlash(__('The setting could not be saved. Please, try again.'));
	//		}
	//	} else {
	//		$this->request->data = $this->Setting->read(null, $id);
	//	}
	//	$users = $this->Setting->User->find('list');
	//	$this->set(compact('users'));
	//}

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
	//	$this->Setting->id = $id;
	//	if (!$this->Setting->exists()) {
	//		throw new NotFoundException(__('Invalid setting'));
	//	}
	//	if ($this->Setting->delete()) {
	//		$this->Session->setFlash(__('Setting deleted'));
	//		$this->redirect(array('action' => 'index'));
	//	}
	//	$this->Session->setFlash(__('Setting was not deleted'));
	//	$this->redirect(array('action' => 'index'));
	//}
}
