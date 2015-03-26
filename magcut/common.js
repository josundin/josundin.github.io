//common.js

function loadCanvas(id){
    var canvas = document.createElement('canvas');
    var div = document.getElementById(id); 
    canvas.id     = id;
    div.appendChild(canvas);

    return canvas;
};

function createImgObj(val){
    var imagesRefTmp = new Array(imagesRef.length);
    var rindx = 0;

    //beroende på val, så sätter vi också H

    if(!computedHs[val].val){
    	imagesRefTmp[rindx++] = imagesRef[val];
	    computedHs[val].val = true;
	    for (var i = 0; i < imagesRef.length; i++){
	        if (i != val){
	            imagesRefTmp[rindx++] = imagesRef[i];
	            computedHs[i].val = false; 
	        }
	    }

        console.log("old", imagesRef);
	    console.log("new", imagesRefTmp);
	    console.log("val", val);
	    console.log("Secound", computedHs);
	    imagesRef = imagesRefTmp;
    }
    
    if(computedHs[val].bool){
    	console.log("DO NORMAL");
    	stitch = imagewarp('CANVAS', computedHs[val].H, imagesRef, blobStuff);
 	 
    }
    else{
    	console.log("DO OTHER STUFF");
    	imgSrcs = imagesRef;
    	index = 0; 
    	hindex = 0;
    	start();
    	// stitch = imagewarp('CANVAS', computedHs[val].H, imagesRef, blobStuff);
    }
    //stitch = imagewarp('CANVAS', homographies, imagesRef, blobStuff);
}

function hComputed(){
    for (var i = 0; i < imagesRef.length; i++){
        if (computedHs[i].val){
            //computedHs[i].val = false;
            computedHs[i] = { val: true, bool: true, H: homographies };
        }
        else{
        	computedHs[i].val = false;
        }
    }
    console.log("third", computedHs);
    stitch = imagewarp('CANVAS', homographies, imagesRef, blobStuff);
}


var finalcanvas =  loadCanvas("final-canvas");
var blobCanvas = loadCanvas("blobs");
result_canvas = loadCanvas("blobs");

function resetView(){
	mouse = {};
	finalcanvas.width  = 0;
	blobCanvas.width  = 0;
	result_canvas.width  = 0;

    hindex = 0;
    index = 0;
    stitchImgs = [];

    computedHs[0].bool = false;
    // computedHs[0].val = false;
    allHomographies = [];
    start();
}


function blobStuff(){

    var demo_opt = function(blobimg){
        this.threshold = 10;
        this.blobMap = blobimg;
    }

    var overlapData = stitch.getOverlap();
    console.log("Length of overlap data ", overlapData.length);
    var myblobs1 = [];
    var blobSelected = {};
    var bmaps = findBlobs();
    var blobMaps = [];

    $('#btn1').hide();
    createButton1();
    var globalNumberOfUnique = 0;

    function findBlobs(){
        globalNumberOfUnique = 0;
        var overlapBase = overlapData[0];
        var imgBaseChanels = getChanels(overlapBase);
        blobMaps = [];
        var gui = new dat.GUI({ autoPlace: false });
        var customContainer = document.getElementById('thresblobs');
        customContainer.appendChild(gui.domElement);

        var thresValues = {};
        for (var xii = 1; xii < images.length; xii++){
            thresValues[xii] = 10;
        }
        for (var xii = 1; xii < images.length; xii++){
            var options = new demo_opt(xii);
            var thresholdfunc = gui.add(options, "threshold", 5, 40).step(1);
            
            thresholdfunc.onChange(function(value) {
                thresValues[this.object.blobMap] = value;
                getThemBlobs(thresValues)
            });
            
            //Denna ska loopa igenom alla element
            var overlap = overlapData[xii];
            var img1Chanels = getChanels(overlap);

            ////// Go find them blobs //////////
            myblobs1[xii] = findDiff(imgBaseChanels, img1Chanels, overlap.width, overlap.height);
            overlap.blobs = myblobs1[xii].getData();
            // Separate the aryes
            for (var y = 0; y < overlap.blobs.numberOfUnique; y++){
                
                var currentblobindx = y + 1;
                var blobtmp = zeros(overlap.blobs.data.length);
                for (var x = 0; x < overlap.blobs.data.length; x++){
                    if(currentblobindx === overlap.blobs.data[x]){
                        blobtmp[x] = currentblobindx + globalNumberOfUnique;
                    }
                }
                blobMaps.push([blobtmp, xii]);
            }
            globalNumberOfUnique += overlap.blobs.numberOfUnique;
        }
        console.log("globalNumberOfUnique", globalNumberOfUnique);
        for (var xii = 0; xii < globalNumberOfUnique; xii++){
            blobSelected[xii + 1] = false;
        }
        return blobMaps;
    }

    $('#ComputingBlobs').hide();
    $('#blobInterface').show();
    $('#poststitch').hide(); 

    mouse = interactMouse(bmaps, overlapData, blobSelected, overlapData[0].width, overlapData[0].height);
    redrawScrean(bmaps, overlapData, blobSelected, mouse.getOffset());

    var el = document.getElementById('blobs');
    el.scrollIntoView(true);

    function getThemBlobs(tvalues){
        globalNumberOfUnique = 0;
        blobMaps = [];

        for (var xii = 1; xii < images.length; xii++){
            var overlap = overlapData[xii];
            overlap.blobs = myblobs1[xii].compareToThres(tvalues[xii]);
            for (var y = 0; y < overlap.blobs.numberOfUnique; y++){          
                var currentblobindx = y + 1;
                var blobtmp = zeros(overlap.blobs.data.length);
                for (var x = 0; x < overlap.blobs.data.length; x++){
                    if(currentblobindx === overlap.blobs.data[x]){
                        blobtmp[x] = currentblobindx + globalNumberOfUnique;
                    }
                }
                blobMaps.push([blobtmp, xii]);
            }
            globalNumberOfUnique += overlap.blobs.numberOfUnique;
        }
        blobSelected = {};
        for (var xii = 0; xii < globalNumberOfUnique; xii++){
            blobSelected[xii + 1] = false;
        }
        mouse.setNblobs(blobMaps, overlapData, blobSelected);
        redrawScrean(blobMaps, overlapData, blobSelected, mouse.getOffset());      
    };

        // thresholdfunc.onFinishChange(function(value) {
        //   // Fires when a controller loses focus.
        // });    

    function getChanels(imageDatar){
        var dptr=0, dptrSingle=0;
        var imgR_f32 = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.F32_t | jsfeat.C1_t);
        var imgG_f32 = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.F32_t | jsfeat.C1_t);
        var imgB_f32 = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.F32_t | jsfeat.C1_t);
        var imgAlpha = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.U8_t | jsfeat.C1_t);

        for (var y = 0; y < imageDatar.height; y++) {
            for (var x = 0; x < imageDatar.width; x++, dptr+=4, dptrSingle+=1) {
                imgR_f32.data[dptrSingle] = imageDatar.data[dptr];
                imgG_f32.data[dptrSingle] = imageDatar.data[dptr + 1];
                imgB_f32.data[dptrSingle] = imageDatar.data[dptr + 2];
                imgAlpha.data[dptrSingle] = imageDatar.data[dptr + 3];
            }
        }
        return [imgR_f32, imgG_f32, imgB_f32, imgAlpha];
    };

    function createButton1(){
        var button = document.createElement("input");
        button.type = "button";
        button.className="btn btn-primary";
        button.value = "reset";
        button.onclick = reset;
        var div = document.getElementById("btn1"); 
        div.appendChild(button);
    }

    function reset(){
        finalcanvas.width = 0;
        finalcanvas.height = 0;
        $('#btn1').hide();
        for (var xii = 0; xii < _.size(blobSelected); xii++){
            blobSelected[xii + 1] = false;
        }
        redrawScrean(bmaps, overlapData, blobSelected, mouse.getOffset()); 
        var el = document.getElementById('blobs');
        el.scrollIntoView(true);
    }
}