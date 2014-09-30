//main worjer handeler

"use strict";

document.addEventListener("DOMContentLoaded", init, false);

function pipe_opt(){
    this.descriptor_radius = 8;
    this.corner_threshold = 45;
    this.lowe_criterion = 0.8;
   	this.ransac_iter = 1500;
    this.ransac_inlier_threshold = 3 * 0.01;
}
var myDescriptors = [];
var my_opt = new pipe_opt();
var stat = new profiler();
var statMatch = new profiler();

var images = ["../imgs/left.jpg", "../imgs/right.jpg"];
// var images = ["../imgs/P112.jpg", "../imgs/P111.jpg"];
// var images = ["../imgs/IMG_0050.jpg" ,"../imgs/IMG_0051.jpg" ,"../imgs/IMG_0053.jpg"];
var images = ["../imgs/P112.jpg", "../imgs/P110.jpg", "../imgs/P111.jpg"];
//var images = ["../imgs/P112.jpg","../imgs/IMG_0051.jpg", "../imgs/P110.jpg", "../imgs/IMG_0050.jpg" ,"../imgs/IMG_0053.jpg","../imgs/P111.jpg", ];
var canvasDiv = "divStitched";
var canvas = loadCanvas(canvasDiv);
var indx = 0;
var pending_workers = images.length - 1; 

function init() {

	stat.add("load image into browser");
	stat.add("fast corners");
	stat.add("gradientVectors");
	stat.add("descriptors");

	statMatch.add("matching");

	computeFeatures(images[indx++]);
};

function computeFeatures(img){

 	var test_img = myPowerConstructor(img, stat);	
 	test_img.set(canvas, my_opt, whenDataReady);

	function whenDataReady() {
		var pts = test_img.getNuberOfPoints();
		var srcImg = test_img.getSrc();
		var lastIndex = srcImg.lastIndexOf("/");

		myDescriptors.push(test_img.getDescriptor());

		srcImg = srcImg.substring(srcImg.length, lastIndex + 1);
		log_pts.innerHTML += "Img name: " + srcImg + " Nr of pts: " +  pts  + "<br>";	

		if(indx < (images.length)){
			computeFeatures(images[indx++]);
		}
		else{
			indx = 1;
			canvas.width = 0;
			canvas.height = 0;
			statMatch.start("matching");
			doneComputeFeatures();
		}
	};

};


function doneComputeFeatures(){

	
	//console.log("descriptors", myDescriptors[0], myDescriptors[1]);

	//JSON
	var descJSON = {'desc1': myDescriptors[0], 'desc2': myDescriptors[indx], 'thresh' : my_opt.lowe_criterion, 'id': indx -1 };
	launchMatchingWebWorker(descJSON);

	++indx;
	computeNext();
 
};
      	

function computeNext(){
	if(indx < (images.length)){
		console.log("Compute next", images[indx]);
		doneComputeFeatures();
	}
	else{
		console.log("The list should be empty ", indx);	
		//console.log(homographies);
		//warp_App(canvasDiv, homographies, images);
		//startOver();
	}
}


// console.log("start");

function launchMatchingWebWorker(sendData) {

console.log("Start from html script");
var worker = new Worker('matchingWorker.js');
worker.onmessage = function(e) {
    var data = e.data;   
	console.log("done", data.matches.length, data.id);
	pending_workers	-= 1;
  	if (pending_workers <= 0){
  		console.log("Done w matches");
		statMatch.stop("matching");
		log_pts.innerHTML += "<br>" + "Matching time: " + statMatch.log(1) + "ms" ;
		
  	}
};

//start the worker
// worker.postMessage({'cmd':   'CalculatePi', 
//                     'value': document.getElementById("loop").value
//                   });
worker.postMessage(sendData);
}


function loadCanvas(id){

    var canvas = document.createElement('canvas');
    var div = document.getElementById(id); 
    canvas.id     = "calculateDecriptors";
    div.appendChild(canvas);

    return canvas;
};