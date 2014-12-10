"use strict";

var imagesRefBike = ["../imgs/IMG_0050.jpg", "../imgs/IMG_0053.jpg"];
var imagesRefBike2 = ["../imgs/IMG_0050.jpg", "../imgs/IMG_0053.jpg", "../imgs/IMG_0051.jpg"];
var imagesRefSiencePark = ["../imgs/P1100328.jpg", "../imgs/P1100329.jpg"];
var imagesRefBird = ["../imgs/P1.jpg", "../imgs/P2.jpg"];

var imagesBike = ["IMG_0050", "IMG_0053"];
var imagesBike2 = ["IMG_0050", "IMG_0053", "IMG_0051"];
var imagesSiencePark = ["P1100328","P1100329"];
var imagesBird = ["P1","P2"];

// 50-53
var homographiesBike = [[0.9562448859214783, -0.04059208929538727, 55.0452766418457, 0.002029840601608157, 0.9665254354476929, 11.779176712036133, -0.00005650325692840852, -0.00007099410140654072, 0.9958619475364685]];
// 50-53-51
var homographiesBike2 = [[0.9562448859214783, -0.04059208929538727, 55.0452766418457, 0.002029840601608157, 0.9665254354476929, 11.779176712036133, -0.00005650325692840852, -0.00007099410140654072, 0.9958619475364685],[1.020303726196289, -0.010079147294163704, -42.59284591674805, -0.008457145653665066, 0.9905731081962585, -6.965245246887207, 0.00004839357643504627, -0.00012295154738239944, 0.9988846778869629]]; 
//bird
var homographiesBird = [[1.0095304250717163, -0.016554025933146477, 8.953278541564941, 0.03932776674628258, 1.01807701587677, -168.96636962890625, -0.000007351650765485829, 0.00010901226050918922, 0.9818366169929504]];
// 28-29
var homographiesSiencePark = [[1.3479026556015015, 0.008745760656893253, -210.18344116210938, 0.15344436466693878, 1.1760369539260864, -84.88064575195312, 0.0006413722294382751, 0.00006606439274037257, 0.896777331829071]];

// var images = imagesSiencePark;
// var imagesRef = imagesRefSiencePark; 
// var homographies = homographiesSiencePark;

// var images = imagesBird;
// var imagesRef = imagesRefBird; 
// var homographies = homographiesBird;

var images = imagesBike2;
var imagesRef = imagesRefBike2; 
var homographies = homographiesBike2;

var stitch = {};

var canvasDiv = "divStitched";//'CANVAS';
var imagesReady = false;
var result_canvas;  

var imageCanvases = {};
function enablestart() {
	if (imagesReady) {
		// var startbutton = document.getElementById('startbutton');
		// startbutton.value = "start";
		// startbutton.disabled = null;
		stitch = imagewarp(canvasDiv, homographies, imagesRef, blobStuff);
	}
}

$(window).load(function() {
	imagesReady = true;
	enablestart();
});

var selDiv1 = document.querySelector("#selectedF1");
placeimgs(imagesRef, selDiv1);

for (var i = 0;i < images.length;i++) {
	$("#"+images[i]).load(function(obj) {
		var elementId = obj.target.id;

		// copy the images to canvases
		var imagecanvas = document.createElement('CANVAS');
		// var imagecanvas = loadCanvas("blobs");
		imagecanvas.width = obj.target.width;
		imagecanvas.height = obj.target.height;
		imagecanvas.getContext('2d').drawImage(obj.target,0,0);
		imageCanvases[elementId] = imagecanvas;
	});
}

function placeimgs(images, wdiv){
	var filesArr = Array.prototype.slice.call(images);
	for (var i = 0; i < images.length; i++) 
	{
		var image = new Image();
		image.src = images[i];
		wdiv.appendChild(image);
	}
};

function findScale(){
	return 1;
}

function loadCanvas(id){
    var canvas = document.createElement('canvas');
    var div = document.getElementById(id); 
    canvas.id     = id;
    div.appendChild(canvas);

    return canvas;
};

function blobStuff(){

        var demo_opt = function(){
            this.threshold = 10;
        }

    var blobCanvas = loadCanvas("blobs");
    var mosaic2 = stitch.getMosaic2();
    selectview('bild2', mosaic2);
    document.getElementById('bild2').scrollIntoView(true);

    var globalNumberOfUnique = 0;
    var overlapData = stitch.getOverlap();
    console.log("Length of overlap data ", overlapData.length);
///////////////////////////
    

    // var myblobs1 = findDiff(imgBaseChanels, img1Chanels, overlap1.width, overlap1.height);
    // overlap1.blobs = myblobs1.getData();

    ////// Go find them blobs /////////
    var overlapBase = overlapData[0];
    var imgBaseChanels = getChanels(overlapBase);
    var blobMaps = [];

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    for (var xii = 1; xii < images.length; xii++){
        console.log("h från stack", xii); 

        //Denna ska loopa igenom alla element
        var overlap = overlapData[xii];
        var img1Chanels = getChanels(overlap);

        ////// Go find them blobs //////////
        var myblobs1 = findDiff(imgBaseChanels, img1Chanels, overlap.width, overlap.height);
        overlap.blobs = myblobs1.getData();

        // Separate the aryes
        for (var y = 0; y < overlap.blobs.numberOfUnique; y++){
            
            var currentblobindx = y + 1;
            var blobtmp = zeros(overlap.blobs.data.length);
            for (var x = 0; x < overlap.blobs.data.length; x++){
                if(currentblobindx === overlap.blobs.data[x]){
                    blobtmp[x] = currentblobindx + globalNumberOfUnique;
                }
            }
            // print(blobtmp, 10);
            blobMaps.push([blobtmp, xii]);
        }
        globalNumberOfUnique += overlap.blobs.numberOfUnique;
        console.log(globalNumberOfUnique, overlap.blobs.numberOfUnique,"--------------------------------restart--------------------------------------------");
    }

     console.log("blobMaps length", blobMaps.length , blobMaps);
    // print(blobMaps[0], 10);
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    result_canvas = loadCanvas("blobs");
    redrawScrean(blobMaps, overlapData);
    // blobMan(overlap1, "blobs", overlapData[0]);
    var el = document.getElementById('blobs');
    el.scrollIntoView(true); 

    
    /** gui options*/
    var options = new demo_opt();
    
    var gui = new dat.GUI({ autoPlace: false });
    var customContainer = document.getElementById('thresblobs');
    customContainer.appendChild(gui.domElement);

    var el = document.getElementById('blobs');
/////////////////////////////////////////////////////
        // gui.add(options, "pre_blur_size", 3, 9).step(1);
        // gui.add(options, "pre_sigma", 0, 2);
        // gui.add(options, "post_blur_size", 100, 200).step(10);
        // gui.add(options, "post_sigma", 10, 40);
        var thresholdfunc = gui.add(options, "threshold", 5, 20).step(1);
        // var train_p = gui.add(options, "train_pattern");
        // gui.add(options, 'message');

        thresholdfunc.onChange(function(value) {
          // Fires on every change, drag, keypress, etc.
            overlap1.blobs = myblobs1.compareToThres(value);
            blobMan(overlap1, overlapBase, blobCanvas);
        });

        // thresholdfunc.onFinishChange(function(value) {
        //   // Fires when a controller loses focus.
        //     overlap1.blobs = myblobs1.compareToThres(value);
        //     blobMan(overlap1, overlapBase, blobCanvas);
        // });

        // train_p.onFinishChange(function(value) {
        //   // Fires when a controller loses focus.
        //     overlap1.blobs = myblobs1.getData();
        //     blobMan(overlap1, overlapBase, blobCanvas);
        // });
///////////////////////////////////////////////////////
        el.scrollIntoView(true); 
        

    function getChanels(imageDatar){
        var dptr=0, dptrSingle=0;
        var imgR_f32 = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.F32_t | jsfeat.C1_t);
        var imgG_f32 = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.F32_t | jsfeat.C1_t);
        var imgB_f32 = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.F32_t | jsfeat.C1_t);
        var imgAlpha = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.U8_t | jsfeat.C1_t);

        for (var y = 0; y < imageDatar.height; y++) {
            //lumas[y] = new Array(imagedata.width);
            for (var x = 0; x < imageDatar.width; x++, dptr+=4, dptrSingle+=1) {
                //var i = x * 4 + y * 4;
                //console.log(dptr, dptrSingle);
                imgR_f32.data[dptrSingle] = imageDatar.data[dptr];
                imgG_f32.data[dptrSingle] = imageDatar.data[dptr + 1];
                imgB_f32.data[dptrSingle] = imageDatar.data[dptr + 2];
                imgAlpha.data[dptrSingle] = imageDatar.data[dptr + 3];
            }
        }

        return [imgR_f32, imgG_f32, imgB_f32, imgAlpha];
    };
}
