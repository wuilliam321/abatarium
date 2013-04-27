<?php
App::uses('AppController', 'Controller');
/**
 * Keywords Controller
 *
 * @property Keyword $Keyword
 */
class KeywordsController extends AppController {
	public function beforeFilter() {
		$this->response->header('Access-Control-Allow-Origin: *');
	}
	
	public function autocomplete() {
		$keywords = $this->Keyword->find("list", array("conditions" => array("Keyword.name LIKE" => "%" . $this->request->query['q'] . "%")));
		
		echo "callback(";
		echo json_encode($keywords);
		echo ")";
		$this->render(false);
	}

/**
 * index method
 *
 * @return void
 */
	//public function index() {
	//	$this->Keyword->recursive = 0;
	//	$this->set('keywords', $this->paginate());
	//}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	//public function view($id = null) {
	//	$this->Keyword->id = $id;
	//	if (!$this->Keyword->exists()) {
	//		throw new NotFoundException(__('Invalid keyword'));
	//	}
	//	$this->set('keyword', $this->Keyword->read(null, $id));
	//}

/**
 * add method
 *
 * @return void
 */
	//public function add() {
	//	if ($this->request->is('post')) {
	//		$this->Keyword->create();
	//		if ($this->Keyword->save($this->request->data)) {
	//			$this->Session->setFlash(__('The keyword has been saved'));
	//			$this->redirect(array('action' => 'index'));
	//		} else {
	//			$this->Session->setFlash(__('The keyword could not be saved. Please, try again.'));
	//		}
	//	}
	//	$news = $this->Keyword->News->find('list');
	//	$users = $this->Keyword->User->find('list');
	//	$this->set(compact('news', 'users'));
	//}

/**
 * edit method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	//public function edit($id = null) {
	//	$this->Keyword->id = $id;
	//	if (!$this->Keyword->exists()) {
	//		throw new NotFoundException(__('Invalid keyword'));
	//	}
	//	if ($this->request->is('post') || $this->request->is('put')) {
	//		if ($this->Keyword->save($this->request->data)) {
	//			$this->Session->setFlash(__('The keyword has been saved'));
	//			$this->redirect(array('action' => 'index'));
	//		} else {
	//			$this->Session->setFlash(__('The keyword could not be saved. Please, try again.'));
	//		}
	//	} else {
	//		$this->request->data = $this->Keyword->read(null, $id);
	//	}
	//	$news = $this->Keyword->News->find('list');
	//	$users = $this->Keyword->User->find('list');
	//	$this->set(compact('news', 'users'));
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
	//	$this->Keyword->id = $id;
	//	if (!$this->Keyword->exists()) {
	//		throw new NotFoundException(__('Invalid keyword'));
	//	}
	//	if ($this->Keyword->delete()) {
	//		$this->Session->setFlash(__('Keyword deleted'));
	//		$this->redirect(array('action' => 'index'));
	//	}
	//	$this->Session->setFlash(__('Keyword was not deleted'));
	//	$this->redirect(array('action' => 'index'));
	//}
}
