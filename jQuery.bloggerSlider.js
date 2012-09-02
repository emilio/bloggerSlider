;(function( $ ,window, undefined ){
function formatoFecha(fecha){
	var dia,mes,año;
		fecha = fecha.split("-")
		dia = fecha[2].substring(0,2)
		mes = fecha[1]
		año = fecha[0]
	return dia+"-"+mes+"-"+año
}
$.fn.bloggerSlider = function(opt){
	opt = $.extend({},$.fn.bloggerSlider.porDefecto, opt || {} )
	if( typeof opt.tamanoImagen === 'number' ){opt.tamanoImagen = [opt.tamanoImagen,opt.tamanoImagen]}
	return $.each(this, function(i){
		var $this = $(this),
			context = $this.children('ul')[0] || this,
			slider;
			opt.context = context;
		if( opt.comprobarLista ){
			if( context.tagName.toLowerCase() !== "ul" ){ 
				$('<ul></ul>').appendTo(context); 
				opt.context = context = $(context).children('ul')[0] 
			}
		}
		opt.nav = opt.nav[0]
		if( !opt.nav && opt.usarSlider ){
			$this.after("<div class=\"slider-nav slider-nav-"+(i+1).toString()+"\"><\/div>")
			opt.nav = $('.slider-nav-'+(i+1).toString())[0]
		}
		if( opt.usarAjax ){
			var llamada = $.ajax({
				url:opt.blog + "\/feeds\/posts\/default?alt=json-in-script&max-results=" + opt.numEntradas.toString() + "&orderby=" + opt.orderBy,
				dataType:'jsonp',
				context: context,
				success:function(json)
					{
						var entradas = json.feed.entry,
						contenedor = this,
						$contenedor = $(this),
						documento = '',
						entrada,titulo,imagen,link,contenido,fecha,temp;
							$.each(entradas, function(i){
								entrada = this 
								titulo = entrada.title.$t
								contenido = borraretiquetas(entrada.content.$t).substring( 0, opt.charsResumen ) + '...'
								fecha = formatoFecha( entrada.published.$t )
								$.each( entrada.link, function(){ if( this.rel === "alternate" ) link = this.href })
								if( opt.sourceExperimental ){
									if( entrada.content.$t.match(/<img\s.*(\/>)/) ){
										imagen =  "<" + entrada.content.$t.match(/<img\s.*(\/>)/)[0].split("<")[1].split("=")
										for( var j = 0; imagen[i]; i++){ if(imagen[i].substring(imagen[i].length-3) === "src") imagen = imagen[i+1].replace(/'/g,"\"").split("\"")[1];break;}
									} else {
										imagen = opt.imagenPorDefecto || ''
									}
								}else{
									imagen = ( entrada.media$thumbnail && entrada.media$thumbnail.url ) || opt.imagenPorDefecto || ''
								}
								if( imagen && opt.tagImagen ){
									imagen = '<a href="'+link+'"><img src="'+ imagen.replace(/\/s72/,"\/s"+ opt.tamanoImagen[0])+'" alt="'+titulo+'" style="width:'+ opt.tamanoImagen[0] +'px; height:'+ opt.tamanoImagen[1] +'px"/><\/a>'
								}
								temp = opt.plantilla.replace(/{{tit}}/g,titulo).replace(/{{img}}/g,imagen).replace(/{{fecha}}/g,fecha).replace(/{{res}}/g,contenido).replace(/{{link}}/g,link);
								documento += temp
							})
						contenedor.innerHTML += documento
					}
			})
			if ( opt.usarSlider ){
				llamada.done(function(){ 
					window['bloggerSlider'+(i+1).toString()] = slider = new bloggerSlider(opt);
					slider.init()
				})
				
			}
		}else{
			window['bloggerSlider'+(i+1).toString()] = slider = new bloggerSlider(opt)
			slider.init()
		}
	})
}

$.fn.bloggerSlider.porDefecto = {
	//Opciones ajax
	//A lo mejor sólo se quiere usar el slider
	usarAjax: true,
	blog: "http://" + document.location.hostname,
	numEntradas:6,
	orderBy:"published",
	comprobarLista:true,
	charsResumen:60,
	tamanoImagen:[120,120],
	sourceExperimental:false,
	imagenPorDefecto:false,
	tagImagen:true,
	plantilla:'<li class="entrada">{{img}}<h2><a href="{{link}}" title="{{tit}}">{{tit}}<\/a><\/h2><span class="fecha">{{fecha}}<\/span><p>{{res}}<\/p><\/li>',
	//Opciones slider
	//Sólo usar ajax
	usarSlider:true,
	autoNav:true,
	nav:$('#slider-nav'),
	avanceAuto:false,
	easing:undefined,
	tiempoAnim:600,
	slideInicial: 1,
	cambioAltura:false,
	textoSiguiente:"Siguiente",
	textoAnterior:"Anterior"		
}
function borraretiquetas(string){
	if (string.indexOf("<")!==-1){
		var res = [];
		string = string.split("<")
		
		for (var i=0;i < string.length;i++){
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
bloggerSlider = function( opt ){
	this.opt = opt;
	this.slideActual = this.opt.slideInicial - 1;
	return this
}
bloggerSlider.prototype = {
	init:function(){
		var esto = this,
			opt = esto.opt
		esto.contenido = $(opt.context).children('li')
		esto.anchoContenido = $(esto.contenido).first().width()
		if( opt.autoNav ){
			esto.crearAutoNav()
		}
		esto.irSlide( esto.slideActual )
		if( esto.opt.avanceAuto ){
			esto.timer = setTimeout(function(){
				esto.irSlide.call(esto, esto.slideActual + 1)
			}, esto.opt.avanceAuto)
		}
		this.initEvents()
	},
	crearAutoNav:function(){
		var autoPrev,
			autoNext,
			clear = document.createElement('div'),
			esto = this,
			opt = this.opt,
			i = 0;
		
		//Div por si usamos float en los links
		//(lo más frecuente)
		clear.style.clear = "both"
		
		//Vaciamos el navegador
		opt.nav.innerHTML = ""

		//Botón "prev"
		autoPrev = document.createElement('a')
		autoPrev.className = "nav prev";
		autoPrev.setAttribute('data-dir','prev')
		autoPrev.innerHTML = opt.textoAnterior;

		opt.nav.appendChild(autoPrev)

		//Next						
		autoNext = document.createElement('a')
		autoNext.className = "nav next";
		autoNext.setAttribute('data-dir','next')
		autoNext.innerHTML = opt.textoSiguiente;
		
						
		//Por cada slide que hay, hacemos un botón
		for(;i < esto.contenido.length;i++){
			botonAct = document.createElement('a');
			botonAct.className = "nav slide";
			botonAct.setAttribute('data-slide',i+1);
			botonAct.innerHTML = i+1
			opt.nav.appendChild(botonAct)
		}
		
		//El botón "next" lo insertamos al final
		opt.nav.appendChild(autoNext)
		
		//Ponemos el clear
		opt.nav.appendChild(clear)
	},
	initEvents:function(){
		var esto = this,
			opt = esto.opt,
			nav = opt.nav,
			$nav = $(opt.nav)
		$nav.children('a').bind('click',function(e){
			var $this = $(this),
			slideActual = esto.slideActual
			if( $this.data('dir') === 'next'){
				esto.avanza();return;
			}else if( $this.data('dir') === 'prev' ){
				if( slideActual === 0 )
					slideActual = esto.contenido.length - 1
				else
					slideActual--
			}else{
				slideActual = parseInt( $this.data('slide') ) - 1
			}
			esto.irSlide(slideActual)
			e.preventDefault()
		})
	},
	irSlide:function( slide ){
		var esto = this,
			opt = esto.opt,
			$nav = $( opt.nav ),
			$contenido = $(esto.contenido),
			$context = $(esto.opt.context)
		if( esto.opt.avanceAuto ){
			clearTimeout( esto.timer )
		}
		$.each($(esto.opt.nav).children(),function(){
			if( $( this ).data('slide') == (slide + 1) ){
				$( this ).addClass('activo')
			}else{
				$( this ).removeClass('activo')
			}
		});
		if( esto.opt.avanceAuto ){}
		$contenido.removeClass('actual')
		$contenido.eq(slide).addClass('actual')
		esto.slideActual = slide
		$context.stop().animate({marginLeft:-slide*esto.anchoContenido}, esto.opt.tiempoAnim, esto.opt.easing)
		if( this.opt.cambioAltura ){
			$context.parent().animate({height:$contenido.eq(slide).height()})
		}
		if( esto.opt.avanceAuto ){
			esto.timer = setTimeout(function(){
				esto.avanza.call(esto)
			}, esto.opt.avanceAuto)
		}
	},
	ir:function(slide){
		return this.irSlide(slide-1)
	},
	avanza: function(){
		var esto = this,
			slideActual = esto.slideActual
		if( slideActual === esto.contenido.length - 1 ){
			slideActual = 0
		}else{
			slideActual++
		}
		esto.irSlide( slideActual )
	},
	stop: function(){
		if( this.timer || this.opt.avanceAuto ){
			clearTimeout( this.timer )
			this.opt.avanceAuto = null
		}
	}
}
})( jQuery, window )
