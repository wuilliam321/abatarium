/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
	// Database Object
	db: null,
	
	// Connected flag
	connected: false,
	
	// Application Constructor
	initialize : function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents : function() {
		// Activp cuando estare en el Telefono
		document.addEventListener('deviceready', this.onDeviceReady, false);

		// Activo cuando esta en TESTPC
		//this.onDeviceReady();
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicity call 'app.receivedEvent(...);'
	onDeviceReady : function() {
		app.mainEvent();
		app.validationsEvent();
	},
	// Update DOM on a Received Event
	mainEvent : function() {
		$(function() {
			// Conectar a la BD
			app.doConnect('newsdb', '1.0', 'News Database', 1000000);

			// Checkear sesion
			// app.doCheckSession();

			// Iniciando sliders
			app.doStartSliders();
			$("#todas").live('pagebeforeshow', function(event) {
				app.getLatestNews("#all-news");
			});
			$("#personalizadas").live('pagebeforeshow', function(event) {
				app.getLatestNewsByKW("#custom-news");
			});
			$("a.open-new").live("click", function () {
				app.getNew($(this).attr("alt"))
			})
		})
	},

	// Iniciando los sliders
	doStartSliders : function() {
		// Opciones del flexslide
		flexopts = {
			animation : "slide",
			controlsContainer : ".flex-container"
		};

		// Iniciando el slider principal
		$('#main .flexslider').flexslider(flexopts);

		// SLides secundarios que quieren ser renderizados luego uno a uno
		$("#main").live('pageshow', function(event) {
			$('#main .flexslider').flexslider(flexopts);
		});
		$("#principal").live('pageshow', function(event) {
			$('#principal .flexslider').flexslider(flexopts);
		});
		$("#perfil").live('pageshow', function(event) {
			$('#perfil .flexslider').flexslider(flexopts);
		});
		$("#ayuda").live('pageshow', function(event) {
			$('#ayuda .flexslider').flexslider(flexopts);
		});
		$("#acerca").live('pageshow', function(event) {
			$('#acerca .flexslider').flexslider(flexopts);
		});
		$("#configurar").live('pageshow', function(event) {
			$('#configurar .flexslider').flexslider(flexopts);
		});
		$("#todas").live('pageshow', function(event) {
			$('#todas .flexslider').flexslider(flexopts);
		});
		$("#personalizadas").live('pageshow', function(event) {
			$('#personalizadas .flexslider').flexslider(flexopts);
		});
		$("#registro").live('pageshow', function(event) {
			$('#registro .flexslider').flexslider(flexopts);
		});
		$("#recuperar").live('pageshow', function(event) {
			$('#recuperar .flexslider').flexslider(flexopts);
		});
	},
	// Validacion de formularios
	validationsEvent : function() {
		$(function() {
			// Formulario de Login
			$("#frm-login").validate({
				submitHandler : function(e) {
					// Si el form es valido
					if ($("#frm-login").valid()) {
						// Capturando la data
						inputs = $("#frm-login").serializeArray()
						username = inputs[0].value

						// TODO: cifrar clave
						password = inputs[1].value

						// Haciendo el Login
						app.doLogin(username, password);
						$.mobile.changePage("index.html#principal");
					}
				},
				messages : {
					username : {
						required : 'Usuario requerido',
						email : "Debe ser un correo electrónico"
					},
					password : {
						required : "Clave requerida"
					}
				}
			});

			// Formulario de Nuevo Usuario
			$("#frm-registro").validate({
				submitHandler : function(e) {
					// Si el form es valido
					if ($("#frm-registro").valid()) {
						// Capturando la data
						inputs = $("#frm-registro").serializeArray()

						// Guardando Perfil
						app.doCreateUser(inputs);
						$.mobile.changePage("index.html#main");
					}
				},
				messages : {
					"data[User][email]" : {
						required : 'Email es un campo requerido',
						email : "Debe ser un correo electrónico"
					}
				}
			});

			// Formulario de Recuperar clave
			$("#frm-recuperar").validate({
				submitHandler : function(e) {
					// Si el form es valido
					if ($("#frm-recuperar").valid()) {
						// Capturando la data
						inputs = $("#frm-recuperar").serializeArray()

						// Guardando Perfil
						app.doRecoverPassword();
						$.mobile.changePage("index.html#main");
					}
				},
				messages : {
					email : {
						required : 'Email es un campo requerido',
						email : "Debe ser un correo electrónico"
					}
				}
			});

			// Formulario Perfil
			$("#frm-perfil").validate({
				submitHandler : function(e) {
					// Si el form es valido
					if ($("#frm-perfil").valid()) {
						// Capturando la data
						inputs = $("#frm-perfil").serializeArray()

						// Guardando Perfil
						app.doSaveProfile();
						$.mobile.changePage("index.html#principal");
					}
				},
				messages : {
					email : {
						required : 'Email es un campo requerido',
						email : "Debe ser un correo electrónico"
					}
				}
			});

			// Formulario Configurar
			$("#frm-configurar").validate({
				submitHandler : function(e) {
					// Si el form es valido
					if ($("#frm-configurar").valid()) {
						// Capturando la data
						inputs = $("#frm-configurar").serialize()

						// Guardando Perfil
						app.doSaveSettings();
						$.mobile.changePage("index.html#principal");
					}
				},
				messages : {
					show_nnews : {
						required : 'Campo requerido',
						numeric : "Debe ser entero"
					}
				}
			});
		})
	},

	//
	// Funciones varias de la apliocacion
	//

	// Logeo
	doLogin : function(username, password) {
		$(function() {
			// console.log("doLogin " + username + " " + password);
		})
	},

	// Guardando perfil
	doSaveProfile : function() {
		$(function() {
			// console.log("Guardando el perfil");
		})
	},

	// Guardando configuraciones
	doSaveSettings : function() {
		$(function() {
			// console.log("Guardando el configuraciones");
		})
	},

	// Guardando nuevo usuario
	doCreateUser : function(user) {
		$(function() {
			var url = "http://www.wlacruz.com.ve/p/news_api/users/create";
			//var url = "http://news/api/users/create";
			console.log(user);
			//$.ajax({
			//	url: url,
			//	data: user,
			//	type: "POST",
			//	accepts: "application/x-www-form-urlencoded;charset=utf-8",
			//	//dataType: 'json',
			//	//jsonpCallback: "callback",
			//	success: function (data) {
			//		console.log(data);
			//	},
			//	error: function (e) {
			//		console.log(e);
			//	}
			//});
			$.post(url, user, function (e) { console.log(e); })
		})
	},

	// Recuperando clave
	doRecoverPassword : function() {
		$(function() {
			// console.log("Recuperando clave");
		})
	},
	
	// Obteniendo las ultimas noticias
	getLatestNews : function (news_container) {
		params = '';
		app.getNews(news_container, params);
	},
	
	// Obteniendo las ultimas noticias por keywords
	getLatestNewsByKW: function (news_container) {
		params = '/chavez/capriles/maduro/venezuela/caracas'; // TODO: buscar las kw del usuario
		app.getNews(news_container, params);
	},
	
	// Obtenido las noticias
	getNews: function (news_container, params) {
		$(news_container).empty();
		var url = "http://www.wlacruz.com.ve/p/news_api/news/getByKeywords" + params;
		//var url = "http://news/api/news/getByKeywords" + params;
		$.ajax({
			url: url,
			dataType: 'jsonp',
			timeout: 5000,
			jsonpCallback: "callback",
			success: function (data, status) {
				$(data).each(function (i, item) {
					container = $("<li>").addClass("ui-btn-icon-right ui-li-has-arrow ui-li ui-li-static ui-body-c");
					button = $("<div>").addClass("ui-btn-inner ui-li ui-li-static ui-body-c").attr("aria-hidden", true);
					left = $("<div>").addClass("ui-btn-text");
					arrow = $("<span>").addClass("ui-icon ui-icon-arrow-r ui-icon-shadow");
					link = $("<a>").attr("href", "#ver-noticia").addClass("ui-link-inherit open-new").attr({"data-ajax": "false", "alt": item.News.id});
					title = $("<h3>").text(item.News.title).addClass("ui-li-heading");
					resume = $("<p>").text($(item.News.resume).text()).addClass("ui-li-desc");
					
					$(link).append(title)
					$(link).append(resume)
					$(left).append(link)
					$(button).append(left);
					$(button).append(arrow);
					$(container).append(button);
					$(news_container).append(container);
				})
			}
		});
	},
	
	// Obtenido la noticia segun id
	getNew: function (params) {
		$("#new-title").empty();
		$("#new-content").empty();
		var url = "http://www.wlacruz.com.ve/p/news_api/news/getById/" + params;
		//var url = "http://news/api/news/getById/" + params;
		$.ajax({
			url: url,
			dataType: 'jsonp',
			timeout: 5000,
			jsonpCallback: "callback",
			success: function (item, status) {
				$("#new-title").html(item.News.title)
				$("#new-content").html(item.News.content)
			}
		});
	},
	
	
	
	/**
	 * Metodos de base de datos
	 */
	// On success
	onErrorDB: function (error) {
		console.log("Error: (" + error.code + ") " + error.message);
	},
	populateDB: function (tx) {
		tx.executeSql("CREATE TABLE IF NOT EXISTS news (id INTEGER PRIMARY KEY AUTOINCREMENT, diary TEXT, title TEXT, link TEXT, author TEXT, date TEXT, category_id TEXT, category_alias TEXT, resume TEXT, content TEXT, images TEXT, tags TEXT, showed NUMERIC, reviewed NUMERIC, created NUMERIC)");
		
		// TODO: Esto va en una funcion
		//var url = "http://www.wlacruz.com.ve/p/news_api/news/getByKeywords";
		//var news = [];
		//$.ajax({
		//	url: url,
		//	dataType: 'jsonp',
		//	timeout: 5000,
		//	jsonpCallback: "callback",
		//	async: false,
		//	headers: {"Content-type":"text/javascript"},
		//	success: function (data, status) {
		//		$(data).each(function (i, item) {
		//			news[i] = item;
		//		})
		//	}
		//}).done(function () {
		//	$(news).each(function (i, item) {
		//		app.db.transaction(function (ctx) {
		//			ctx.executeSql("SELECT * FROM news WHERE id = ?", [item.News.id], function (tx, results) {
		//				if (results.rows.length < 1) {
		//					console.log("Guardando " + item.News.id);
		//					tx.executeSql("INSERT INTO news (id, title, link, resume) VALUES (?,?,?,?)", [item.News.id, item.News.title, item.News.link, item.News.resume], null, app.onErrorDB);
		//				} else {
		//					console.log(item.News.id + " Ya existe");
		//				}
		//			})
		//			//ctx.executeSql("INSERT INTO news (id, title, link, resume) VALUES (?,?,?,?)", [item.News.id, item.News.title, item.News.link, item.News.resume], null, app.onErrorDB);
		//		});
		//	})
		//});
	},
	
	// MEtodo de conexion a la base de datos
	doConnect: function (db_name, db_version, db_display_name, db_size) {
		app.db = window.openDatabase(db_name, db_version, db_display_name, db_size);
		app.db.transaction(app.populateDB, app.onErrorDB);
	},
};
