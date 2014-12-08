"use strict";

var mosaics = [];
var scrollValue = 0;
//upp minus, ner pluss

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
			var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;

			// console.log("delta ner", delta, e.wheelDelta, e.detail);
			if(delta > 0 && scrollValue < (mosaics.length -1) ){
                scrollValue = scrollValue + 1;
                console.log("scrollValue", scrollValue);
                putMosaic(scrollValue);
            }else if(delta < 0 && scrollValue > 0){
                scrollValue = scrollValue - 1;
                console.log("scrollValue", scrollValue);
                putMosaic(scrollValue);
            }
        });
    };
})();


var b2, b2ctx;
function selectview2(id, mosaic){

    mosaics = mosaic;
    viewMosaic(mosaics);

    setupOverlay2('#bild2',function(){
    	console.log("selectview2");
    });
}

function viewMosaic(mosaic){
///////////////////////////////
    b2 = loadCanvas("bild2");

    b2.width=mosaic[0].width;
    b2.height=mosaic[0].height;
    
    b2ctx = b2.getContext("2d");
    b2ctx.globalAlpha = 0.5;
    b2ctx.drawImage(mosaic[1],0,0);
    b2ctx.globalAlpha = 1;
    b2ctx.drawImage(mosaic[0],0,0);
}

function putMosaic(val){

    //Remove all the images.
    b2.width=mosaics[0].width;
    b2.height=mosaics[0].height;

    //For all the images which are not the selected one.
    b2ctx.globalAlpha = 0.5;
    for (var i = 0; i < mosaics.length; i++){
        if (i != val){
            b2ctx.drawImage(mosaics[i],0,0);
        }
    }
    //Put the selected image on top.
     b2ctx.globalAlpha = 1;
     b2ctx.drawImage(mosaics[val],0,0);
        // .on("click", function()
        //     {
        //         console.log("clicked id : " + val);
        //     }); 
}

