"use strict";

function pipe_opt(){
    this.descriptor_radius = 8;
    this.corner_threshold = 45;
    this.lowe_criterion = 0.8;
   	this.ransac_iter = 750;
    this.ransac_inlier_threshold = 1 * 0.01;
}
var myDescriptors = [];
var my_opt = new pipe_opt();

var indx = 0;
var canvasDiv = "divStitched";
var canvas = loadCanvas(canvasDiv);
var detInfo = document.getElementById("detinfo");
// var images = ["../imgs/left.jpg", "../imgs/right.jpg"];
// var images = ["imgs/P1100328.jpg", "imgs/P1100329.jpg"];	
//var images = ["../imgs/P112.jpg","../imgs/IMG_0051.jpg", "../imgs/P110.jpg", "../imgs/IMG_0050.jpg" ,"../imgs/IMG_0053.jpg","../imgs/P111.jpg", ];
// var images = ["imgs/P112.jpg", "imgs/P110.jpg", "imgs/P111.jpg"];
// var images = ["imgs/P110.jpg", "imgs/P111.jpg", "imgs/P112.jpg"];
// var images = ["imgs/IMG_0050.jpg", "imgs/IMG_0053.jpg", "imgs/IMG_0051.jpg"];
var images = ["imgs/IMG_0050.jpg", "imgs/IMG_0053.jpg"];
var homographies = [];
var stitch = {};

document.addEventListener("DOMContentLoaded", init, false);
function init() {
	var selDiv1 = document.querySelector("#selectedF1");
	
	placeimgs(images, selDiv1);
 	computeFeatures(images[indx++]);
	
};


function placeimgs(images, wdiv){
	var filesArr = Array.prototype.slice.call(images);
	for (var i = 0; i < images.length; i++) 
	{
		var image = new Image();
		image.src = images[i];
		wdiv.appendChild(image);
	}
};

//Denna är juh rekusiv
function computeFeatures(img){
 	var test_img = myPowerConstructor(img);	
 	test_img.set(canvas, my_opt, whenDataReady);

	function whenDataReady() {
		//console.log("Features computed ", indx);
		var pts = test_img.getNuberOfPoints();
		var srcImg = test_img.getSrc();
		var lastIndex = srcImg.lastIndexOf("/");

		myDescriptors.push(test_img.getDescriptor());

		srcImg = srcImg.substring(srcImg.length, lastIndex +1);


		if(indx < (images.length)){
			computeFeatures(images[indx++]);
		}
		else{
			indx = 1;
			canvas.width = 0;
			canvas.height = 0;
			doneComputeFeatures();
		}
	};
};


function doneComputeFeatures(){
    var matching = bruteForceMatching(myDescriptors[0], myDescriptors[indx], my_opt.lowe_criterion);

    matching.set(whenMatchinDone);

    function whenMatchinDone() {
		//console.log("Matches computed ", indx);
    	var theMatches = matching.getMatches();
    	if(theMatches.length > 27){
		  	//RASAC to find a good model
	      	var myRansac = ransac(theMatches, my_opt.ransac_inlier_threshold, my_opt.ransac_iter);
	      	myRansac.getHomographie(whenRANSACDone);	
    	}
    	else{
    		//pop imdx in image list
    		images.splice(indx, 1);
    		myDescriptors.splice(indx, 1);
    		//console.log("Images", images);

    		computeNext();

    	}
    	

      	function whenRANSACDone(homography) {
      		homographies.push(homography);
      		++indx;
      		computeNext();
      	};

      	function computeNext(){
      		if(indx < (images.length)){
      			doneComputeFeatures();
      		}
      		else{
            // warp_App(canvasDiv, homographies, images);
                console.log("homographies", homographies[0]);
      			stitch = imagewarp(canvasDiv, homographies, images, blobStuff);
      		}
      	};
    }; 
};

function blobStuff(){
    var overlapData = stitch.getOverlap();
    
    var overlap1 = overlapData[1];
    var overlapBase = overlapData[0];

    var imgBaseChanels = getChanels(overlapBase);
    var img1Chanels = getChanels(overlap1);

    // console.log("base    W:", overlapBase.width, "H", overlapBase.height);
    // console.log("overlap W:", overlap1.width, "H", overlap1.height);

    var overlapCanvas = loadCanvas("overlap");
    var overlapCtx = overlapCanvas.getContext("2d");

    overlapCanvas.width = overlap1.width;
    overlapCanvas.height = overlap1.height;
    overlapCtx.putImageData(overlap1, 0, 0); 

    /////////////////////////////////////
    /////////////////////////////////////
    ////// Go find them blobs //////////
    ////////////////////////////////////
    ///////////////////////////////////

    var myblobs1 = findDiff(imgBaseChanels, img1Chanels, overlap1.width, overlap1.height);
    overlap1.blobs = myblobs1.getData();
    blobMan(overlap1, "blobs");
    var el = document.getElementById('blobs');
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


function loadCanvas(id){

    var canvas = document.createElement('canvas');
    // canvas.style=("border:1px solid #000000;");
    var div = document.getElementById(id); 
    canvas.id     = "calculateDecriptors";
    div.appendChild(canvas);

    return canvas;
};