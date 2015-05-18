// mouse(/touch) on a canvas

var cwidth, cheight;
var imgData = [], modImgData = [], blobData = [];
(function(_this){
"use strict";

    _this['interactMouse'] = function(overlap, imgs, selectedBlobs, w, h, modImgs){
        var blobSelected = {};
        var scrollThresh = 24, previousScrollThresh = 24;
        // var myblobs1 = [];

        var relativeBlobs = {};
        var relativeBlobsIndxs = [];
        var clickedBlobs  = [];
        var dDelta = 0, prevdDelta = 0;

        var SELBLOB  = 1
        var PAINTOUT = 2
        var PAINTIN  = 3
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
                                hoveredIn = i;
                                console.log("HIIIIIIIIITT", i, "on", ourPos);
                                blobSelected[i] = !blobSelected[i];
                                console.log(blobSelected);

                                if(relativeBlobs[i]){
                                    console.log("already exist");
                                    // previusHoveredIn = 0;
                                    // hoveredIn = 0;
                                    // clicked = 0;
                                    // relativeBlobs[i] = 0;
                                }

                                else{
                                    console.log("does not exist, create relative blob");

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
                                    blobData[i - 1][0] = relativeBlobs[i].getBlob();
                                    redrawScrean(blobData, imgData, blobSelected, hoveredIn);
                                }

                                //break;
                            }
                        }
                        redrawScrean(blobData, imgData, blobSelected, hoveredIn);
                        // stophere()
                    }
                    else if(radio == PAINTIN || radio == PAINTOUT){

                        dragging = true;
                        
                        var dx = currPos[0].x;
                        var dy = currPos[0].y;
                        blobData[clicked - 1][0] = myblobs1[blobData[ clicked - 1 ][1]].paint(clicked, dx, dy, radio);
                       
                        // redrawScrean(blobData, imgData, blobSelected);
                        redrawScrean(blobData, imgData, blobSelected, hoveredIn);

                    }


                }).on('touchmove mousemove',function(e){

                    var tmp = lastPos;
                    lastPos = currPos;
                    currPos = getPointerPositionsIn(e,canvas.element);
        
                    var dx = currPos[0].x;
                    var dy = currPos[0].y;
                    if(dragging && clicked && (radio == PAINTIN || radio == PAINTOUT)){
                        blobData[clicked - 1][0] = myblobs1[blobData[ clicked - 1 ][1]].paint(clicked, dx, dy, radio);
                        var dxx = currPos[0].x - lastPos[0].x;
                        var dyy = currPos[0].y - lastPos[0].y;
                        if( dxx*dxx + dyy*dyy < 32 ){
                            currPos = lastPos;
                            lastPos = tmp;
                        }
                        else{
                            redrawScrean(blobData, imgData, blobSelected, hoveredIn);

                        }
                    //om någon blob är clickad
                    }else if(_.some(blobSelected)){
                        //check if we are inside a selected blob or not
                        var dxx = currPos[0].x - lastPos[0].x;
                        var dyy = currPos[0].y - lastPos[0].y;
                        if( dxx*dxx + dyy*dyy < 32 ){
                            currPos = lastPos;
                            lastPos = tmp;
                        }
                        else{
                            var ourPos = dy * result_canvas.width + dx;

                            previusHoveredIn = hoveredIn;
                            var blobs;
                            var blobArray = [];
                            for( blobs in blobSelected){
                                if(blobSelected[blobs]){
                                    var hoverOver = Number(blobs);
                                    if( blobData[hoverOver - 1][0][ourPos] !== 0){
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

                            //alt om previus hovered in != hoveredIn 
                            //then redraw screan
                            if(previusHoveredIn != hoveredIn){
                                redrawScrean(blobData, imgData, blobSelected, hoveredIn);

                                // console.log(relativeBlobs[3].id);
                            }
                            
                            // var tes1 = _.countBy(blobSelected , function(num) {
                            //       return num == true ? 'trues': 'false';
                            // });
                            // console.log(tes1['trues'], tes1);
                            
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

                    if(clicked){
                        if(dDelta > prevdDelta){
                            blobData[clicked - 1][0] = relativeBlobs[clicked].updateThresholdDecreas();
                            redrawScrean(blobData, imgData, blobSelected, hoveredIn);


                        }else if(dDelta < prevdDelta){
                            blobData[clicked - 1][0] = relativeBlobs[clicked].updateThresholdIncreas();
                            redrawScrean(blobData, imgData, blobSelected, hoveredIn);
                        }
                    }
                    else{


                        if(_.some(blobSelected)){


                            if(delta > 0 && scrollThresh < (550) ){
                                scrollThresh = scrollThresh + 1;
                                // previousScrollThresh = scrollThresh;   
                            }else if(delta < 0 && scrollThresh >= 0){
                                scrollThresh = scrollThresh - 1;
                                // previousScrollThresh = scrollThresh;
                            }

                            clickedBlobs = zeros(blobData[0][0].length);

                            var blobs;
                            for( blobs in blobSelected){
                                if(blobSelected[blobs]){
                                    //loop throo the whole matrix
                                    for (var x = 0; x < blobData[blobs - 1][0].length; x++){
                                        if(blobData[blobs - 1][0][x] == blobs){
                                            clickedBlobs[x] = Number(blobs);
                                        }                                            
                                    }
                                }
                            }
                            
                            getBlobsIgnoreSelected(scrollThresh);
                            previousScrollThresh = scrollThresh;

                            // blobData[clicked - 1][0]
                        }else{
                            if(delta > 0 && scrollThresh < (550) ){
                                scrollThresh = scrollThresh + 1;
                                
                                getThemBlobs(scrollThresh);
                                
                                previousScrollThresh = scrollThresh;   
                            }else if(delta < 0 && scrollThresh >= 0){
                                scrollThresh = scrollThresh - 1;
                                getThemBlobs(scrollThresh);
                                
                                previousScrollThresh = scrollThresh;
                            }
                        }
                    }
                    prevdDelta = dDelta;
                });
            };
        })();

        function getBlobsIgnoreSelected(tvalues){
            console.log(" getBlobsIgnoreSelected ");
            var globalNumberOfUnique = 0;
            var selctedOrNot = [];
            var blobsChangeFrom = [];
            var blobsChangeTo = [];
            blobData = [];

            for (var xii = 1; xii < imagesRef.length; xii++){
                var overlap = imgData[xii];
                overlap.blobs = myblobs1[xii].compareToThres(tvalues);

                for (var y = 0; y < overlap.blobs.numberOfUnique; y++){          
                    var currentblobindx = y + 1;
                    var blobtmp = zeros(overlap.blobs.data.length);
                    var ignore = false;
                    var clickedBlobsIndx = 0;
                    for (var x = 0; x < overlap.blobs.data.length; x++){

                        if(currentblobindx === overlap.blobs.data[x]){
                            blobtmp[x] = currentblobindx + globalNumberOfUnique;
                            if(clickedBlobs[x] != 0){
                                console.log("ignore this########################################", blobtmp[x], x);
                                ignore = true;
                                clickedBlobsIndx = clickedBlobs[x];
                                break;
                            }
                        }
                    }
                    if(ignore){ // &&  !_.contains(blobsChangeFrom, clickedBlobsIndx) 
                        blobtmp = zeros(overlap.blobs.data.length);
                        for (var x = 0; x < overlap.blobs.data.length; x++){
                            if(clickedBlobs[x] == clickedBlobsIndx){
                                blobtmp[x] = currentblobindx + globalNumberOfUnique;
                            }
                        }
                        // if(!_.contains(blobsChangeFrom, clickedBlobsIndx)){
                            selctedOrNot.push(true);
                            console.log("den :", clickedBlobsIndx);
                            blobsChangeFrom.push(clickedBlobsIndx);    
                        // }
                        // else{
                        //     console.log("MISS", selctedOrNot)
                        // }
                        
                    }
                    else{
                        selctedOrNot.push(false);
                    }
                    blobData.push([blobtmp, xii]);
                }
                globalNumberOfUnique += overlap.blobs.numberOfUnique;
            }

            blobSelected = {};
            for (var xii = 0; xii < globalNumberOfUnique; xii++){
                if(selctedOrNot[xii]){
                    blobSelected[xii + 1] = true;
                    console.log("till :", xii + 1);
                    blobsChangeTo.push(xii + 1);

                }
                else{
                    blobSelected[xii + 1] = false;
                }
            }
            for (var ij= 1; ij < blobData.length + 1; ij++){
                p_offseted[ij] = { x: 0, y: 0 };
            }

            if(blobsChangeFrom.length > 0){
                console.log("relativeBlobs before", relativeBlobs);
                console.log("MAKE THE CHANGES ************************", previousScrollThresh < scrollThresh);
                console.log("from :", blobsChangeFrom);
                console.log("to   :", blobsChangeTo);
                console.log("**************** ************************");
                var zipped = _.zip(blobsChangeFrom,blobsChangeTo);
                console.log("zipped", zipped);
                // if(previousScrollThresh < scrollThresh){
                //     zipped = _.sortBy(zipped, function(num){ return -num[1]; });
                // }
                // else{
                //     zipped = _.sortBy(zipped, function(num){ return num[1]; });
                // }
                zipped = _.sortBy(zipped, function(num){ return -num[1]; });
                zipped = _.uniq(zipped, false, function(num) {return num [0];})
                
                var unzipped = _.unzip(zipped);  

                blobsChangeFrom = unzipped[0];
                blobsChangeTo   = unzipped[1];

                console.log("zip unzipped ************************");
                console.log("from :", blobsChangeFrom);
                console.log("to   :", blobsChangeTo);


                for (var ij= 0; ij < blobsChangeFrom.length; ij++){
                    console.log(ij, relativeBlobs);
                    // if(relativeBlobs[ij]){
                        relativeBlobs[blobsChangeFrom[ij]].changeId(blobsChangeTo[ij]);
                        changeKey(relativeBlobs, blobsChangeFrom[ij], blobsChangeTo[ij] + 99);
                    // }
                }


                for (var ij= 0; ij < blobsChangeFrom.length; ij++){
                    // if(relativeBlobs[ij]){
                        changeKey(relativeBlobs, blobsChangeFrom[ij] + 99 + (blobsChangeTo[ij] - blobsChangeFrom[ij]), blobsChangeTo[ij]);
                    // }
                }

                console.log("relativeBlobs after", relativeBlobs);


                numBlobs = blobData.length;

                console.log("blobSelected Size", _.size(blobSelected), blobSelected);

                redrawScrean(blobData, imgData, blobSelected);

            }
        else{
            console.log("the array is empty", blobSelected);
        }
        }; 

        function zeros(size) {
            var array = new Array(size);
            for (var i = 0; i < size; i++) {
                array[i] = 0;
            }
            return array;
        };

        function getThemBlobs(tvalues){
            console.log(" get them, ");
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
                }
                globalNumberOfUnique += overlap.blobs.numberOfUnique;
            }
            blobSelected = {};
            for (var xii = 0; xii < globalNumberOfUnique; xii++){
                blobSelected[xii + 1] = false;
            }
            for (var ij= 1; ij < blobData.length + 1; ij++){
                p_offseted[ij] = { x: 0, y: 0 };
            }
            numBlobs = blobData.length;

            redrawScrean(blobData, imgData, blobSelected);

        }; 

        return{
            setup: function(theblobs) {

                // myblobs1 = theblobs.slice();
                (function(){    
                    numBlobs = overlap.length;
                    blobData = overlap.slice();
                    imgData = imgs.slice();
                    modImgData = modImgs.slice();
                    for (var ij= 1; ij < numBlobs + 1; ij++){
                            p_offseted[ij] = { x: 0, y: 0 };          
                    }

                    setupOverlay('#blobs',function(){
                        console.log("do nada");
                    });
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
                return blobSelected;
            }
        };
    };
}(this));

function blend(){
    var cont = _.contains(mouse.getBlobSelected(), true);
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
            src_ctx.putImageData(modImgData[blobData[i - 1][1]], 0, 0);
             
            new_ctx.putImageData(imgData[0], 0, 0);
            if(firstImg){
                final_ctx.putImageData(imgData[0], 0, 0);
                firstImg = false;
            }
            var mask_pixels = blobData[blobNr -1][0];
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