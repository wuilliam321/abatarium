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
			app.doCheckSession();

			// Iniciando sliders
			app.doStartSliders();
			$("#todas").live('pagebeforeshow', function(event) {
				app.getLatestNews("#all-news");
			});
			$("#personalizadas").live('pagebeforeshow', function(event) {
				app.getLatestNewsByKW("#custom-news");
			});
			$("a.open-new").live("click", function () {
				app.showNew($(this).attr("alt"))
			})
			
			// Fix de los mensajes de alert
			window.alert = navigator.notification.alert;
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
			app.loadProfile();
		});
		$("#clave").live('pageshow', function(event) {
			app.loadProfile();
		});
		$("#ayuda").live('pageshow', function(event) {
			$('#ayuda .flexslider').flexslider(flexopts);
		});
		$("#acerca").live('pageshow', function(event) {
			$('#acerca .flexslider').flexslider(flexopts);
		});
		$("#configurar").live('pageshow', function(event) {
			$('#configurar .flexslider').flexslider(flexopts);
			app.loadRemoteKeywords();
			app.loadProfile();
			app.loadLocalKeywords();
			app.loadSettings();
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
						password = md5(inputs[1].value);

						// Haciendo el Login
						app.doLogin(username, password);
					}
				},
				messages : {
					"data[User][email]" : {
						required : 'Usuario requerido',
						email : "Debe ser un correo electrónico"
					},
					"data[User][password]" : {
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
						app.doRecoverPassword(inputs);
					}
				},
				messages : {
					"data[User][email]" : {
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
						inputs = $("#frm-perfil").serializeArray();

						// Guardando Perfil
						app.doSaveProfile(inputs);
					}
				},
				messages : {
					"data[User][email]" : {
						required : 'Email es un campo requerido',
						email : "Debe ser un correo electrónico"
					}
				}
			});

			// Formulario cambio de clave
			$("#frm-clave").validate({
				submitHandler : function(e) {
					// Si el form es valido
					if ($("#frm-clave").valid()) {
						// Capturando la data
						inputs = $("#frm-clave").serializeArray();
						// Serializando
						inputs[1].value = md5(inputs[1].value);
						inputs[2].value = md5(inputs[2].value);
						inputs[3].value = md5(inputs[3].value);

						// Guardando Perfil
						app.doChangePassword(inputs);
					}
				},
				rules: {
					"data[User][password_confirm]": {
						equalTo: "#frm-clave #UserPasswordNew"
					}
				},
				messages : {
					"data[User][password_new]" : {
						required : 'Clave es un campo requerido'
					},
					"data[User][password_old]" : {
						required : 'Clave anterior es un campo requerido'
					},
					"data[User][password_confirm]" : {
						required : 'Confirmar clave es un campo requerido',
						equalTo: "Clave no coincide"
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
						
						// Guardando configuraciones
						app.doSaveSettings(inputs);
					}
				},
				messages : {
					"data[Setting][showed_news]" : {
						required : 'Campo requerido',
						numeric : "Debe ser entero"
					}
				},
				ignore: ".ignore"
			});

			// Formulario para salir del sistema
			$("#frm-salir").validate({
				submitHandler : function(e) {
					app.doExit();
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
			var data = md5(username + password);
			var url = "http://www.wlacruz.com.ve/p/news_api/users/login";
			//var url = "http://news/api/users/login";
			$.ajax({
				url: url,
				data: {"data[User][email]": username, q: data},
				dataType: 'jsonp',
				jsonpCallback: "callback",
				success: function(data) {
					app.db.transaction(function (ctx) {
						ctx.executeSql("DELETE FROM sessions");
						ctx.executeSql("SELECT * FROM users WHERE id = ?", [data.item.User.id], function (tx, results) {
							if (results.rows.length < 1) {
								console.log("Registering user");
								tx.executeSql("INSERT INTO users (id, email, password, is_new, name, lastname, latitude, longitude, location, website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [data.item.User.id, data.item.User.email, data.item.User.password, data.item.User.is_new, data.item.User.name, data.item.User.lastname, data.item.User.latitude, data.item.User.longitude, data.item.User.location, data.item.User.website], function() {console.log("insertando usuario")}, function () {console.log("error insertando usuario")});
							} else {
								console.log("Updating user");
								tx.executeSql("UPDATE users SET id = ?, email = ?, password = ?, is_new = ?, name = ?, lastname = ?, latitude = ?, longitude = ?, location = ?, website = ? WHERE id = ?", [data.item.User.id, data.item.User.email, data.item.User.password, data.item.User.is_new, data.item.User.name, data.item.User.lastname, data.item.User.latitude, data.item.User.longitude, data.item.User.location, data.item.User.website, data.item.User.id], function() {console.log("actualizando usuario")}, function () {console.log("error actualizando usuario")});
							}
							tx.executeSql("INSERT INTO sessions (user_id) VALUES (?)", [data.item.User.id], function() {console.log("creating session")}, function () {console.log("error creating session")});
							for (i = 0; i < data.item.Setting.length; i++) {
								tx.executeSql("INSERT INTO settings (id, name, value, extra, user_id) VALUES (?,?,?,?,?)", [data.item.Setting[i].id, data.item.Setting[i].name, data.item.Setting[i].value, data.item.Setting[i].extra, data.item.Setting[i].user_id], function() {console.log("insertando conf")}, function () {console.log("error insertando conf")});
							}
							for (i = 0; i < data.item.Keyword.length; i++) {
								tx.executeSql("INSERT INTO keywords (id, name) VALUES (?,?)", [data.item.Keyword[i].id, data.item.Keyword[i].name], function() {console.log("insertando keywords")}, function () {console.log("error insertando keywords")});
								tx.executeSql("INSERT INTO users_keywords (id, user_id, keyword_id) VALUES (?,?,?)", [data.item.Keyword[i].UsersKeyword.id, data.item.Keyword[i].UsersKeyword.user_id, data.item.Keyword[i].UsersKeyword.keyword_id], function() {console.log("insertando user keywords")}, function () {console.log("error insertando keywords")});
							}
						}, function () {console.log("Error seleccionando usuarios")})
					});
				}
			}).done(function (data) {
				switch (data.code) {
					case 0:
						navigator.notification.alert("Usuario o clave incorrectas", null, "Error!", "Continuar");
						break;
					case 2:
						navigator.notification.alert("Usuario no existe", null, "Error", "Continuar");
						break;
					case 1:
						$.mobile.changePage("index.html#principal");
						break;
				}
			}).error (function () {
				navigator.notification.alert("Ocurrio algun problema inesperado, intente nuevamente", null, "Alerta", "Continuar");
			});
		})
	},
	
	// Formulario para salir
	doExit: function () {
		app.db.transaction(function (ctx) {
			ctx.executeSql("DELETE FROM sessions");
		});
		$.mobile.changePage("index.html");
	},
	
	// Chequea la sesion
	doCheckSession: function () {
		app.db.transaction(function (ctx) {
			ctx.executeSql("SELECT id, user_id FROM sessions ORDER BY id DESC LIMIT 1", [], function (tx, results) {
				if (results.rows.length > 0) {
					$.mobile.changePage("index.html#principal");
				}
			}, app.onErrorDB)
		});
	},

	// Guardando perfil
	doSaveProfile : function(user) {
		$(function() {
			var url = "http://www.wlacruz.com.ve/p/news_api/users/update";
			//var url = "http://news/api/users/update";
			$.ajax({
				url: url,
				data: user,
				dataType: 'jsonp',
				jsonpCallback: "callback",
			}).done(function (data) {
				switch (data.code) {
					case 0:
						navigator.notification.alert("Usuario no pudo ser actualizado, intente de nuevo", null, "Error!", "Continuar");
						break;
					case 1:
						navigator.notification.alert("Usuario actualizado con exito", null, "Éxito", "Continuar");
						app.db.transaction(function (tx) {
							tx.executeSql("UPDATE users SET id = ?, email = ?, password = ?, is_new = ?, name = ?, lastname = ?, latitude = ?, longitude = ?, location = ?, website = ? WHERE id = ?", [data.item.User.id, data.item.User.email, data.item.User.password, data.item.User.is_new, data.item.User.name, data.item.User.lastname, data.item.User.latitude, data.item.User.longitude, data.item.User.location, data.item.User.website, data.item.User.id], function() {console.log("actualizando usuario")}, function () {console.log("error actualizando usuario")});
						})
						break;
					case 2:
						navigator.notification.alert("Ocurrio algun problema, intente nuevamente", null, "Alerta", "Continuar");
						break;
				}
			}).error (function () {
				navigator.notification.alert("Ocurrio algun problema inesperado, intente nuevamente", null, "Alerta", "Continuar");
			});
		})
	},
	
	
	// Cambiar la clave
	doChangePassword: function (user) {
		$(function() {
			var url = "http://www.wlacruz.com.ve/p/news_api/users/password";
			//var url = "http://news/api/users/password";
			$.ajax({
				url: url,
				data: user,
				dataType: 'jsonp',
				jsonpCallback: "callback",
			}).done(function (data) {
				switch (data.code) {
					case 0:
						navigator.notification.alert("Claves no coinciden, intente de nuevo", null, "Error!", "Continuar");
						break;
					case 1:
						navigator.notification.alert("Clave actualizada con exito", null, "Éxito", "Continuar");
						app.db.transaction(function (tx) {
							tx.executeSql("UPDATE users SET password = ? WHERE id = ?", [data.item.User.password, data.item.User.id], function() {console.log("actualizando clave")}, function () {console.log("error actualizando clave")});
						})
						$.mobile.changePage("index.html#perfil");
						break;
					case 2:
						navigator.notification.alert("Ocurrio algun problema, intente nuevamente", null, "Alerta", "Continuar");
						break;
				}
			}).error (function () {
				navigator.notification.alert("Ocurrio algun problema inesperado, intente nuevamente", null, "Alerta", "Continuar");
			});
		})
	},
	
	// Carga el perfil
	loadProfile: function () {
		app.db.transaction(function (ctx) {
			ctx.executeSql("SELECT u.* FROM users as u JOIN sessions as s on s.user_id = u.id LIMIT 1", [], function (tx, results) {
				if (results.rows.length > 0) {
					var user = results.rows.item(0);
					$("#frm-perfil #UserId, #frm-clave #UserId, #frm-configurar #UserId").val(user.id);
					$("#frm-perfil #UserEmail").val(user.email);
					$("#frm-perfil #UserName").val(user.name);
					$("#frm-perfil #UserLastname").val(user.lastname);
					$("#frm-perfil #UserLocation").val(user.location);
					$("#frm-perfil #UserWebsite").val(user.website);
				}
			})
		});
	},

	// Guardando configuraciones
	doSaveSettings : function(setting) {
		$(function() {
			var url = "http://www.wlacruz.com.ve/p/news_api/settings/save";
			//var url = "http://news/api/settings/save";
			$.ajax({
				url: url,
				data: setting,
				dataType: 'jsonp',
				jsonpCallback: "callback",
			}).done(function (data) {
				switch (data.code) {
					case 0:
						navigator.notification.alert("La configuración no pudo ser guardada, intente de nuevo", null, "Error!", "Continuar");
						break;
					case 1:
						navigator.notification.alert("Configuración actualizada con exito", null, "Éxito", "Continuar");
						app.db.transaction(function (tx) {
							tx.executeSql("SELECT st.* FROM settings as st join users as u on u.id = st.user_id", [], function (ctx, results) {
								if (results.rows.length > 0) {
									tx.executeSql("UPDATE settings SET value = ? WHERE id = ?", [data.item.Setting.value, data.item.Setting.id], function() {console.log("actualizando configuraciones")}, function () {console.log("error actualizando configuraciones")});
								} else {
									tx.executeSql("INSERT INTO settings (id, name, value,user_id) values (?, showed_news, ?, ?)", [data.item.Setting.id, data.item.Setting.value, data.item.Setting.user_id], function() {console.log("guardando configuraciones")}, function () {console.log("error guardando configuraciones")});
								}
							});
						})
						$.mobile.changePage("index.html#principal");
						break;
					case 2:
						navigator.notification.alert("Ocurrio algun problema, intente nuevamente", null, "Alerta", "Continuar");
						break;
				}
			}).error (function () {
				navigator.notification.alert("Ocurrio algun problema inesperado, intente nuevamente", null, "Alerta", "Continuar");
			});
		})
	},
	
	
	// Carga los keywords
	loadLocalKeywords: function () {
		$("#keywords-container").empty();
		app.db.transaction(function (ctx) {
			ctx.executeSql("select s.user_id, k.* from keywords as k join users_keywords as uk on uk.keyword_id = k.id join users as u on u.id = uk.user_id JOIN sessions as s on s.user_id = u.id", [], function (tx, results) {
				input = '<label>Mis Palabras Claves:</label><input type="hidden" name="data[Keyword][Keyword]" value="" id="KeywordKeyword">';
				$("#keywords-container").append(input)
				for (i = 0; i < results.rows.length; i++) {
					checkbox = '<input type="checkbox" name="data[Keyword][Keyword][]" id="KeywordKeyword'+i+'" checked="checked" value="'+results.rows.item(i).id+'"onclick="app.removeKeyword(\''+results.rows.item(i).id+'\', \''+results.rows.item(i).user_id+'\')"><label for="KeywordKeyword'+i+'">'+results.rows.item(i).name+'</label>';
					$("#keywords-container").append(checkbox);
				}
				$("#keywords-container").parent().trigger("create")
			})
		});
	},
	
	// Cargando keywords remotas
	loadRemoteKeywords: function () {
		$(function() {
			$( "#autocomplete" ).on( "listviewbeforefilter", function ( e, data ) {
				var $ul = $( this ),
					$input = $( data.input ),
					value = $input.val(),
					html = "";
				$ul.html( "" );
				if ( value && value.length > 1 ) {
					$ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
					$ul.listview( "refresh" );
					
					var url = "http://www.wlacruz.com.ve/p/news_api/keywords/autocomplete";
					//var url = "http://news/api/keywords/autocomplete";
					$.ajax({
						url: url,
						dataType: "jsonp",
						jsonpCallback: "callback",
						crossDomain: true,
						data: {
							q: $input.val()
						}
					})
					.then( function ( response ) {
						$.each( response, function ( i, val ) {
							html += '<li><a alt="'+i+'" onclick="app.addKeyword(\''+i+'\', \''+val+'\')">' + val + '</a></li>';
						});
						$ul.html( html );
						$ul.listview( "refresh" );
						$ul.trigger( "updatelayout");
					});
				}
			});
		});
	},
	
	// Agregar palabra clave
	addKeyword: function (id, name) {
		app.db.transaction(function (ctx) {
			ctx.executeSql("SELECT * FROM keywords WHERE id = ?", [id], function (tx, results) {
				if (results.rows.length < 1) {
					tx.executeSql("INSERT INTO keywords (id, name) VALUES (?, ?)", [id, name], function () { console.log("agregando keywords") }, function () { console.log("error agregando keywords") })
				}
			}, function () { console.log("error seleccionando keyword"); })
			ctx.executeSql("SELECT id, user_id FROM sessions ORDER BY id DESC LIMIT 1", [], function (tx, results) {
				user_id = results.rows.item(0).user_id;
				tx.executeSql("SELECT * FROM users_keywords WHERE user_id = ? AND keyword_id = ?", [user_id, id], function (tx, results) {
					if (results.rows.length < 1) {
						tx.executeSql("INSERT INTO users_keywords (user_id, keyword_id) VALUES (?, ?)", [user_id, id], function () { console.log("agregando user keywords") }, function () { console.log("error agregando user keywords") })
					}
				}, function () { console.log("error seleccionando user keywords") })
			})
		});
		$( "#autocomplete" ).find("li a[alt="+id+"]").parents("li").remove();
		$( "#autocomplete" ).listview( "refresh" );
		app.loadLocalKeywords();
	},
	
	// Remove keyword
	removeKeyword: function (id, user_id) {
		app.db.transaction(function (ctx) {
			ctx.executeSql("DELETE FROM users_keywords WHERE keyword_id = ? AND user_id = ?", [id, user_id], function () { console.log("eliminando users keywords") }, function () { console.log("error eliminando users keywords") });
		})
		app.loadLocalKeywords();
	},
	
	// Cargando la configuracion
	loadSettings: function () {
		app.db.transaction(function (ctx) {
			ctx.executeSql("select st.* from settings as st join users as u on u.id = st.user_id JOIN sessions as s on s.user_id = u.id LIMIT 1", [], function (tx, results) {
				if (results.rows.length > 0) {
					showed_news = results.rows.item(0);
					$("#SettingShowedNews").val(showed_news.value).trigger("change");
				}
			})
		});
		
	},

	// Guardando nuevo usuario
	doCreateUser : function(user) {
		$(function() {
			var url = "http://www.wlacruz.com.ve/p/news_api/users/create";
			//var url = "http://news/api/users/create";
			$.ajax({
				url: url,
				data: user,
				dataType: 'jsonp',
				jsonpCallback: "callback",
			}).done(function (data) {
				switch (data.code) {
					case 0:
						navigator.notification.alert("Usuario no pudo ser creado, intente de nuevo", null, "Error!", "Continuar");
						break;
					case 1:
						navigator.notification.alert("Usuario creado con exito, enviamos su clave al correo", null, "Éxito", "Continuar");
						$.mobile.changePage("index.html");
						break;
					case 2:
						navigator.notification.alert("Ocurrio algun problema, intente nuevamente", null, "Alerta", "Continuar");
						break;
					case 3:
						navigator.notification.alert("Usuario ya existe", null, "Alerta", "Continuar");
						break;
				}
			}).error (function () {
				navigator.notification.alert("Ocurrio algun problema inesperado, intente nuevamente", null, "Alerta", "Continuar");
			});
		})
	},

	// Recuperando clave
	doRecoverPassword : function(user) {
		$(function() {
			var url = "http://www.wlacruz.com.ve/p/news_api/users/recovery";
			//var url = "http://news/api/users/recovery";
			$.ajax({
				url: url,
				data: user,
				dataType: 'jsonp',
				jsonpCallback: "callback",
			}).done(function (data) {
				switch (data.code) {
					case 0:
						navigator.notification.alert("No se pudo recuperar la clave, intente de nuevo", null, "Error!", "Continuar");
						break;
					case 1:
						navigator.notification.alert("Clave reseteada, la enviamos a su correo", null, "Éxito", "Continuar");
						$.mobile.changePage("index.html");
						break;
					case 2:
						navigator.notification.alert("Ocurrio algun problema, intente nuevamente", null, "Alerta", "Continuar");
						break;
				}
			}).error (function () {
				navigator.notification.alert("Ocurrio algun problema inesperado, intente nuevamente", null, "Alerta", "Continuar");
			});
		})
	},
	
	// Obteniendo las ultimas noticias
	getLatestNews : function (news_container) {
		$(news_container).empty();
		params = '';
		if (navigator.connection.type == Connection.NONE) {
			app.getLocalNews(news_container, params);
		} else {
			app.getNews(news_container, params);
		}
	},
	
	
	// Obteniendo las noticias locales
	getLocalNews: function (news_container, params) {
		console.log("Loading local custom news...");
		app.db.transaction(function (ctx) {
			ctx.executeSql("select st.* from settings as st join users as u on u.id = st.user_id JOIN sessions as s on s.user_id = u.id LIMIT 1", [], function (tx, results) {
				if (results.rows.length > 0) {
					showed_news = results.rows.item(0).value;
				}
				where = '';
				aux = new Array();
				for (i = 0; i < params.length; i++) {
					aux.push("tags LIKE '%" + params[i] + "%'");
					aux.push("content LIKE '%" + params[i] + "%'");
					aux.push("title LIKE '%" + params[i] + "%'");
					aux.push("resume LIKE '%" + params[i] + "%'");
					aux.push("category_alias LIKE '%" + params[i] + "%'");
					aux.push("link LIKE '%" + params[i] + "%'");
					aux.push("author LIKE '%" + params[i] + "%'");
				}
				if (aux.length > 0) {
					where = " WHERE " + aux.join(" OR ");
				}
				tx.executeSql("SELECT id, title, link, resume FROM news " + where + " ORDER BY id DESC LIMIT ?", [showed_news], function (tx, results) {
					if (results.rows.length > 0) {
						for(i=0; i < results.rows.length; i++) {
							container = $("<li>").addClass("ui-btn-icon-right ui-li-has-arrow ui-li ui-li-static ui-body-c");
							button = $("<div>").addClass("ui-btn-inner ui-li ui-li-static ui-body-c").attr("aria-hidden", true);
							left = $("<div>").addClass("ui-btn-text");
							arrow = $("<span>").addClass("ui-icon ui-icon-arrow-r ui-icon-shadow");
							link = $("<a>").attr("href", "#ver-noticia").addClass("ui-link-inherit open-new").attr({"data-ajax": "false", "alt": results.rows.item(i).id});
							title = $("<h3>").text(results.rows.item(i).title).addClass("ui-li-heading");
							resume = $("<p>").text($(results.rows.item(i).resume).text()).addClass("ui-li-desc");
							
							$(link).append(title)
							$(link).append(resume)
							$(left).append(link)
							$(button).append(left);
							$(button).append(arrow);
							$(container).append(button);
							$(news_container).append(container);
						}
					}
				}, function () {console.log("Error loading local news"); });
			})
		});
	},
	
	// Obteniendo las ultimas noticias por keywords
	getLatestNewsByKW: function (news_container) {
		$(news_container).empty();
		app.db.transaction(function (ctx) {
			var kws = new Array();
			ctx.executeSql("select s.user_id, k.* from keywords as k join users_keywords as uk on uk.keyword_id = k.id join users as u on u.id = uk.user_id JOIN sessions as s on s.user_id = u.id", [], function (tx, results) {
				for(i=0; i < results.rows.length; i++) {
					kws.push(results.rows.item(i).name);
				}
				
				if (navigator.connection.type == Connection.NONE) {
					app.getLocalNews(news_container, kws);
				} else {
					app.getNews(news_container, "/" + kws.join('/'));
				}
			})
		});
	},
	
	// Obtenido las noticias
	getNews: function (news_container, params) {
		app.db.transaction(function (ctx) {
			ctx.executeSql("select st.* from settings as st join users as u on u.id = st.user_id JOIN sessions as s on s.user_id = u.id LIMIT 1", [], function (tx, results) {
				if (results.rows.length > 0) {
					showed_news = results.rows.item(0).value;
				}
				$(news_container).empty();
				var url = "http://www.wlacruz.com.ve/p/news_api/news/getByKeywords" + params;
				//var url = "http://news/api/news/getByKeywords" + params;
				$.ajax({
					url: url,
					dataType: 'jsonp',
					data: {showed_news: showed_news},
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
							
							app.db.transaction(function (ctx) {
								ctx.executeSql("SELECT * FROM news WHERE id = ?", [item.News.id], function (tx, results) {
									if (results.rows.length < 1) {
										console.log("Guardando " + item.News.id);
										tx.executeSql("INSERT INTO news (id, title, link, resume, content, tags, category_alias, author) VALUES (?,?,?,?,?,?,?,?)", [item.News.id, item.News.title, item.News.link, item.News.resume, item.News.content, item.News.tags, item.News.category_alias, item.News.author], null, app.onErrorDB);
									} else {
										console.log(item.News.id + " Ya existe");
									}
								});
							});
						})
					}
				});
			})
		});
	},
	
	// Funcion para mostrar la noticia especifica
	showNew: function (params) {
		if (navigator.connection.type == Connection.NONE) {
			app.getLocalNew(params);
		} else {
			app.getNew(params)
		}
	},
	
	// Obteniendo la noticia segun id localmente
	getLocalNew: function (params) {
		console.log("Loading local new id = " + params);
		app.db.transaction(function (ctx) {
			ctx.executeSql("SELECT title, content FROM news WHERE id = ?", [params], function (tx, results) {
				if (results.rows.length > 0) {
					$("#new-title").html(results.rows.item(0).title)
					$("#new-content").html(results.rows.item(0).content)
				}
			}, function () {console.log("Error loading local new"); });
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
		console.log(error);
	},
	populateDB: function (tx) {
		tx.executeSql("CREATE TABLE IF NOT EXISTS news (id INTEGER PRIMARY KEY AUTOINCREMENT, diary TEXT, title TEXT, link TEXT, author TEXT, date TEXT, category_id TEXT, category_alias TEXT, resume TEXT, content TEXT, images TEXT, tags TEXT, showed NUMERIC, reviewed NUMERIC, created NUMERIC)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT, is_new NUMERIC, name TEXT, lastname TEXT, latitude TEXT, longitude TEXT, location TEXT, website TEXT)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER UNIQUE, last_access TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, value TEXT, extra TEXT, user_id INTEGER)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS keywords (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS users_keywords (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, keyword_id INTEGER)");
	},
	
	// MEtodo de conexion a la base de datos
	doConnect: function (db_name, db_version, db_display_name, db_size) {
		app.db = window.openDatabase(db_name, db_version, db_display_name, db_size);
		app.db.transaction(app.populateDB, app.onErrorDB);
	},
};
