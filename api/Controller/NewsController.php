<?php
App::uses('AppController', 'Controller');
/**
 * News Controller
 *
 * @property News $News
 */
class NewsController extends AppController {
	public function beforeFilter() {
		$this->response->header('Access-Control-Allow-Origin: *');
	}
	
	public function getAll() {
		$news = $this->News->find('all');
		$this->set(array(
			'news' => $news,
			'_serialize' => array('news')
		));
		$this->layout = false;
	}
	
	public function getByKeywords() {
		$options['conditions'] = array("News.showed" => 1,  "News.reviewed" => 1);
		$page = (isset($this->request->query['page']) && $this->request->query['page']) ? $this->request->query['page'] : '1';
		$options['limit'] = (isset($this->request->query['showed_news']) && $this->request->query['showed_news']) ? $this->request->query['showed_news'] : 0;
		$options['offset'] = ($page - 1) * $options['limit'];
		$options['order'] = array("News.id DESC");
		$options['fields'] = array("News.id", "News.title", "News.link", "News.resume", "News.content", "News.tags", "News.category_alias", "News.author");
        $find = (isset($this->request->query['count']) && $this->request->query['count']) ? 'count' : 'all';
		foreach($this->request->params['pass'] as $keyword) {
			$options['conditions']['OR'][] = array(
				'News.tags LIKE' => "%" . $keyword . "%"
			);
			$options['conditions']['OR'][] = array(
				'News.content LIKE' => "%" . $keyword . "%"
			);
			$options['conditions']['OR'][] = array(
				'News.title LIKE' => "%" . $keyword . "%"
			);
			$options['conditions']['OR'][] = array(
				'News.resume LIKE' => "%" . $keyword . "%"
			);
			$options['conditions']['OR'][] = array(
				'News.category_alias LIKE' => "%" . $keyword . "%",
			);
			$options['conditions']['OR'][] = array(
				'News.link LIKE' => "%" . $keyword . "%",
			);
			$options['conditions']['OR'][] = array(
				'News.author LIKE' => "%" . $keyword . "%",
			);
		}
		$news = $this->News->find("all", $options);
		if ($find == "count") {
			$news = array("count" => sizeof($news));
		}
		$this->layout = false;
		echo "callback(";
		echo json_encode($news);
		echo ")";
		$this->render(false);
	}
	
	public function getById($id = null) {
		$options['conditions'] = array("News.showed" => 1,  "News.reviewed" => 1, "News.id" => $id);
		$news = $this->News->find('first', $options);
		$this->layout = false;
		
		echo "callback(";
		echo json_encode($news);
		echo ")";
		$this->render(false);
	}
}
