"use strict";

var imagesRef = ["../imgs/IMG_0050.jpg", "../imgs/IMG_0053.jpg"];

var images = ["IMG_0050", "IMG_0053"];
var homographies = [[0.9562448859214783, -0.04059208929538727, 55.0452766418457, 0.002029840601608157, 0.9665254354476929, 11.779176712036133, -0.00005650325692840852, -0.00007099410140654072, 0.9958619475364685]];
var stitch = {};

var canvasDiv = 'CANVAS';
var imagesReady = false;


// document.addEventListener("DOMContentLoaded", init, false);
// function init() {


//     //doStuff
//     // stitch = imagewarp(canvasDiv, homographies, imageCanvases, blobStuff);
// };
var imageCanvases = {};
function enablestart() {
	if (imagesReady) {
		// var startbutton = document.getElementById('startbutton');
		// startbutton.value = "start";
		// startbutton.disabled = null;
		console.log("klar", imageCanvases);
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
		console.log(imageCanvases);
	});
}

console.log(imageCanvases);

function placeimgs(images, wdiv){
	var filesArr = Array.prototype.slice.call(images);
	for (var i = 0; i < images.length; i++) 
	{
		var image = new Image();
		image.src = images[i];
		wdiv.appendChild(image);
	}
};


function loadCanvas(id){

    var canvas = document.createElement('canvas');
    // canvas.style=("border:1px solid #000000;");
    var div = document.getElementById(id); 
    canvas.id     = "calculateDecriptors";
    div.appendChild(canvas);

    return canvas;
};

function findScale(){
	return 1;
}

function blobStuff(){
	console.log("blobStuff");
}

function blobStuff(){
    var overlapData = stitch.getOverlap();
    
    var overlap1 = overlapData[1];
    var overlapBase = overlapData[0];

    var imgBaseChanels = getChanels(overlapBase);
    var img1Chanels = getChanels(overlap1);
    
    ////// Go find them blobs /////////

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
