"use strict";


(function(_this){
    _this['mousePaint'] = function(){
        ///////////////////////////////////////////////
        //// Make labels
        var radioFB = 1;
        $('#myForm2 input').on('change', function() {
            radioFB = $('input[name=optFB]:checked', '#myForm2').val(); 
            radioFB = Number(radioFB);
            console.log(radioFB); 
        });

        var blobMap = [];

        function initBlobMap(xSize, ySize){
          // Start by labeling every pixel as blob 0
          for(var y=0; y<ySize; y++){
            blobMap.push([]);
            for(var x=0; x<xSize; x++){
              blobMap[y].push(0);
            }
          }  
        }

        function findLabels(src) {
          var xSize = src.width,
              ySize = src.height,
              srcPixels = src.data,
              x, y, pos;

          var isVisible = 0;

          // We leave a 1 pixel border which is ignored so we do not get array
          // out of bounds errors
          for( y=1; y<ySize-1; y++){
            for( x=1; x<xSize-1; x++){

              pos = (y*xSize+x)*4;

              // We're only looking at the alpha channel in this case but you can
              // use more complicated heuristics
              isVisible = (srcPixels[pos+3] > 127);

              if( isVisible ){
                if(blobMap[y][x] == 0 &&  srcPixels[pos+1] == 255 &&  srcPixels[pos] == 0 && srcPixels[pos+2] == 0){
                    blobMap[y][x] = 2;
                }
                if(blobMap[y][x] == 0 &&  srcPixels[pos] == 255 &&  srcPixels[pos+1] == 0 && srcPixels[pos+2] == 0){
                    blobMap[y][x] = 1;
                }
              }
            }
          }
          return blobMap;
        };

        /////////////////////////////////////////////////////////


        var setupOverlay = (function(){
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
                // element.children.blobs.remove();
                self.on = on;
                self.element = element;

                return self;
            }

            var getPointerPositionsIn = function(e,target){
                var locations = [], // array of x,y pairs (finger locations)
                 nLocations = 0, // number of locations
                 nTouches, // number of touches to look through
                 mx = 0, // mouse position
                 my = 0,
                 baseX = 0, // Base object's position
                 baseY = 0,
                 baseObj,
                 i, iLocation, iTouch; // temp for iterating

                if(e.type === "touchstart"
                || e.type === "touchmove"
                || e.type === "touchend"){
                    nTouches = e.touches.length;
                    for(i=0; i<nTouches; i+= 1){
                        iTouch = e.touches[i];
                        locations[nLocations] = { x: iTouch.pageX, y: iTouch.pageY };
                        nLocations += 1;
                    }
                }else{  
                    //if we're actually given the page coordinates
                    if(e.pageX || e.pageY){
                        //use the page coordinates as the mouse coordinates
                        mx = e.pageX;
                        my = e.pageY;
                    }else if(e.clientX || e.clientY){
                        //compute the page corrdinates
                        mx = e.clientX + document.body.scrollLeft +
                            document.documentElement.scrollLeft;
                        my = e.clientY + document.body.scrollTop +
                            document.documentElement.scrollTop;
                    }
                    locations[nLocations] = { x: mx, y: my };
                    nLocations += 1;
                }
                //find the location of the base object
                baseObj = target;
                //as long as we haven't added all of the parents' offsets
                while(baseObj.offsetParent !== null){
                    //add it's offset
                    baseX += parseInt(baseObj.offsetLeft,10);
                    baseY += parseInt(baseObj.offsetTop,10);
                    //get the next parent
                    baseObj = baseObj.offsetParent;
                }
                //the mouse position within the target object is:
                for(i=0; i<nLocations; i+=1){
                    iLocation = locations[i];
                    locations[i].x = iLocation.x - baseX;
                    locations[i].y = iLocation.y - baseY;
                }
                return locations;
            };

            var lastPos = null;
            var currPos = null;
            var canvas = null;

            return function(id,onChange){
                var localOnChange = (function(onChange){ return function(){
                    onChange();
                }; })(onChange);

                console.log("id", $(id));
                canvas = $(id);

                canvas.on('touchstart mousedown',function(e){
                    lastPos = getPointerPositionsIn(e,canvas.element);
                    currPos = lastPos;
                }).on('touchmove mousemove',function(e){
                    if( lastPos ){
                        var tmp = lastPos;
                        lastPos = currPos;
                        currPos = getPointerPositionsIn(e,canvas.element);
            
                        // Only draw a line if it's longer than 5 units
                        var dx = currPos[0].x - lastPos[0].x;
                        var dy = currPos[0].y - lastPos[0].y;
                        if( dx*dx + dy*dy < 16 ){
                         currPos = lastPos;
                         lastPos = tmp;
                         return;
                        }
                        
                        // Draw this segment
                        var ctx = canvas.element.getContext('2d');
                        // ctx.strokeStyle = '#ff0000';
                        if(radioFB == 2){
                            ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
                        }
                        else if(radioFB == 1){
                            ctx.strokeStyle = 'rgba(255, 0, 0, 1)';   
                        }
                        ctx.lineWidth = 8;
                        ctx.lineCap = 'round';
                        ctx.beginPath();
                        ctx.moveTo(lastPos[0].x,lastPos[0].y);
                        ctx.lineTo(currPos[0].x,currPos[0].y);
                        ctx.stroke();            
                    }
                    if( e.preventDefault ){
                        e.preventDefault();
                    }
                }).on('touchend mouseup mouseout',function(e){
                    lastPos = null;
                    currPos = lastPos;
                    localOnChange()
                }).on('mousemove',function(e){});
            };
        })();

        function ColorTheBlobs(dst,blobs,colors){
            var xSize = dst.width,
                ySize = dst.height,
                dstPixels = dst.data,
                x, y, pos;

            var label, color, nColors = colors.length;

            for(y=0; y<ySize; y++){
                for(x=0; x<xSize; x++){
                    pos = (y*xSize+x)*4;

                    label = blobs[y][x];

                    if( label !== 0 ){
                        color = colors[ label % nColors ];
                        dstPixels[ pos+0 ] = color[0];
                        dstPixels[ pos+1 ] = color[1];
                        dstPixels[ pos+2 ] = color[2];
                        dstPixels[ pos+3 ] = color[3];
                    }else{
                        dstPixels[ pos+3 ] = 0;
                    }
                }
            }
        };
        return{
            setup: function() {
                initBlobMap(document.getElementById('canvas_input_photo').width, document.getElementById('canvas_input_photo').height);
                (function(){    
                    setupOverlay('#canvas_input_photo',function(){
                        console.log("do setup");
                    });
                })();
            },
            getPainted: function(contex){
                imageData = contex.getImageData(0,0,document.getElementById('canvas_input_photo').width,document.getElementById('canvas_input_photo').height);
                var blobLabels = findLabels(imageData);
                // var blobCanvas = document.getElementById('canvas_output_photo');
                // var blobContex = blobCanvas.getContext('2d');
                // var blobImageData = contex.getImageData(0,0,640,480);

                // ColorTheBlobs(blobImageData,blobLabels,[
                //     [0,0,0,255],
                //     [255,0,0,255],
                //     [0,255,0,255],
                //     [0,0,255,255],
                //     [255,255,0,255],
                //     [255,0,255,255],
                //     [0,255,255,255]
                // ]);

                // blobContex.putImageData(blobImageData,0,0);
                return blobLabels;
            },
            getBlobSelected: function(){
                // return blobSelected;
            }
        };
    };
}(this));