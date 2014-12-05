"use strict";

//		canvas.addEventListener('DOMMouseScroll',handleScroll,false);
//		canvas.addEventListener('mousewheel',handleScroll,false);
var setupOverlay2 = (function(){

    console.log("setupOverlay2");

    function $(selector){
        var c = selector.charAt(0);
        if( c === '#' ){
            var element = document.getElementById(selector.slice(1,selector.length));
        }else{
            var element = document.getElementById(selector);
        }
        var self = {}
        var on = function(eventStr,callback){
            var events = eventStr.split(' ');
            var i, l = events.length;
            for( i=0; i<l; i+=1 ){
                if( element.attachEvent ){
                    element.attachEvent('on'+events[i], callback);
                }else{
                    element.addEventListener(events[i], callback, false);
                }
            }
            return self;
        };
        self.on = on;
        self.element = element;
        return self;
    }
    var canvas = null;

    return function(id,onChange){
    var localOnChange = (function(onChange){ return function(){
        onChange();
    }; })(onChange);

        canvas = $(id);

        canvas.on('touchstart mousedown',function(e){
            //prevents the mouse down from having an effect on the main browser window:
            if (e.preventDefault) {
                e.preventDefault();
            } //standard
            else if (e.returnValue) {
                e.returnValue = false;
            } //older IE
            console.log("down");
        }).on('touchend mouseup',function(e){
        	console.log("upp");
        }).on('DOMMouseScroll mousewheel',function(e){
            if (e.preventDefault) {
                e.preventDefault();
            } //standard
            else if (e.returnValue) {
                e.returnValue = false;
            }
        	console.log("scroll");
			var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;

			console.log("delta", delta, e.wheelDelta, e.detail);
			// if (delta) zoom(delta);
        });

    };
})();

function selectview2(id){
    // setupOverlay('#bild2',function(){
    // });
    setupOverlay2('#bild2',function(){
    	console.log("selectview2");
    });
}