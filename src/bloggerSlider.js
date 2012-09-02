;(function( window, undefined ){
//función de ayuda para animar con el slider
	Object.keys = Object.keys || function(obj){
		var res = []
		for (var pr in obj){
			res.push(pr)
		}
		return res
	}
//No hace falta explicar para qué sirve no?
function borraretiquetas(string){
	if (string.indexOf("<")!==-1){
		var res = [];
		string = string.split("<")		
		
		for (var i=0;i<string.length;i++){
			if(string[i].indexOf(">")!==-1){
				res.push(string[i].split(">")[1])
			}else{
				res.push(string[i])
			}
		}
		string = res.join("")
		}
	return string
}
//Dar formato a la fecha que nos da blogger
function formatofecha(fecha){
	var dia,mes,año;
		fecha = fecha.split("-")
		dia = fecha[2].substring(0,2)
		mes = fecha[1]
		año = fecha[0]
	return dia+"-"+mes+"-"+año
}
//La función propiamente dicha
function imgtitulo(json){
	//aquí cogemos las opciones
	var opt = opcionesEntradas,
	//El contenedor. Cambiar "slider-entradas" por vuestra ID
	//Aseguraos de que hay una lista no ordenada dentro (<ul></ul>)
		contenedor = opt.contenedor ? typeof opt.contenedor  === 'string' ? 
										document.getElementById(opt.contenedor): 
										opt.contenedor
									:document.getElementById('slider-entradas'),
		
		lista = contenedor.getElementsByTagName('ul')[0],
		//Nos aseguramos de que la salida va a ser una <ul>.
		//Es posible que se quiera deshabilitar si se cambia la plantilla.
		comprobarLista = opt.comprobarLista !== false ? true : false,
		entradas = json.feed.entry,
		//Carácteres del resumen
		charsResumen = opt.charsResumen || 200,
		//Tamaño por defecto de la imagen
		tamanoImagen = opt.tamanoImagen ? typeof opt.tamanoImagen === 'number' ? [ opt.tamanoImagen, opt.tamanoImagen ] : opt.tamanoImagen
						:[ 120, 120 ],
		//Si queremos que se muestre la imagen
		//como etiqueta o sólo la url
		//true o false
		tagImagen = opt.tagImagen !== false ? true : false,
		//Obtener la imagen del post completa, no la imagen cuadrada que nos da blogger
		//Como su nombre indica, experimental, pero parece que funciona bien
		sourceExperimental = opt.sourceExperimental || false,
		//Imagen por defecto: false o una URL
		imagenPorDefecto = opt.imagenPorDefecto || undefined,
		//La plantilla. Si tenéis un script así:
		//<script type="UnTipoQueNoExiste" id="plantilla-slider">
		//...Aquí vuestro HTML...
		//<\/script>
		//Usará ese HTML como plantilla, sustituyendo:
		//"{{img}}" => La imagen (tag o URL)
		//"{{link}}" => La URL de la entrada
		//"{{tit}}" => El título de la entrada
		//"{{fecha}}" => La fecha de publicación
		//"{{res}}" => El resumen de la entrada
		plantilla = typeof opt.plantilla === 'string' ? opt.plantilla : opt.plantilla ? opt.plantilla.innerHTML : document.getElementById("plantilla-slider") ? 
					  document.getElementById("plantilla-slider").innerHTML
						:'<li class="entrada"> {{img}}<h2><a href="{{link}}" title="{{tit}}">{{tit}}<\/a><\/h2><span class="fecha">{{fecha}}<\/span><p>{{res}}<\/p><\/li>',
		//Vacío, aquí añadiremos todo de una vez al contenedor
		documento = '',
		urlImg,
		i =  0,j,k,
		//Variables que definiremos más tarde
		entrada, linksentrada, link, titulo,contenido,
		//Arrays donde irán los títulos, etc
		titulos = [],
		fechas = [],
		resumenes = [],
		links = [],
		imagenes = [];

	if( comprobarLista && !lista ){
		lista = contenedor.appendChild( document.createElement( 'ul') )
	}
	
	contenedor = lista;
	
	for(;i < entradas.length;i++){
		j=0
		entrada = entradas[i]
		titulo = entrada.title.$t

		titulos.push( titulo )
		fechas.push( formatofecha(entrada.published.$t) )
		contenido = entrada.content || entrada.summary
		resumenes.push( borraretiquetas(contenido.$t)
							.substring(0,charsResumen)+'...' )

		linksentrada = entrada.link

		//Hallamos el link de la entrada (rel = alternate)
		for(;j<linksentrada.length;j++){
			linkactual = linksentrada[j]
			if(linkactual.rel === "alternate"){
				link = linkactual.href; break;
			}
		}

		links.push(link)
		
		//Si hay imagen
		if( entrada.media$thumbnail){
			urlImg = entrada.media$thumbnail.url
			if( sourceExperimental ){
				k = 0
				//La primera imagen de la entrada
				urlImg = "<"+entrada.content.$t.match(/<img\s.*(\/>)/)[0].split("<")[1]
				urlImg = urlImg.split("=")
				for(;urlImg[k];k++){
					//si los 3 últimos caracteres son "src"
					//cogemos el siguiente elemento(la url)
					if(urlImg[k].substring(urlImg[k].length-3)==="src"){
						//quitamos las comillas con el split
						urlImg = urlImg[k+1].split("\"")[1];break
					}
				}
			}
			//Si lo queremos con tags
			if( tagImagen ){
				imagenes.push('<a href="'+link+'"><img src="'+ urlImg.replace(/\/s72/,"\/s"+ tamanoImagen[1])+'" alt="'+titulo+'" style="width:'+tamanoImagen[1]+'px; height:'+tamanoImagen[0]+'px"/><\/a>')
			//Sólo la URL
			} else {
				imagenes.push(
					urlImg
					.replace(/s72-/,"s"+ tamanoImagen[1] +"-")
				)
			}
		//Si tenemos imagen por defecto
		} else if ( imagenPorDefecto ){
			//Si queremos la etiqueta
			//Replace para "aumentar"  el tamaño de la imagen
			if( tagImagen ){
				imagenes.push('<a href="'+link+'"><img src="'+ imagenPorDefecto.replace(/\/s72/,"\/s"+ tamanoImagen[1])+'" alt="'+titulo+'" style="width:'+tamanoImagen[1]+'px; height:'+tamanoImagen[0]+'px"/><\/a>')
			//Sólo la URL
			} else {
				imagenes.push(
					imagenPorDefecto
					.replace(/\/s72-/,"\/s"+ tamanoImagen[1] +"-")
				)
			}
		//Si no hay imagen siempre enviamos algo, para que no se desordene
		} else {
			imagenes.push(" ")
		}
	}
	
	i=0;
	//Remplazamos todo de la plantilla por las variables.
	//El número de títulos es igual al número del resto de cosas
	for( ;i < titulos.length; i++ ){
		documento += plantilla.replace(/{{img}}/g,imagenes[i])
			.replace(/{{tit}}/g,titulos[i])
			.replace(/{{link}}/g,links[i])
			.replace(/{{fecha}}/g,fechas[i])
			.replace(/{{res}}/g,resumenes[i])
	}
	//Metemos en la <ul></ul> todo el contenido
	contenedor.innerHTML += documento

return true
}
function estilo(el){
	return window.getComputedStyle ? getComputedStyle(el, null) : el.currentStyle;
}
function aFloat(valor){
	return parseFloat(valor)
}
function calcWidthHeight( el, prop ){
	var	claves = ["Top","Bottom","Left","Right"],
		i = prop === "height" ? 0 : 2,
		valor,
		inicio = prop === "height" ? el.offsetHeight : el.offsetWidth,
		props = ["border"+claves[i]+"Width","border"+claves[i+1]+"Width","padding"+claves[i],"padding"+claves[i+1]],
		css = estilo(el);
	for( var j = 0; j < 4; j++){
		valor = aFloat(css[props[j]])
		inicio -= isNaN(valor) ? 0 : valor; 
	}
	return inicio
}
function addEvent(elementos, tipo, funcion ){
		if( ! elementos ){ return false}
		if(  ! elementos.addEventListener && ! elementos.attachEvent && elementos.length ){
			for( var i = 0, len = elementos.length; i < len; i++){
				addEvent(elementos[i], tipo, funcion)
			};
			return false;
		}
		if(window.addEventListener){
			return elementos.addEventListener(tipo, funcion, false)
		} else {
			elementos.attachEvent('on' + tipo, function(e){
				e = e || window.event;
				if( ! e.preventDefault ){
					e.target = e.target || e.srcElement
					e.preventDefault = function(){
						this.returnValue = false;
					};
					e.stopPropagation = function(){
						this.cancelBubble = true;
					};
				}
				return funcion.call(elementos, e)
			})
		}
	};
function borrarClase(elementos, clase) {
	var reg = new RegExp("(\\s|^)(" + clase + ")(\\s|$)")
	if( elementos.nodeType )
		return elementos.className = elementos.className.replace(reg, "");
	for( var i = 0, len = elementos.length; i < len; i++ ){
		elementos[i].className = elementos[i].className.replace(reg, "");
	}
	return null
}
var easings = {
	linear: function(frameAct, cambio, init, frames){
		return init + cambio/frames * frameAct
	},
	easeOutQuad: function(frameAct, cambio, init, frames){
		return init - cambio *(frameAct/=frames)*(frameAct-2);
	},
	easeInQuad: function (frameAct, cambio, init, frames) {
		return init + cambio*(frameAct/=frames)*frameAct;
	}
};
function slider(opt){
	var nav;

	//El contenedor es lo único obligatorio
	this.contenedor = typeof opt === "string" ? 
					document.getElementById( opt )
					: typeof opt.contenedor === "string" ?
						document.getElementById( opt.contenedor )
						: opt.contenedor
	
	//Para avance automático
	this.tiempoTrans = opt.avanceAuto || false
	
	//Easing de la animación
	this.easing = opt.easing || ''
	
	//si no hemos especificado opciones, el navegador 
	//lo configuramos arriba.
	this.nav = this.nav || typeof opt.nav === "string" ?
							document.getElementById( opt.nav )
							:opt.nav
	
	this.tiempoAnim = parseFloat(opt.tiempoAnim) || 700
	//Si no hay botones, los creamos
	if( !this.nav ){
		nav = document.createElement('div');
		nav.id = !document.getElementById("slider-nav") ? "slider-nav" : "slider-nav-1"; 
		//Forma fácil de usar "insertAfter" ( que no existe )
		this.contenedor.nextSibling ? 
			this.contenedor.parentNode.insertBefore( nav, this.contenedor.nextSibling ):
			this.contenedor.parentNode.appendChild( nav );
		this.nav = nav; 
		this.autoNav = true;
	}
	
	//crear el navegador
	this.autoNav = this.autoNav || opt.autoNav || false
	//si queremos alguna slide como comienzo 
	//el menos 1 es para facilitar las cosas
	this.slideActual = opt.slideInicial - 1 || 0
	
	//Si queremos que la altura cambie al animar
	this.cambioAltura = opt.cambioAltura || false
	
	//Textos para el botón anterior y siguiente
	this.textoSiguiente = opt.textoSiguiente || "Siguiente"
	this.textoAnterior = opt.textoAnterior || "Anterior"
}

slider.prototype = {
	//función para borrar clases de las entradas y los slides
	borrarClase: function( elementos, claseParaBorrar ){
		var j = 0,
			k,
			esto = this,
			res,
			clases;
							
		for(;j < elementos.length ; j++){
			res = [],
			k = 0;
			clases = elementos[j].className.split(" ")
			for (; k < clases.length; k++){
				if(clases[k] !== claseParaBorrar){
					res.push(clases[k])
				}
			}
			elementos[j].className = res.join(" ")
		}
	},
	animar: function (el, props, tiempo , easing, callback){
		var esto = this,
			s = estilo(el),
			display = s.display,
			keys = Object.keys(props);
		esto.animado = true
		if(easing && typeof easing === "function"){callback = easing; easing = undefined}
		
		for (var p in props){
			(p === keys[0])? this.hacerAnim(el, p, props[p], tiempo, easing, callback) : this.hacerAnim(el, p, props[p], tiempo, easing)
		}
		return this
	},
	hacerAnim: function(el,prop, fin, tiempo, easing, callback){
		var esto = this,
			fps = 65,
			frames = fps * tiempo/1000,
			frameAct = 1,
			i = 1,
			unit = prop === "opacity" ? '' : 'px',
			animado,
			init = estilo(el)[prop],
			dif,
			antes = el.style[prop] || '',
			overflowBefore = el.style.overflow || '',
			finSplit;//solo para color
							
		if(prop === "height" || prop === "width"){el.style.overflow = "hidden"}
		if(prop === "background"){prop = "backgroundColor"};

		easing = easings[easing]||easings.easeInQuad

		init = aFloat(init);
		fin = aFloat(fin);

		dif = fin - init;

		el.style[prop] = init + unit

		if(prop === "opacity"){
			el.style.filter = "alpha(opacity="+100*init+")"
		}
		
		function an(){
			var valAct = easing(frameAct, dif, init, frames)
			
			if(prop === "opacity"){
				el.style[prop] = valAct + unit;
				el.style.filter = "alpha(opacity="+100*valAct+")"
			}else{
				el.style[prop] = valAct + unit
			}
			frameAct++
		}
		function end(){
			clearTimeout(animado)
			el.style[prop] = fin + unit

			el.style.overflow = overflowBefore
			esto.animado = false
			
			if(callback && typeof callback === "function")
				callback.call(el,arguments);
			return el
		}
		
		for(;i <= frames;i++){
			setTimeout(an,tiempo/frames*i)
		}
		setTimeout(end,tiempo)
	},
	//función de inicio
	init: function () {
		var esto = this,
			botonAct,
			slideactual = this.slideActual,
			boton;
		esto.lista = esto.contenedor.getElementsByTagName('ul')[0]
		esto.contenido = esto.lista.getElementsByTagName('li')
		esto.anchocontenido = calcWidthHeight(esto.contenido[0], "width");
			   
		esto.contenedor.style.overflow = "hidden"
		esto.contenido[slideactual].className+= " actual"
		
		if( esto.cambioAltura ){
			esto.contenedor.style.height = calcWidthHeight(esto.contenido[slideactual],"height") + 'px'
		}
		
		//Si ha sido configurada una slide distinta, mostrarla
		esto.lista.style.marginLeft = - (esto.anchocontenido) * (slideactual)+'px'
		
		//Si hemos elegido avance automático, configurar.
		//Si no, no lo definimos
		esto.timer = esto.tiempoTrans ? setTimeout(function(){
			esto.avanza.call(esto)
			}, esto.tiempoTrans): undefined		  
		
		//Si la opción "autoNav" está definida, creamos el menú
		if( esto.autoNav  && esto.autoNav === true) 
			esto.construyeAutoNav();
		
		//agregamos los eventos a los botones
		esto.iniciarEventos()
	},
	//Inicio de los eventos
	iniciarEventos: function(){
		//En otros casos la copia de "esto" por "this" no era
		//necesaria, en este sí, ya que necesitaremos pasarlo
		//cuando hagamos click
		var esto = this,
		nav = esto.nav.getElementsByTagName('a'),
		i = 0,
		slideactual = esto.slideActual,
		boton,
		dataSlide;
		
		//Añadimos la clase "activo" al primer botón
		for(; i < nav.length; i++){
			boton = nav[i];
			dataSlide = boton.getAttribute("data-slide") 
			if( dataSlide && dataSlide == ( slideactual+1 ) ){
				boton.className += " activo"
			}
		//Añadimos el evento al hacer click
			addEvent(boton,'click', function(){
				var dir = this.getAttribute("data-dir")
			
				if( esto.animado === true ) {return}
				//si hay cambio automático, paramos el cambio
			
				slideactual = esto.slideActual
				//si es el botón "siguiente", calculamos la slide actual
				if(dir && dir === "next"){
					esto.avanza();return;
				//si es el botón "anterior", lo mismo
				}else if( dir && dir === "prev" ){
					//Si es la primera, ponemos la última
					
					if ( slideactual === 0 ){
						slideactual = esto.contenido.length-1
					//Si no, retrocedemos
					}else{
						slideactual -= 1
					}
				
				//Botones individuales
				}else if( this.getAttribute( "data-slide" ) ){
					slideactual = this.getAttribute("data-slide")-1
				}
				esto.irSlide(slideactual)
			});
		}
	},
	ir:function(i){
		return this.irSlide(i-1)
	},
	irSlide:function(i){
		var esto = this,
			timer = esto.timer,
			slideactual,
			nav = esto.nav.getElementsByTagName('a');

		if( esto.animado === true ) {return}
		
		slideactual = esto.slideActual = i
		
		timer && clearTimeout(esto.timer)

		//Borramos clases
		borrarClase(nav , "activo")
		borrarClase(esto.contenido, "actual")
		
		//Añadimos
		for(var j=0;j < nav.length; j++){
			if( nav[j].getAttribute("data-slide") == slideactual+1 ){
				nav[j].className += " activo"
			}
		}
		esto.contenido[slideactual].className += " actual"
		
		//Animamos
		esto.animar( esto.lista, {marginLeft : -esto.anchocontenido * slideactual}, esto.tiempoAnim, esto.easing )
				
		//Si hemos determinado que se cambie la altura, lo hacemos
		if( esto.cambioAltura ){
			esto.animar( esto.contenedor, {
				height: calcWidthHeight( esto.contenido[slideactual], "height")
			}, esto.tiempoAnim, esto.easing ) 
		}
		//Si tenemos avance auto, fijamos un "timeout"
		if( timer )
			esto.timer = setTimeout(function(){
				//Llamamos a la función desde el objeto (si no referiría a la ventana)
				esto.avanza.call(esto)
			}, esto.tiempoTrans)
	},
	//Función para avanzar
	avanza: function(){
		//Recuerda que "this" es el slider
		var esto = this,
			slide = esto.slideActual;

		if( slide === esto.contenido.length-1 ){
			slide = 0
		}else {
			slide += 1
		}

		esto.irSlide( slide )
	},
	//Función para construir un menú automático
	//Todos los links tendrán la clase "nav"
	//El link "prev" además tendrá la clase "prev"
	//El "next" también tendrá la clase "next"
	//Los individuales tendrán la clase "slide"
	construyeAutoNav: function(){
		var autoPrev,
			autoNext,
			clear = document.createElement('div'),
			esto = this,
			i = 0;
		
		//Div por si usamos float en los links
		//(lo más frecuente)
		clear.style.clear = "both"
		
		//Vaciamos el navegador
		esto.nav.innerHTML = ""

		//Botón "prev"
		autoPrev = document.createElement('a')
		autoPrev.className = "nav prev";
		autoPrev.setAttribute('data-dir','prev')
		autoPrev.innerHTML = esto.textoAnterior;

		esto.nav.appendChild(autoPrev)

		//Next						
		autoNext = document.createElement('a')
		autoNext.className = "nav next";
		autoNext.setAttribute('data-dir','next')
		autoNext.innerHTML = esto.textoSiguiente;
		
						
		//Por cada slide que hay, hacemos un botón
		for(;i < esto.contenido.length;i++){
			botonAct = document.createElement('a');
			botonAct.className = "nav slide";
			botonAct.setAttribute('data-slide',i+1);
			botonAct.innerHTML = i+1
			esto.nav.appendChild(botonAct)
		}
		
		//El botón "next" lo insertamos al final
		esto.nav.appendChild(autoNext)
		
		//Ponemos el clear
		esto.nav.appendChild(clear)
	}
}
window.imgtitulo = imgtitulo
window.slider = slider
	 })(window)