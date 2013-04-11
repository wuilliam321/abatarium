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
	// Objeto de conexion a la base de datos
	db: null,
	
	// Url de api del servidor
	base_url: 'http://www.wlacruz.com.ve/p/news_api',
	
	// Url del api del servidor LOCAL
	//base_url: 'http://news/api',
	
	// Constructor principal
	initialize : function() {
		this.bindEvents();
	},
	
	// Determinando los eventos a realizar
	bindEvents : function() {
		// Activp cuando estare en el Telefono
		document.addEventListener('deviceready', this.onDeviceReady, false);

		// Activo cuando esta en TESTPC
		//this.onDeviceReady();
	},
	
	// Eventos cuando el dispositivo esta listo
	onDeviceReady : function() {
		// Eventos Principales
		app.mainEvent();
		
		// Validaciones generales y formularios
		app.validationsEvent();
	},
	
	// Eventos principales, conexion, sessiones, operaciones, fixes
	mainEvent : function() {
		// Quitando las animaciones entre paginas
		$(document).bind('pageinit', function () {
			$.mobile.defaultPageTransition = 'none';
		});
		
		// Funcion principal
		$(function() {
			// Conectar a la BD
			app.doConnect('newsdb', '1.0', 'News Database', 1000000);

			// Construyendo las operaciones principales
			app.doMainOperations();
			
			// Fix de los mensajes de alert
			window.alert = navigator.notification.alert;
			
			// Sincronizando
			app.doSync();
			
			// Intervalo de Sincronizacion
			setInterval(function () {
				app.doSync();
			}, 2*60*1000)
		})
	},

	// Realizando las operaciones basicas
	doMainOperations : function() {
		// Opciones del flexslide
		flexopts = {
			animation : "slide",
			controlsContainer : ".flex-container"
		};
		
		// Slider del main
		$("#main").live('pageshow', function(event) {
			$('#main .flexslider').flexslider(flexopts);
		});
		
		// Slider principal
		//$('#principal .flexslider').flexslider(flexopts);
		$("#principal").live('pageshow', function(event) {
			$('#principal .flexslider').flexslider(flexopts);
			// Checkear sesion
			app.doCheckSession();
			app.doSync();
			app.doCheckNewUser();
		});
		
		// Slider del perfil y carga del mismo
		$("#perfil").live('pageshow', function(event) {
			$('#perfil .flexslider').flexslider(flexopts);
			app.loadProfile();
		});
		
		// Cargando el perfil para cambio de clave
		$("#clave").live('pageshow', function(event) {
			// La clave solo se puede cambiar si se esta conectado
			if (navigator.connection.type == Connection.NONE) {
				navigator.notification.alert("Debe tener conexión para cambiar su clave", null, "Error!", "Continuar");
				$.mobile.changePage("index.html#perfil");
			} else {
				// Aqui se carga la data necesaria
				app.loadProfile();
			}
		});
		
		// Slider de la ayuda
		$("#ayuda").live('pageshow', function(event) {
			$('#ayuda .flexslider').flexslider(flexopts);
		});
		
		// Slider del acerca de
		$("#acerca").live('pageshow', function(event) {
			$('#acerca .flexslider').flexslider(flexopts);
		});
		
		// Slider del menu configurar y operaciones relacionadas
		$("#configurar").live('pageshow', function(event) {
			$('#configurar .flexslider').flexslider(flexopts);
			// Si no hay conexion, no hay opcion de agregar nuevas KW
			if (navigator.connection.type == Connection.NONE) {
				// Ocultando el autocomplete
				$("#autocomplete").prev().hide();
				$("#autocomplete").parent().hide();
			} else {
				// Cargando las KW remotas
				app.loadRemoteKeywords();
			}
			
			// Cargado el perfil
			app.loadProfile();
			
			// Cargando los KW locales
			app.loadLocalKeywords();
			
			// Cargando las otras configuraciones
			app.loadSettings();
		});
		
		// Slider de todas las noticias y carga de las mismas
		$("#todas").live('pageshow', function(event) {
			$('#todas .flexslider').flexslider(flexopts);
			app.getLocalNews("#all-news", '', "#todas #n-page");
			app.getNumberPages("#all-news", '', "#todas #n-pages");
		});
		
		// Slider de todas las noticias personalizadas y carga de las mismas
		$("#personalizadas").live('pageshow', function(event) {
			$('#personalizadas .flexslider').flexslider(flexopts);
			app.db.transaction(function (ctx) {
				// Variable para contener las palabras claves del usuario
				var kws = new Array();
				
				// Se buscan las palabras calves del usaurio activo
				ctx.executeSql("select s.user_id, k.* from keywords as k join users_keywords as uk on uk.keyword_id = k.id join users as u on u.id = uk.user_id JOIN sessions as s on s.user_id = u.id", [], function (tx, results) {
					for(i=0; i < results.rows.length; i++) {
						// Se ingresan las KW en el arreglo
						kws.push(results.rows.item(i).name);
					}
					
					// Localmente se requiere el arreglo solamente
					app.getLocalNews("#custom-news", kws, "#personalizadas #n-page");
					app.getNumberPages("#custom-news", kws, "#personalizadas #n-pages");
				})
			});
		});
		
		// Para cada noticia anterior, se abre con presionar
		// sobre el enlace de la lista
		$("a.open-new").live("click", function () {
			app.getLocalNew($(this).attr("alt"))
		})
		
		// Slider del Registro
		$("#registro").live('pageshow', function(event) {
			$('#registro .flexslider').flexslider(flexopts);
			// Usuarios solo pueden ser creados teniendo conexion
			if (navigator.connection.type == Connection.NONE) {
				navigator.notification.alert("Debe tener conexión para crear usuarios", null, "Error!", "Continuar");
				$.mobile.changePage("index.html#main");
			}
		});
		
		// Slider de recuperacion de clave
		$("#recuperar").live('pageshow', function(event) {
			$('#recuperar .flexslider').flexslider(flexopts);
			// Reinicio de clave solo si tiene conexion
			if (navigator.connection.type == Connection.NONE) {
				navigator.notification.alert("Debe tener conexión para reestablecer su clave", null, "Error!", "Continuar");
				$.mobile.changePage("index.html#main");
			}
		});
	},
	// Splash Screen
	doHideSplash: function () {
		$(function() {
			setTimeout(function () {
				$.mobile.changePage("#principal", "fade");
			}, 1500);
		});
	},
	
	// Reload page
	doReloadPage: function (url) {
		app.doSync(url);
	},
	
	// Sync
	doSync: function (url, page) {
		if (navigator.connection.type != Connection.NONE) {
			// Sincronizando las noticias personalizadas
			app.db.transaction(function (ctx) {
				// Variable para contener las palabras claves del usuario
				var kws = new Array();
				
				// Se buscan las palabras calves del usaurio activo
				ctx.executeSql("select s.user_id, k.* from keywords as k join users_keywords as uk on uk.keyword_id = k.id join users as u on u.id = uk.user_id JOIN sessions as s on s.user_id = u.id", [], function (tx, results) {
					if (results.rows.length > 0) {
						console.log("Syncing...");
						
						for(i=0; i < results.rows.length; i++) {
							// Se ingresan las KW en el arreglo
							kws.push(results.rows.item(i).name);
						}
						// Sincronizando todas las noticias
						app.getNews(false, '', url, page);
						
						// Fix para iniciar el ajax a tiempos diferentes
						setTimeout(function () {
							// Remotamente necesito construir un texto (CakePHP Route Valid)
							app.getNews(false, "/" + kws.join('/'), url, page);
						}, 200);
					}
				})
			});
		}
	},
	
	// Validacion de formularios
	// submitHandles se llama al enviar el formulario
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
						
						// Encriptando la clave
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
						// Serializando clave anterior
						inputs[1].value = md5(inputs[1].value);
						
						// Serializando clave nueva
						inputs[2].value = md5(inputs[2].value);
						
						// Serializando clave confirmacion
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
					// Cerrando sesion
					app.doExit();
				}
			});
		})
	},

	//
	// Funciones varias de la aplicacion
	//

	// Inicio de sesion
	doLogin : function(username, password) {
		// Si no hay conexion, se comprueba la data local y si el usuario
		// Se encuentra registrado, se hace la validacion.
		// De lo contrario se hace el login de forma regular
		if (navigator.connection.type == Connection.NONE) {
			app.db.transaction(function (ctx) {
				// Borramos las sessiones por seguridad
				ctx.executeSql("DELETE FROM sessions");
				
				// Comprobando que el usuario y la clave existen localmente
				ctx.executeSql("SELECT * FROM users WHERE email = ? AND password = ? LIMIT 1", [username, password], function (tx, results) {
					// SI existe se inicia la sesion de lo contrario se informa el error
					if (results.rows.length > 0) {
						console.log("Local login");
						tx.executeSql("INSERT INTO sessions (user_id) VALUES (?)", [results.rows.item(0).id], function() {console.log("creating local session")}, function () {console.log("error creating local session")});
						$.mobile.changePage("index.html#principal");
					} else {
						navigator.notification.alert("Usuario o clave incorrectas", null, "Error!", "Continuar");
					}
				}, function () {console.log("Error seleccionando usuarios")})
			});
		} else {
			$(function() {
				// Construyendo un arreglo de seguridad
				var data = md5(username + password);
				var url = app.base_url + "/users/login";
				$.ajax({
					beforeSend: function() { $.mobile.showPageLoadingMsg(); },
					complete: function() { $.mobile.hidePageLoadingMsg(); },
					url: url,
					data: {"data[User][email]": username, q: data},
					dataType: 'jsonp',
					jsonpCallback: "callback",
					success: function(data) {
						app.db.transaction(function (ctx) {
							// Borrando la sesion por seguridad
							ctx.executeSql("DELETE FROM sessions");
							ctx.executeSql("SELECT * FROM users WHERE id = ?", [data.item.User.id], function (tx, results) {
								// Si el usuario no esta registrado localmente se guarda, de lo contrario se actualiza
								if (results.rows.length < 1) {
									console.log("Creating local user");
									tx.executeSql("INSERT INTO users (id, email, password, is_new, name, lastname, latitude, longitude, location, website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [data.item.User.id, data.item.User.email, data.item.User.password, data.item.User.is_new, data.item.User.name, data.item.User.lastname, data.item.User.latitude, data.item.User.longitude, data.item.User.location, data.item.User.website], function() {console.log("insertando usuario")}, function () {console.log("error insertando usuario")});
								} else {
									console.log("Updating user");
									tx.executeSql("UPDATE users SET id = ?, email = ?, password = ?, is_new = ?, name = ?, lastname = ?, latitude = ?, longitude = ?, location = ?, website = ? WHERE id = ?", [data.item.User.id, data.item.User.email, data.item.User.password, data.item.User.is_new, data.item.User.name, data.item.User.lastname, data.item.User.latitude, data.item.User.longitude, data.item.User.location, data.item.User.website, data.item.User.id], function() {console.log("actualizando usuario")}, function () {console.log("error actualizando usuario")});
								}
								
								// Se inicia la sesion
								tx.executeSql("INSERT INTO sessions (user_id) VALUES (?)", [data.item.User.id], function() {console.log("creating session")}, function () {console.log("error creating session")});
								
								// Si el usuario tiene configuraciones se almacenan
								for (i = 0; i < data.item.Setting.length; i++) {
									tx.executeSql("INSERT INTO settings (id, name, value, extra, user_id) VALUES (?,?,?,?,?)", [data.item.Setting[i].id, data.item.Setting[i].name, data.item.Setting[i].value, data.item.Setting[i].extra, data.item.Setting[i].user_id], function() {console.log("insertando conf")}, function () {console.log("error insertando conf")});
								}
								
								// Si tiene palabras claves se almacenan
								for (i = 0; i < data.item.Keyword.length; i++) {
									tx.executeSql("INSERT INTO keywords (id, name) VALUES (?,?)", [data.item.Keyword[i].id, data.item.Keyword[i].name], function() {console.log("insertando keywords")}, function () {console.log("error insertando keywords")});
									tx.executeSql("INSERT INTO users_keywords (id, user_id, keyword_id) VALUES (?,?,?)", [data.item.Keyword[i].UsersKeyword.id, data.item.Keyword[i].UsersKeyword.user_id, data.item.Keyword[i].UsersKeyword.keyword_id], function() {console.log("insertando user keywords")}, function () {console.log("error insertando keywords")});
								}
							}, function () {console.log("Error seleccionando usuarios")})
						});
					}
				}).done(function (data) {
					// Finalmente los mensajes de feedback
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
					// En caso de error
					navigator.notification.alert("Ocurrio algun problema inesperado, intente nuevamente", null, "Alerta", "Continuar");
				});
			});
		}
	},
	
	// Formulario para salir
	doExit: function () {
		// Salir del sistema es borrar la session
		app.db.transaction(function (ctx) {
			ctx.executeSql("DELETE FROM sessions");
		});
		$.mobile.changePage("index.html#main");
	},
	
	// Comprueba si el usuario esta logeado o no
	doCheckSession: function () {
		app.db.transaction(function (ctx) {
			// Se busca una session activa
			ctx.executeSql("SELECT id, user_id FROM sessions ORDER BY id DESC LIMIT 1", [], function (tx, results) {
				// Si hay sesion se redirecciona a principal
				if (results.rows.length > 0) {
					$.mobile.changePage("index.html#principal");
				} else {
					$.mobile.changePage("index.html#main");
				}
			}, app.onErrorDB)
		});
	},
	
	// Comprobando si es un usuario nuevo
	doCheckNewUser: function () {
		app.db.transaction(function (ctx) {
			// Se busca una session activa
			ctx.executeSql("SELECT u.is_new FROM sessions as s JOIN users as u ON u.id = s.user_id WHERE u.is_new = ? ORDER BY s.id DESC LIMIT 1", [1], function (tx, results) {
				// Si hay sesion se redirecciona a principal
				if (results.rows.length > 0) {
					$.mobile.changePage("index.html#configurar");
					navigator.notification.alert("Felicidades! Para empezar, configure Abatarium!", null, "Genial!", "Continuar");
				}
			}, app.onErrorDB)
		});
	},

	// Guardando perfil
	doSaveProfile : function(user) {
		console.log("Saving local profile");
		app.db.transaction(function (tx) {
			tx.executeSql("UPDATE users SET email = ?, name = ?, lastname = ?, latitude = ?, longitude = ?, location = ?, website = ? WHERE id = ?", [user[1].value, user[2].value, user[3].value, user[4].value, user[5].value, user[6].value, user[7].value, user[0].value], function() {
				navigator.notification.alert("Usuario actualizado con exito", null, "Éxito", "Continuar");
				$.mobile.changePage("index.html#principal");
			}, function () {
				navigator.notification.alert("Usuario no pudo ser actualizado, intente de nuevo", null, "Error!", "Continuar");
			});
		});
	},
	
	
	// Actualizar claves, solo si tiene conectividad
	doChangePassword: function (user) {
		$(function() {
			var url = app.base_url + "/users/password";
			$.ajax({
				beforeSend: function() { $.mobile.showPageLoadingMsg(); },
				complete: function() { $.mobile.hidePageLoadingMsg(); },
				url: url,
				data: user,
				dataType: 'jsonp',
				jsonpCallback: "callback"
			}).done(function (data) {
				// Mensajes de feedback
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
				// En caso de error
				navigator.notification.alert("Ocurrio algun problema inesperado, intente nuevamente", null, "Alerta", "Continuar");
			});
		})
	},
	
	// Carga los datos del perfil
	loadProfile: function () {
		// Iniciando la transaccion
		app.db.transaction(function (ctx) {
			// Seleccionando el usuario cuya sesion esta activa
			ctx.executeSql("SELECT u.* FROM users as u JOIN sessions as s on s.user_id = u.id LIMIT 1", [], function (tx, results) {
				// Si hay datos se cargan en el formulario correspondiente
				if (results.rows.length > 0) {
					var user = results.rows.item(0);
					// Se carga en los distintos formularios segun sea el caso
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
		console.log("Saving local settings");
		app.db.transaction(function (tx) {
			// Actualizando el valor donde el usuario sea el que esta conectado
			tx.executeSql("UPDATE settings SET value = ? WHERE user_id = ?", [setting[setting.length - 1].value, setting[0].value], function() {
				// Mensajes de feedback
				navigator.notification.alert("Configuración actualizada con exito", null, "Éxito", "Continuar");
				$.mobile.changePage("index.html#principal");
			}, function () {
				// En caso de error
				navigator.notification.alert("La configuración no pudo ser guardada, intente de nuevo", null, "Error!", "Continuar");
			});
			// Actualizando al usuario para que ya no sea un usuario nuevo
			tx.executeSql("UPDATE users SET is_new = ? WHERE id = ?", [0, setting[0].value], function() { console.log("Usuario no es nuevo ya") }, function () { console.log("No se pudo hacer viejo al usuario") });
		});
	},
	
	
	// Carga las palabras claves que hay localmente
	loadLocalKeywords: function () {
		// Limpiando el contenedor para evitar datos indeseados
		$("#keywords-container").empty();
		app.db.transaction(function (ctx) {
			// Buscando las KW del usuario en sesion
			ctx.executeSql("select s.user_id, k.* from keywords as k join users_keywords as uk on uk.keyword_id = k.id join users as u on u.id = uk.user_id JOIN sessions as s on s.user_id = u.id", [], function (tx, results) {
				// Texto de la cabecera del formulario
				input = '<label>Mis Palabras Claves:</label><p><small>Tocar para eliminar la palabra clave</small></p><input type="hidden" name="data[Keyword][Keyword]" value="" id="KeywordKeyword">';
				
				// Si no hay conexion, no se permite eliminarlos ni agregar nuevos
				disabled = '';
				if (navigator.connection.type == Connection.NONE) {
					disabled = 'disabled="disabled"';
					input += "<p><small>Para cambiar sus palabras claves debe habilitar la conectividad</small></p>";
				}
				$("#keywords-container").append(input);
				
				// Construyendo la lista de palabras claves del usuario
				for (i = 0; i < results.rows.length; i++) {
					checkbox = '<input type="checkbox" '+disabled+' name="data[Keyword][Keyword][]" id="KeywordKeyword'+i+'" checked="checked" value="'+results.rows.item(i).id+'"onclick="app.removeKeyword(\''+results.rows.item(i).id+'\', \''+results.rows.item(i).user_id+'\')"><label for="KeywordKeyword'+i+'">'+results.rows.item(i).name+'</label>';
					$("#keywords-container").append(checkbox);
				}
				
				// Actualizando la lista para que tome el estilo
				$("#keywords-container").parent().trigger("create")
			})
		});
	},
	
	// Cargando keywords remotas
	loadRemoteKeywords: function () {
		$(function() {
			// Autocompletado para agregar palabras claves
			$( "#autocomplete" ).on( "listviewbeforefilter", function ( e, data ) {
				// Capturando la data
				var $ul = $( this ),
					$input = $( data.input ),
					value = $input.val(),
					html = "";
				$ul.html( "" );
				// Si hay un valor agregado y tiene mas de 2 caracteres
				if ( value && value.length > 1 ) {
					// Actualizando la lista para mostrar el mensaje con el estilo
					$ul.listview( "refresh" );
					
					// Fuente de datos
					var url = app.base_url + "/keywords/autocomplete";
					$.ajax({
						beforeSend: function() { $.mobile.showPageLoadingMsg(); },
						complete: function() { $.mobile.hidePageLoadingMsg(); },
						url: url,
						dataType: "jsonp",
						jsonpCallback: "callback",
						crossDomain: true,
						data: {
							q: $input.val()
						}
					})
					.then( function ( response ) {
						// Construyendo la lista
						$.each( response, function ( i, val ) {
							html += '<li><a alt="'+i+'" onclick="app.addKeyword(\''+i+'\', \''+val+'\')">' + val + '</a></li>';
						});
						$ul.html( html );
						
						// Actualizando el listado del autocompletado
						$ul.listview( "refresh" );
						$ul.trigger( "updatelayout");
					});
				}
			});
		});
	},
	
	// Agrega palabras claves localmente para luego ser enviadas al servidor
	addKeyword: function (id, name) {
		app.db.transaction(function (ctx) {
			// Se determina si la palabra clave existe
			ctx.executeSql("SELECT * FROM keywords WHERE id = ?", [id], function (tx, results) {
				// Si no existe se crea
				if (results.rows.length < 1) {
					tx.executeSql("INSERT INTO keywords (id, name) VALUES (?, ?)", [id, name], function () { console.log("agregando keywords") }, function () { console.log("error agregando keywords") })
				}
			}, function () { console.log("error seleccionando keyword"); })
			
			// Se selecciona el usuario activo
			ctx.executeSql("SELECT id, user_id FROM sessions ORDER BY id DESC LIMIT 1", [], function (tx, results) {
				// Capturando el id del usuario
				user_id = results.rows.item(0).user_id;
				
				// Agregando la palabra clave del usuario indicado en la tabla correspondiente
				// Para crear la relacion de users <=> keywords
				tx.executeSql("SELECT * FROM users_keywords WHERE user_id = ? AND keyword_id = ?", [user_id, id], function (tx, results) {
					// Si no esta registrada la palabra clave se hace en este momento
					if (results.rows.length < 1) {
						tx.executeSql("INSERT INTO users_keywords (user_id, keyword_id) VALUES (?, ?)", [user_id, id], function () { console.log("agregando user keywords") }, function () { console.log("error agregando user keywords") })
					}
				}, function () { console.log("error seleccionando user keywords") })
			})
		});
		// Eliminando de la lista a la palabra clave agregada, es solo un truco visual
		// luego aparecera nuevamente
		$( "#autocomplete" ).find("li a[alt="+id+"]").parents("li").remove();
		$( "#autocomplete" ).listview( "refresh" );
		
		// Cargando ahora si las palabras claves, deben estan las nuevas
		app.loadLocalKeywords();
	},
	
	// Remove keyword
	removeKeyword: function (id, user_id) {
		app.db.transaction(function (ctx) {
			// Elimina una palabra clave dada, solo la relacion con el usuario, no la palabra en si
			ctx.executeSql("DELETE FROM users_keywords WHERE keyword_id = ? AND user_id = ?", [id, user_id], function () { console.log("eliminando users keywords") }, function () { console.log("error eliminando users keywords") });
		})
		
		// Actualizando la lista
		app.loadLocalKeywords();
	},
	
	// Cargando la configuracion
	loadSettings: function () {
		app.db.transaction(function (ctx) {
			// Carga las configuraciones del usuario activo
			ctx.executeSql("select st.* from settings as st join users as u on u.id = st.user_id JOIN sessions as s on s.user_id = u.id LIMIT 1", [], function (tx, results) {
				if (results.rows.length > 0) {
					// Capturando el valor del slider
					showed_news = results.rows.item(0);
					
					// Actualizando el slider
					$("#SettingShowedNews").val(showed_news.value).trigger("change");
				}
			})
		});
		
	},

	// Guardando nuevo usuario
	doCreateUser : function(user) {
		$(function() {
			var url = app.base_url + "/users/create";
			$.ajax({
				beforeSend: function() { $.mobile.showPageLoadingMsg(); },
				complete: function() { $.mobile.hidePageLoadingMsg(); },
				url: url,
				data: user,
				dataType: 'jsonp',
				jsonpCallback: "callback"
			}).done(function (data) {
				// Mensajes de feedback
				switch (data.code) {
					case 0:
						navigator.notification.alert("Usuario no pudo ser creado, intente de nuevo", null, "Error!", "Continuar");
						break;
					case 1:
						navigator.notification.alert("Usuario creado con exito, enviamos su clave al correo", null, "Éxito", "Continuar");
						$.mobile.changePage("index.html#main");
						break;
					case 2:
						navigator.notification.alert("Ocurrio algun problema, intente nuevamente", null, "Alerta", "Continuar");
						break;
					case 3:
						navigator.notification.alert("Usuario ya existe", null, "Alerta", "Continuar");
						break;
				}
			}).error (function () {
				// En caso de error
				navigator.notification.alert("Ocurrio algun problema inesperado, intente nuevamente", null, "Alerta", "Continuar");
			});
		})
	},

	// Recuperando clave
	doRecoverPassword : function(user) {
		$(function() {
			var url = app.base_url + "/users/recovery";
			$.ajax({
				beforeSend: function() { $.mobile.showPageLoadingMsg(); },
				complete: function() { $.mobile.hidePageLoadingMsg(); },
				url: url,
				data: user,
				dataType: 'jsonp',
				jsonpCallback: "callback"
			}).done(function (data) {
				// Mensajes de feedback
				switch (data.code) {
					case 0:
						navigator.notification.alert("No se pudo recuperar la clave, intente de nuevo", null, "Error!", "Continuar");
						break;
					case 1:
						navigator.notification.alert("Clave reseteada, la enviamos a su correo", null, "Éxito", "Continuar");
						$.mobile.changePage("index.html#main");
						break;
					case 2:
						navigator.notification.alert("Ocurrio algun problema, intente nuevamente", null, "Alerta", "Continuar");
						break;
				}
			}).error (function () {
				// En caso de error
				navigator.notification.alert("Ocurrio algun problema inesperado, intente nuevamente", null, "Alerta", "Continuar");
			});
		})
	},
	
	
	// Obteniendo las noticias locales
	getLocalNews: function (news_container, params, page) {
		if (page) {
			page = parseInt($(page).val());
		} else {
			page = 1;
		}
		console.log("Loading local custom news page="+page);
		// Limpiando el contenedor
		$(news_container).empty();
		
		app.db.transaction(function (ctx) {
			// Seleccionando las configuraciones para determinar el numero de noticias a mostrar
			ctx.executeSql("select st.* from settings as st join users as u on u.id = st.user_id JOIN sessions as s on s.user_id = u.id LIMIT 1", [], function (tx, results) {
				if (results.rows.length > 0) {
					// capturando el numero de noticias a mostrar
					showed_news = results.rows.item(0).value;
					showed_news = parseInt(showed_news);
				}
				// Texto condicional, se construye de acuerdo al keyword en parametros
				where = '';
				
				// Si hay parametros se construye la clausula where
				if (params.length) {
					// Auxiliar para la construccion de un sql bien formado
					aux = new Array();
					for (i = 0; i < params.length; i++) {
						// Condiciones de busqueda
						aux.push("tags LIKE '%" + params[i] + "%'");
						aux.push("content LIKE '%" + params[i] + "%'");
						aux.push("title LIKE '%" + params[i] + "%'");
						aux.push("resume LIKE '%" + params[i] + "%'");
						aux.push("category_alias LIKE '%" + params[i] + "%'");
						aux.push("link LIKE '%" + params[i] + "%'");
						aux.push("author LIKE '%" + params[i] + "%'");
					}
					where = " WHERE " + aux.join(" OR ");
					mparams = "/" + params.join("/");
				} else {
					mparams = params;
				}
				max = (page - 1) * showed_news;
				// Buscando las noticicas
				tx.executeSql("SELECT id, title, link, resume, is_new FROM news " + where + " ORDER BY id DESC LIMIT ?, ?", [max, showed_news], function (tx, results) {
					refresh_url = '#' + $(news_container).parents('div[data-role="page"]').attr("id");
					count = null;
					// Si hay mas que 0 y menos que showed_news
					if (results.rows.length > 0 && results.rows.length < showed_news) {
						if (navigator.connection.type != Connection.NONE) {
							console.log("Contando...");
							var url = app.base_url + "/news/getByKeywords" + mparams;
							$.when(
								$.ajax({
									beforeSend: function() { $.mobile.showPageLoadingMsg(); },
									complete: function() { $.mobile.hidePageLoadingMsg(); },
									url: url,
									dataType: 'jsonp',
									data: {showed_news: showed_news, page: page, count: true},
									jsonpCallback: "callback",
									success: function (data) {
										count = data.count;
									}
								})
							).done(function (data) {
								count = data.count;
								if (count != results.rows.length) {
									app.getNews(news_container, mparams, refresh_url, page);
								} else {
									if (results.rows.length != 0) {
										app.doWriteNews(results, news_container, showed_news);
									}
								}
							});
						} else {
							app.doWriteNews(results, news_container, showed_news);
						}
					}
					if (results.rows.length == 0) {
						if (navigator.connection.type != Connection.NONE) {
							console.log("Contando...");
							var url = app.base_url + "/news/getByKeywords" + mparams;
							count = null;
							$.when(
								$.ajax({
									beforeSend: function() { $.mobile.showPageLoadingMsg(); },
									complete: function() { $.mobile.hidePageLoadingMsg(); },
									url: url,
									dataType: 'jsonp',
									data: {showed_news: showed_news, page: page, count: true},
									jsonpCallback: "callback",
									success: function (data) {
										count = data.count;
									}
								})
							).done(function (data) {
								count = data.count;
								if (count == 0 && count == results.rows.length) {
									$(news_container).append("<li><a>No hay noticias que mostrar</a></li>");
									$(news_container).trigger("create");
								} else {
									app.getNews(news_container, mparams, refresh_url, page);
								}
							});
						} else {
							$(news_container).append("<li><a>No hay noticias que mostrar</a></li>");
							$(news_container).trigger("create");
						}
					}
					if (results.rows.length == showed_news) {
						app.doWriteNews(results, news_container, showed_news);
					}
				}, function () {console.log("Error loading local news"); });
			})
		});
	},
	
	doWriteNews: function (results, news_container, showed_news) {
		console.log("Writing news");
		for(i=0; i < results.rows.length; i++) {
			console.log("Loading new: " + results.rows.item(i).id);
			// Contenedor de noticias
			container = $("<li>").addClass("ui-btn-icon-right ui-li-has-arrow ui-li ui-li-static ui-body-c ab-new");
			if (results.rows.item(i).is_new) {
				$(container).addClass("new")
			}
			
			// Boton de la noticia
			button = $("<div>").addClass("ui-btn-inner ui-li ui-li-static ui-body-c").attr("aria-hidden", true);
			
			// Texto de la noticia
			left = $("<div>").addClass("ui-btn-text");
			
			// Flecha indicadora de la derecha
			arrow = $("<span>").addClass("ui-icon ui-icon-arrow-r ui-icon-shadow");
			
			// Enlace
			link = $("<a>").attr("href", "#ver-noticia").addClass("ui-link-inherit open-new").attr({"data-ajax": "false", "alt": results.rows.item(i).id});
			
			// Titulo de la noticia
			title = $("<h3>").text(results.rows.item(i).title).addClass("ui-li-heading");
			
			// Resumen
			resume = $("<p>").text($(results.rows.item(i).resume).text()).addClass("ui-li-desc");
			
			// Construyendo el html correspondiente de la noticia
			$(link).append(title)
			$(link).append(resume)
			$(left).append(link)
			$(button).append(left);
			$(button).append(arrow);
			$(container).append(button);
			$(news_container).append(container);
		}
	},
	
	goNextNews: function (container) {
		i = parseInt($(container + " #n-page").val()) + 1;
		$(container + " #n-page").val(i);
		$(container + "ul.ui-listview").empty().trigger("pageshow")
		$(container).trigger("pageshow")
	},
	
	goPageNews: function (container, select) {
		$(container + " #n-page").val($(select).val());
		$(container + "ul.ui-listview").empty().trigger("pageshow")
		$(container).trigger("pageshow")
	},
	
	goPrevNews: function (container) {
		i = parseInt($(container + " #n-page").val()) - 1;
		if (i < 1) {
			i = 1;
		}
		$(container + " #n-page").val(i);
		$(container + "ul.ui-listview").empty().trigger("pageshow")
		$(container).trigger("pageshow")
	},
	
	// Obtenido las noticias
	getNews: function (news_container, params, refresh_url, page) {
		$(news_container).append("<li><a>Cargando...</a></li>");
		$(news_container).trigger("create");
		if (page) {
			page = parseInt(page);
		} else {
			page = 1;
		}
		app.db.transaction(function (ctx) {
			// Obteniendo las configuraciones locales para saber el numero de noticias a mostrar
			ctx.executeSql("select st.* from settings as st join users as u on u.id = st.user_id JOIN sessions as s on s.user_id = u.id LIMIT 1", [], function (tx, results) {
				if (results.rows.length > 0) {
					// Capturando el numero de noticias a mostrar
					showed_news = results.rows.item(0).value;
				}
				
				// Fuente de noticias
				var url = app.base_url + "/news/getByKeywords" + params;
				$.ajax({
					beforeSend: function() { $.mobile.showPageLoadingMsg(); },
					complete: function() { $.mobile.hidePageLoadingMsg(); },
					url: url,
					dataType: 'jsonp',
					data: {showed_news: showed_news, page: page},
					timeout: 5000,
					jsonpCallback: "callback",
					success: function (data, status) {
						// Limpiando el contenedor de noticias para que no haya noticias indeseadas
						$(news_container).empty();
						$(data).each(function (i, item) {
							app.db.transaction(function (ctx) {
								ctx.executeSql("SELECT * FROM news WHERE id = ?", [item.News.id], function (tx, results) {
									// SI no existe la noticia se guarda, de lo contrario no
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
				}).done(function (data) {
					if (refresh_url) {
						console.log("Actualizando el sitio con bandera ");
						$(refresh_url).trigger("pageshow");
					}
				});
			})
		});
	},
	
	getNumberPages: function (news_container, params, pages) {
		app.db.transaction(function (ctx) {
			// Seleccionando las configuraciones para determinar el numero de noticias a mostrar
			ctx.executeSql("select st.* from settings as st join users as u on u.id = st.user_id JOIN sessions as s on s.user_id = u.id LIMIT 1", [], function (tx, results) {
				if (results.rows.length > 0) {
					// capturando el numero de noticias a mostrar
					showed_news = results.rows.item(0).value;
					showed_news = parseInt(showed_news);
				}
			});
		});
		if (navigator.connection.type == Connection.NONE) {
			app.db.transaction(function (ctx) {
				// Texto condicional, se construye de acuerdo al keyword en parametros
				where = '';
				
				// Si hay parametros se construye la clausula where
				if (params.length) {
					// Auxiliar para la construccion de un sql bien formado
					aux = new Array();
					for (i = 0; i < params.length; i++) {
						// Condiciones de busqueda
						aux.push("tags LIKE '%" + params[i] + "%'");
						aux.push("content LIKE '%" + params[i] + "%'");
						aux.push("title LIKE '%" + params[i] + "%'");
						aux.push("resume LIKE '%" + params[i] + "%'");
						aux.push("category_alias LIKE '%" + params[i] + "%'");
						aux.push("link LIKE '%" + params[i] + "%'");
						aux.push("author LIKE '%" + params[i] + "%'");
					}
					where = " WHERE " + aux.join(" OR ");
				}
				
				// Seleccionando las configuraciones para determinar el numero de noticias a mostrar
				ctx.executeSql("select COUNT(id) as count from news " + where, [], function (tx, results) {
					npages = 1;
					if (results.rows.length > 0) {
						// capturando el numero de noticias a mostrar
						npages = results.rows.item(0).count;
					}
					npages = Math.ceil(npages / showed_news);
					npages = parseInt(npages);
					$(pages).val(npages);
					app.doGeneratePagination(news_container, npages);
				});
			});
		} else {
			if (params.length) {
				params = "/" + params.join("/");
			}
			// Fuente de noticias
			var url = app.base_url + "/news/getByKeywords" + params;
			$.when(
				$.ajax({
					beforeSend: function() { $.mobile.showPageLoadingMsg(); },
					complete: function() { $.mobile.hidePageLoadingMsg(); },
					url: url,
					dataType: 'jsonp',
					data: {count: true},
					jsonpCallback: "callback"
				})
			).done(function (data) {
				npages = Math.ceil(data.count / showed_news);
				npages = parseInt(npages);
				$(pages).val(npages);
				app.doGeneratePagination(news_container, npages);
			});
		}
	},
	
	doGeneratePagination: function (news_container, npages) {
		container = '#' + $(news_container).parents('div[data-role="page"]').attr("id");
		
		block_a = $("<div>").addClass("ui-block-a"); // Prev
		block_b = $("<div>").addClass("ui-block-b"); // Pages
		block_c = $("<div>").addClass("ui-block-c"); // Next
		
		box_a = $("<div>").addClass("grid-box");
		box_b = $("<div>").addClass("grid-box");
		box_c = $("<div>").addClass("grid-box");
		
		goprev = $("<a>").attr({"data-role":"button", "onclick": "app.goPrevNews('"+container+"')"}).text("<");
		gopage = $("<select>").attr({"onchange": "app.goPageNews('"+container+"', this)"});
		for (i = 1; i <= npages; i++) {
			$(gopage).append($('<option>', {
				value: i,
				text: i,
				selected: (parseInt($(container + " #n-page").val()) == i) ? true : false
			}));
		}
		gonext = $("<a>").attr({"data-role":"button", "onclick": "app.goNextNews('"+container+"')"}).text(">");
		
		$(box_a).append(goprev);
		$(box_b).append(gopage);
		$(box_c).append(gonext);
		
		$(block_a).append(box_a);
		$(block_b).append(box_b);
		$(block_c).append(box_c);
		
		$(container + " #pagination").empty();
		$(container + " #pagination").append(block_a);
		$(container + " #pagination").append(block_b);
		$(container + " #pagination").append(block_c);
		$(container + " #pagination").trigger("create");
		$(".ui-select").each(function () {
			$(this).addClass("ui-btn");
		});
	},
	
	doMark: function (target) {
		$("a.do-mark").each(function () {
			$(this).attr("alt", target);
		});
	},
	
	doMarkUnreaded: function (e) {
		container = $(e).attr("alt")
		$(container + " a.open-new").each(function () {
			app.doMarkNew($(this).attr("alt"), 1, container)
		});
		$.mobile.changePage("index.html" + container);
	},
	
	doMarkReaded: function (e) {
		container = $(e).attr("alt")
		$(container + " a.open-new").each(function () {
			app.doMarkNew($(this).attr("alt"), 0, container)
		});
		$.mobile.changePage("index.html" + container);
		
	},
	
	doMarkNew: function (id, is_readed) {
		console.log("marcando id=" + id + " como: " + is_readed);
		app.db.transaction(function (ctx) {
			ctx.executeSql("UPDATE news SET is_new = ? WHERE id = ?", [is_readed, id]);
		})
		
	},
	
	// Obteniendo la noticia segun id localmente
	getLocalNew: function (params) {
		// Limpiando los contenedores
		$("#new-title").empty();
		$("#new-content").empty();
		
		console.log("Loading local new id = " + params);
		app.db.transaction(function (ctx) {
			// Buscando la noticia localmente
			ctx.executeSql("SELECT title, content FROM news WHERE id = ?", [params], function (tx, results) {
				// SI hay resultados se actualizan los contenedores
				if (results.rows.length > 0) {
					mark = $("a.mark-unread")[0];
					$(mark).attr("onclick", "app.doMarkNew('"+params+"', 1)");
					$.mobile.silentScroll(0);
					$("#new-title").html(results.rows.item(0).title)
					$("#new-content").html(results.rows.item(0).content)
					ctx.executeSql("UPDATE news SET is_new = ? WHERE id = ?", [0, params]);
				}
			}, function () {console.log("Error loading local new"); });
		});
	},
	
	
	// En caso de error ejecutando una transaccion u operacion
	onErrorDB: function (error) {
		// En caso de error se muestra un log
		console.log(error);
	},
	
	// Construyendo las tablas si no existen localmente
	populateDB: function (tx) {
		tx.executeSql("CREATE TABLE IF NOT EXISTS news (id INTEGER PRIMARY KEY AUTOINCREMENT, diary TEXT, title TEXT, link TEXT, author TEXT, date TEXT, category_id TEXT, category_alias TEXT, resume TEXT, content TEXT, images TEXT, is_new NUMERIC DEFAULT 1, tags TEXT, showed NUMERIC, reviewed NUMERIC, created NUMERIC)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT, is_new NUMERIC, name TEXT, lastname TEXT, latitude TEXT, longitude TEXT, location TEXT, website TEXT)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER UNIQUE, last_access TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, value TEXT, extra TEXT, user_id INTEGER)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS keywords (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
		tx.executeSql("CREATE TABLE IF NOT EXISTS users_keywords (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, keyword_id INTEGER)");
	},
	
	// MEtodo de conexion a la base de datos
	doConnect: function (db_name, db_version, db_display_name, db_size) {
		// Creando la base de datos si no existe
		app.db = window.openDatabase(db_name, db_version, db_display_name, db_size);
		
		// Iniciando la transaccion de creacion de la base de datos
		app.db.transaction(app.populateDB, app.onErrorDB);
	},
};
