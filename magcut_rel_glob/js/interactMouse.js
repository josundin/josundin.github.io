// mouse(/touch) on a canvas

var cwidth, cheight;
var imgData = [], modImgData = [], blobData = [], blobDataRelative = [];
(function(_this){
"use strict";

    _this['interactMouse'] = function(overlap, imgs, selectedBlobs, w, h, modImgs){
        var blobSelected = {};
        // var scrollThresh = 37, previousScrollThresh = 37;
        var scrollThresh = 24, previousScrollThresh = 24;
        // var myblobs1 = [];

        var relativeBlobs = [];
        var clickedBlobs  =  zeros(w * h);//[];
        var clickedBlobsMap = [];
        var dDelta = 0, prevdDelta = 0;
        var stopChanging = false;

        var SELBLOB  = 1;
        var PAINTOUT = 2;
        var PAINTIN  = 3;
        var radio = $('input[name=optradio]:checked', '#myForm').val(); 

        $('#myForm input').on('change', function() {
            radio = $('input[name=optradio]:checked', '#myForm').val(); 
            console.log(radio); 
        });

        var numBlobs = 0, dragging = false;
        var clicked = false;
        var is_mixing_gradients = true;
        var p_offseted = [];
        var ddx = 0, ddy = 0;
        blobSelected = selectedBlobs;
        cwidth = w;
        cheight = h;
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

            var getPointerPositionsIn = function(e){

                var locations = [], // array of x,y pairs (finger locations)
                nLocations = 0, // number of locations
                nTouches, // number of touches to look through
                mx = 0, // mouse position
                my = 0,
                i, iLocation, iTouch; // temp for iterating
            
                if(e.type === "touchstart"
                || e.type === "touchmove"
                || e.type === "touchend"){
                    nTouches = e.touches.length;
                    for(i=0; i<nTouches; i+= 1){
                        nLocations += 1;
                    }
                }else{  
                    nLocations += 1;
                }

                var bRect = result_canvas.getBoundingClientRect();
                for(i=0; i<nLocations; i+=1){
                    locations[i] = { x: 0, y: 0 };
                    mx = ((e.clientX - bRect.left)*(result_canvas.width/bRect.width)) |0;           
                    if( mx > 0 && mx <= result_canvas.width){
                        locations[i].x = mx;
                    }
                    my = ((e.clientY - bRect.top)*(result_canvas.height/bRect.height)) | 0;
                    if( my > 0 && my <= result_canvas.height){
                        locations[i].y = my;
                    }
                }
                return locations;
            };

            var lastPos = [];//null;
            var currPos = [];//null;
            var p_lastPos = null;
            var p_currPos = null;
            var canvas = null;
            var hoveredIn = 0, previusHoveredIn = 0;
            var hoveredInRel = 0, previusHoveredInRel = 0;
        
            return function(id,onChange){
                var localOnChange = (function(onChange){ return function(){
                    onChange();
                }; })(onChange);

                canvas = $(id);
                canvas.width = 0;
                canvas.height = 0;

                canvas.on('touchstart mousedown',function(e){

                    //prevents the mouse down from having an effect on the main browser window:
                    if (e.preventDefault) {
                        e.preventDefault();
                    } //standard
                    else if (e.returnValue) {
                        e.returnValue = false;
                    } //older IE

                    
                    if(radio == SELBLOB){

                        currPos = getPointerPositionsIn(e);
                        //Find out if we have a hit and which shape was clicked
                        for (var i= 1; i < numBlobs + 1; i++) {
                            //the Position
                            var ourPos = (Math.abs(currPos[0].y - p_offseted[i].y) *(result_canvas.width)) + Math.abs(currPos[0].x - p_offseted[i].x);
                            if( blobData[i - 1][0][ourPos] === i){
                                dragging = i;
                                clicked = i;
                                console.log("HIIIIIIIIITT", i, "on", ourPos);
                                
                                console.log(blobSelected);

                                if(clickedBlobs[ourPos]){ // elativeBlobs[i] ||
                                    console.log("already exist");    

                                    hoveredIn = 0;
                                    hoveredInRel = 0;
                                    clicked   = 0; 
                                    var nollStall = clickedBlobs[ourPos];
                                    console.log("noll ställ", clickedBlobs[ourPos]);
                                    //tabort den region som vi clickade i
                                    //kolla vilket nummer den har i clicked blobd och sätt noll där istället
                                    //noll ställ också blobselected
                                    blobSelected[nollStall] = false;
                                    blobSelected[i] = false;
                                    for (var x = 0; x < clickedBlobs.length; x++){
                                        if(clickedBlobs[x] == nollStall){
                                            clickedBlobs[x] = 0;
                                        }                                            
                                    }
                                    console.log(blobSelected);
                                }

                                else{
                                    hoveredIn = i;
                                    hoveredInRel = i;
                                    blobSelected[i] = !blobSelected[i];
                                    console.log("does not exist, create relative blob");
                                    console.log("imd indx",  blobData[clicked - 1][1]);

                                    if(blobData[clicked - 1][1] > 1){

                                        var nrBlobsBefore = 0;
                                        for (var j = 0; j < i; j++){

                                            if(blobData[j][1] < blobData[clicked - 1][1])
                                                nrBlobsBefore++;
                                        }
                                        console.log("nrBlobsBefore", nrBlobsBefore ,"ger:", clicked - nrBlobsBefore);
                                        var theBlobNr = clicked - nrBlobsBefore;
                                        relativeBlobs[i] = new relativeBlobTreshold(i, myblobs1[blobData[clicked - 1][1]].getGauss(), result_canvas.width, result_canvas.height, scrollThresh, ourPos, myblobs1[blobData[clicked - 1][1]].getSize(theBlobNr), imgData[blobData[clicked - 1][1]].data);     

                                    }
                                    else{
                                        relativeBlobs[i] = new relativeBlobTreshold(i, myblobs1[blobData[clicked - 1][1]].getGauss(), result_canvas.width, result_canvas.height, scrollThresh, ourPos, myblobs1[blobData[clicked - 1][1]].getSize(clicked), imgData[blobData[clicked - 1][1]].data);                                             
                                    }                                                                                                
                                    //save the new blob
                                    blobDataRelative[i - 1][0] = relativeBlobs[i].getBlob();
                                    for (var x = 0; x < clickedBlobs.length; x++){
                                        if(blobDataRelative[i - 1][0][x] == i){
                                            clickedBlobs[x] = i;
                                        }                                            
                                    }
                                    // redrawScrean(blobData, imgData, blobSelected, clickedBlobs);
                                }
                            }
                        }
                        // redrawScrean(blobData, imgData, blobSelected, clickedBlobs);
                        getBlobsIgnoreSelected(scrollThresh);
                        // stophere()
                    }


                }).on('touchmove mousemove',function(e){

                    var tmp = lastPos;
                    lastPos = currPos;
                    currPos = getPointerPositionsIn(e,canvas.element);
        
                    var dx = currPos[0].x;
                    var dy = currPos[0].y;
                    if(_.some(blobSelected)){
                        //check if we are inside a selected blob or not
                        var dxx = currPos[0].x - lastPos[0].x;
                        var dyy = currPos[0].y - lastPos[0].y;
                        if( dxx*dxx + dyy*dyy < 32 ){
                            currPos = lastPos;
                            lastPos = tmp;
                        }
                        else{
                            var ourPos = dy * result_canvas.width + dx;
                            previusHoveredInRel = hoveredInRel;

                            hoveredInRel = clickedBlobs[ourPos];

                            previusHoveredIn = hoveredIn;
                            var blobs;
                            var blobArray = [];
                            for( blobs in blobSelected){
                                if(blobSelected[blobs]){
                                    var hoverOver = Number(blobs);
                                    if( blobDataRelative[hoverOver - 1][0][ourPos] !== 0){
                                        hoveredIn = hoverOver;
                                        clicked   = hoverOver;
                                        blobArray.push(1);             
                                    }
                                    else {
                                        blobArray.push(0);
                                    }
                                }
                            }
                            if(!_.contains(blobArray, 1)){
                                hoveredIn = 0;
                                clicked   = 0;
                            }

                            if(previusHoveredIn != hoveredIn){
                                console.log("***************************************************");
                                console.log("REDRAW");
                                console.log(hoveredIn, clicked);
                            }   
                            if(previusHoveredInRel != hoveredInRel){

                                // clicked = hoveredInRel;

                                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                                console.log("REDRAW FOR Hovered In");
                                console.log(hoveredInRel, clicked);
                            }                           
                        }
                    }

                    if( e.preventDefault ){
                        e.preventDefault();
                    }
                }).on('touchend mouseup mouseout',function(e){
                    if(dragging){
                        dragging = false; 
                    }
                }).on('DOMMouseScroll mousewheel',function(e){
                    if (e.preventDefault) {
                        e.preventDefault();
                    } 
                    else if (e.returnValue) {
                        e.returnValue = false;
                    }
                    var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;
                    dDelta += delta;
                    console.log("thres", scrollThresh, "delta", dDelta, dDelta > prevdDelta);

                    if(clicked){
                        if(stopChanging){

                            for (var x = 0; x < clickedBlobs.length; x++){
                                if(clickedBlobs[x] == clicked){
                                    clickedBlobs[x] = 0;
                                }                                            
                            }
                            clicked = 0;
                        }
                        else{
                            if(dDelta > prevdDelta){
                                blobDataRelative[clicked - 1][0] = relativeBlobs[clicked].updateThresholdDecreas();
                                for (var x = 0; x < clickedBlobs.length; x++){
                                    if(blobDataRelative[clicked - 1][0][x] == clicked){
                                        clickedBlobs[x] = clicked;
                                    } else if(clickedBlobs[x] == clicked){
                                        clickedBlobs[x] = 0;
                                    }                                            
                                }
                                // redrawScrean(blobDataRelative, imgData, blobSelected, clickedBlobs);

                            }else if(dDelta < prevdDelta){
                                blobDataRelative[clicked - 1][0] = relativeBlobs[clicked].updateThresholdIncreas();
                                for (var x = 0; x < clickedBlobs.length; x++){
                                    if(blobDataRelative[clicked - 1][0][x] == clicked){
                                        clickedBlobs[x] = clicked;
                                    }                                            
                                }
                                // redrawScrean(blobDataRelative, imgData, blobSelected, clickedBlobs);
                            }
                        }
                        getBlobsIgnoreSelected(scrollThresh);
                    }
                    else{


                        if(delta > 0 && scrollThresh < (550) ){
                            scrollThresh = scrollThresh + 1;
                            previousScrollThresh = scrollThresh;   
                        }else if(delta < 0 && scrollThresh >= 0){
                            scrollThresh = scrollThresh - 1;
                            previousScrollThresh = scrollThresh;
                        }

                        if(_.some(blobSelected)){

                            console.log("Special Case -------------------------------------------");
                            // clickedBlobs = zeros(blobDataRelative[0][0].length);

                            var blobs;
                            for( blobs in blobSelected){
                                if(blobSelected[blobs]){
                                    // printa32(blobData[blobs - 1][0], 32);
                                    //loop throo the whole matrix
                                    for (var x = 0; x < blobData[blobs - 1][0].length; x++){
                                        if(blobDataRelative[blobs - 1][0][x] == blobs){
                                            clickedBlobs[x] = Number(blobs);
                                        }                                            
                                    }
                                }
                            }
                            getBlobsIgnoreSelected(scrollThresh);
                            // getThemBlobs(scrollThresh);
                        }else{
                            getThemBlobs(scrollThresh, false);
                        }
                    }
                    prevdDelta = dDelta;
                });
            };
        })();

        function getBlobsIgnoreSelected(tvalues){
            var globalNumberOfUnique = 0;
            var selctedOrNot = [];
            var blobsChangeFrom = [];
            var blobsChangeTo = [];

            blobDataRelative = [];
            clickedBlobsMap = [];

            for (var xii = 1; xii < imagesRef.length; xii++){
                var overlap = imgData[xii];
                overlap.blobs = myblobs1[xii].compareToThres(tvalues);
                // console.log("image:", xii);
                // printa32(overlap.blobs.data, 32);

                for (var y = 0; y < overlap.blobs.numberOfUnique; y++){          
                    var currentblobindx = y + 1;
                    var blobtmp = zeros(overlap.blobs.data.length);
                    var ignore = false;
                    var clickedBlobsIndx = 0;
                    for (var x = 0; x < overlap.blobs.data.length; x++){

                        if(currentblobindx === overlap.blobs.data[x]){
                            blobtmp[x] = currentblobindx + globalNumberOfUnique;
                            if(clickedBlobs[x] != 0){
                                ignore = true;
                                clickedBlobsIndx = clickedBlobs[x];
                                break;
                            }
                        }
                    }
                    if(ignore){
                        blobtmp = zeros(overlap.blobs.data.length);
                        for (var x = 0; x < overlap.blobs.data.length; x++){
                            if(clickedBlobs[x] == clickedBlobsIndx){
                                blobtmp[x] = currentblobindx + globalNumberOfUnique;
                            }
                        }
                        selctedOrNot.push(true);
                        blobsChangeFrom.push(clickedBlobsIndx); 
                    }
                    else{
                        selctedOrNot.push(false);
                    }

                    blobDataRelative.push([blobtmp, xii]);
                }
                globalNumberOfUnique += overlap.blobs.numberOfUnique;
            }
            
            //vilken som ska vara grön

            blobSelected = {};
            for (var xii = 0; xii < globalNumberOfUnique; xii++){
                if(selctedOrNot[xii]){
                    blobSelected[xii + 1] = true;
                    blobsChangeTo.push(xii + 1);
                }
                else{
                    blobSelected[xii + 1] = false;
                }
            }

            if(blobsChangeFrom.length > 0){
                // console.log("relativeBlobs before", relativeBlobs);
                // console.log("MAKE THE CHANGES ************************", previousScrollThresh < scrollThresh);
                // console.log("from :", blobsChangeFrom);
                // console.log("to   :", blobsChangeTo);
                // console.log("**************** ************************");
                var zipped = _.zip(blobsChangeFrom,blobsChangeTo);
                zipped = _.sortBy(zipped, function(num){ return -num[1]; });
                zipped = _.uniq(zipped, false, function(num) {return num [0];})
                
                var unzipped = _.unzip(zipped);  

                blobsChangeFrom = unzipped[0];
                blobsChangeTo   = unzipped[1];

            }

            for (var ij= 0; ij < blobsChangeFrom.length; ij++){
              
                if(relativeBlobs[blobsChangeFrom[ij]]){
                    relativeBlobs[blobsChangeFrom[ij]].changeId(blobsChangeTo[ij]);
                    changeKey(relativeBlobs, blobsChangeFrom[ij], blobsChangeTo[ij] + 99);
                    stopChanging = false;
                } else{
                    stopChanging = true;
                    break;
                }               
            }

            for (var ij= 0; ij < blobsChangeFrom.length; ij++){
                if(!stopChanging){
                    changeKey(relativeBlobs, blobsChangeFrom[ij] + 99 + (blobsChangeTo[ij] - blobsChangeFrom[ij]), blobsChangeTo[ij]);
                } else{
                    break;
                }
            }
            numBlobs = blobData.length;

            //***************************
            // redrawScrean(blobData, imgData, blobSelected);
            getThemBlobs(scrollThresh, true);
        }; 

        //END of modifying the blobs

        function zeros(size) {
            var array = new Array(size);
            for (var i = 0; i < size; i++) {
                array[i] = 0;
            }
            return array;
        };

        function getThemBlobs(tvalues, fromRel){
            var globalNumberOfUnique = 0;
            blobData = [];

            for (var xii = 1; xii < imagesRef.length; xii++){
                var overlap = imgData[xii];
                // overlap.blobs = myblobs1[xii].compareToThres(tvalues[xii]);
                overlap.blobs = myblobs1[xii].compareToThres(tvalues);
                for (var y = 0; y < overlap.blobs.numberOfUnique; y++){          
                    var currentblobindx = y + 1;
                    var blobtmp = zeros(overlap.blobs.data.length);
                    for (var x = 0; x < overlap.blobs.data.length; x++){
                        if(currentblobindx === overlap.blobs.data[x]){
                            blobtmp[x] = currentblobindx + globalNumberOfUnique;
                        }
                    }
                    blobData.push([blobtmp, xii]);
                    if(!fromRel){
                        blobDataRelative.push([blobtmp, xii]);
                    }
                }
                globalNumberOfUnique += overlap.blobs.numberOfUnique;
            }
            for (var ij= 1; ij < blobData.length + 1; ij++){
                p_offseted[ij] = { x: 0, y: 0 };
            }
            numBlobs = blobData.length;

            redrawScrean(blobData, imgData, blobSelected, clickedBlobs);
        }; 

        return{
            setup: function(theblobs) {

                // myblobs1 = theblobs.slice();
                (function(){    
                    numBlobs = overlap.length;
                    blobData = overlap.slice();
                    blobDataRelative = overlap.slice();
                    imgData = imgs.slice();
                    modImgData = modImgs.slice();
                    for (var ij= 1; ij < numBlobs + 1; ij++){
                            p_offseted[ij] = { x: 0, y: 0 };          
                    }

                    setupOverlay('#blobs',function(){
                        console.log("do nada");
                    });
                    console.log(imgData.length - 1);

                    clickedBlobsMap = [];
                    for (var ij= 1; ij < imgData.length - 1; ij++){
                        clickedBlobsMap.push(zeros(w * h));
                    }

                })();
            },
            setNblobs: function(overlap1, imgs1, selectedBlobs){
                numBlobs = overlap1.length;
                blobData = overlap1.slice();
                imgData = imgs1.slice();
                blobSelected = selectedBlobs;

                for (var ij= 1; ij < numBlobs + 1; ij++){
                    p_offseted[ij] = { x: 0, y: 0 };
                }
            },
            getOffset: function(){
                return p_offseted;
            },
            getBlobSelected: function(){
                getBlobsIgnoreSelected(scrollThresh);
                return blobSelected;
                // relativeBlobs
            }
        };
    };
}(this));

function blend(){
    var cont = _.contains(mouse.getBlobSelected(), true);
    console.log(mouse.getBlobSelected());
    if(cont !== true){    
        console.log("do naada");
        alert("First, select which regions to blend by click them in the image");
        return 0;    
    }
    
    $('#btn1').show();

    //if you would like to see wats going on, choose the out commented lines
    var newcanvas =  document.createElement('CANVAS');//
    // newcanvas = loadCanvas("new-canvas");
    var srccanvas =  document.createElement('CANVAS');//
    // srccanvas = loadCanvas("src-canvas");
    newcanvas.width = srccanvas.width = finalcanvas.width = cwidth;
    newcanvas.height = srccanvas.height = finalcanvas.height = cheight;

    var src_ctx = srccanvas.getContext("2d");
    var new_ctx = newcanvas.getContext("2d");
    var final_ctx = finalcanvas.getContext("2d");
    var offset = mouse.getOffset();

    var firstImg = true;
    for (var i = 0; i <= _.size(mouse.getBlobSelected()); i++){
        if(mouse.getBlobSelected()[i] === true){
            var blobNr = i;

            // src_ctx.putImageData(imgData[1], 0, 0);
            src_ctx.putImageData(modImgData[blobDataRelative[i - 1][1]], 0, 0);
             
            new_ctx.putImageData(imgData[0], 0, 0);
            if(firstImg){
                final_ctx.putImageData(imgData[0], 0, 0);
                firstImg = false;
            }
            var mask_pixels = blobDataRelative[blobNr -1][0];
            var srcData = src_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);
            var mask_data = getMask(mask_pixels, srcData, blobNr);
            console.log("start Blending", blobNr);
            poissonBlendImages(newcanvas, srccanvas, mask_data, finalcanvas, offset[blobNr]);
        }
    }
}

function getMask(mask_pixels, src_pixels, blobNr){

    var extraCanvas =  document.createElement('CANVAS');//loadCanvas("extra-canvas");
    extraCanvas.width = src_pixels.width; extraCanvas.height = src_pixels.height;
    var extraCtx = extraCanvas.getContext("2d");

    var test_pixels = extraCtx.getImageData(0, 0, src_pixels.width, src_pixels.height);
    var dptr_s = 0;
    for(var y=0; y<src_pixels.height; y++) {
        for(var x=0; x<src_pixels.width; x++, dptr_s+=1) {

            var p = dptr_s*4;//;(y*src_pixels.width+x)*4;

            if(mask_pixels[dptr_s] === blobNr){
                test_pixels.data[p+0] = 0; 
                test_pixels.data[p+1] = 255;
                test_pixels.data[p+2] = 0 ; 
                test_pixels.data[p+3] = 255;
            }
            else{
                test_pixels.data[p+0] = src_pixels.data[p+0];
                test_pixels.data[p+1] = src_pixels.data[p+1];
                test_pixels.data[p+2] = src_pixels.data[p+2];
                test_pixels.data[p+3] = src_pixels.data[p+3];
            }
        }
    }
    extraCtx.putImageData(test_pixels, 0, 0);

    return extraCanvas;//extraCtx.getImageData(0, 0, src_pixels.width, src_pixels.height);
}

function changeKey(o, old_key, new_key){

    if (old_key !== new_key) {
        Object.defineProperty(o, new_key,
        Object.getOwnPropertyDescriptor(o, old_key));
        delete o[old_key];
    }
}