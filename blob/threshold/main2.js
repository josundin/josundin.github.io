"use strict";

var imagesRef = ["../imgs/IMG_0050.jpg", "../imgs/IMG_0053.jpg"];

var images = ["IMG_0050", "IMG_0053"];
var homographies = [[0.9562448859214783, -0.04059208929538727, 55.0452766418457, 0.002029840601608157, 0.9665254354476929, 11.779176712036133, -0.00005650325692840852, -0.00007099410140654072, 0.9958619475364685]];
var stitch = {};

var canvasDiv = "divStitched";//'CANVAS';


document.addEventListener("DOMContentLoaded", init, false);
function init() {
	var selDiv1 = document.querySelector("#selectedF1");
	
	placeimgs(imagesRef, selDiv1);

	var imageCanvases = {};
	for (var i = 0;i < images.length;i++) {
		$("#"+images[i]).load(function(obj) {
			var elementId = obj.target.id;

			// copy the images to canvases
			// var imagecanvas = document.createElement('CANVAS');
			var imagecanvas = loadCanvas("blobs");
			imagecanvas.width = obj.target.width;
			imagecanvas.height = obj.target.height;
			imagecanvas.getContext('2d').drawImage(obj.target,0,0);
			imageCanvases[elementId] = imagecanvas;
			console.log(imageCanvases);
		});
	}
    
	console.log(imageCanvases);

    //doStuff
    // stitch = imagewarp(canvasDiv, homographies, imageCanvases, blobStuff);
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


function loadCanvas(id){

    var canvas = document.createElement('canvas');
    // canvas.style=("border:1px solid #000000;");
    var div = document.getElementById(id); 
    canvas.id     = "calculateDecriptors";
    div.appendChild(canvas);

    return canvas;
};


function blobStuff(){
	console.log("blobStuff");
}

function findScale(){
	return 1;
}
