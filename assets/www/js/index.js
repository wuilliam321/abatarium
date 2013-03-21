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
			// app.doConnect(params);

			// Checkear sesion
			// app.doCheckSession();

			// Iniciando sliders
			app.doStartSliders();
			$("#todas").live('pagebeforeshow', function(event) {
				app.getLatestNews();
			});
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
						app.doCreateUser();
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
						inputs = $("#frm-configurar").serializeArray()

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
	doCreateUser : function() {
		$(function() {
			// console.log("Creando el usuario");
		})
	},

	// Recuperando clave
	doRecoverPassword : function() {
		$(function() {
			// console.log("Recuperando clave");
		})
	},
	
	// Obteniendo las ultimas noticias
	getLatestNews : function () {
		$("#all-news").empty();
		var url = "http://news/api/news/getByKeywords";
		$.ajax({
			url: url,
			dataType: 'jsonp',
			timeout: 5000,
			jsonpCallback: "callback",
			success: function (data, status) {
				$(data).each(function (i, item) {
					console.log(i);
					container = $("<li>").addClass("ui-btn-icon-right ui-li-has-arrow ui-li ui-li-static ui-body-c");
					button = $("<div>").addClass("ui-btn-inner ui-li ui-li-static ui-body-c").attr("aria-hidden", true);
					left = $("<div>").addClass("ui-btn-text");
					arrow = $("<span>").addClass("ui-icon ui-icon-arrow-r ui-icon-shadow");
					link = $("<a>").attr("href", item.News.link).addClass("ui-link-inherit");
					title = $("<h3>").text(item.News.title).addClass("ui-li-heading");
					resume = $("<p>").text($(item.News.resume).text()).addClass("ui-li-desc");
					
					$(link).append(title)
					$(link).append(resume)
					$(left).append(link)
					$(button).append(left);
					$(button).append(arrow);
					$(container).append(button);
					$("#all-news").append(container);
						/** <li data-role="list-divider">Monday, August 4, 2012 <span
							class="ui-li-count">2</span>
						</li>

						<li class="ui-btn-icon-right ui-li-has-arrow"> container
							<div class="ui-btn-inner ui-li" aria-hidden="true"> button
								<div class="ui-btn-text"> left
									<a class="ui-link-inherit" href="#demo-page">

										<p class="ui-li-aside ui-li-desc">
											<strong>2:00</strong> PM
										</p> <img class="ui-li-thumb" src="images/demo/thumbs/thumb1.jpg">
										<h3 class="ui-li-heading">jQuery Meetup</h3>
										<p class="ui-li-desc">
											<strong>First of many events taking place in Boston,
												MA</strong>
										</p>
										<p class="ui-li-desc">Mark your calendar, this is going to
											be great!</p>
									</a>
								</div>
								<span class="ui-icon ui-icon-arrow-r ui-icon-shadow"></span> arrow
							</div>
						</li>
						
						
						
						**/
				})
			}
		});
	}
};
