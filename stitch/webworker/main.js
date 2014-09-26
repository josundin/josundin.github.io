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

var images = ["../imgs/left.jpg", "../imgs/right.jpg"];
//var images = ["../imgs/P112.jpg", "../imgs/P111.jpg"];
var canvasDiv = "divStitched";
var canvas = loadCanvas(canvasDiv);
var indx = 0;

function init() {

	// timeProcces.add("T1");

	stat.add("load image into browser");
	stat.add("fast corners");
	stat.add("gradientVectors");
	stat.add("descriptors");

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
			doneComputeFeatures();
		}
	};

};


function doneComputeFeatures(){

console.log("dine features");
//console.log("descriptors", myDescriptors[0], myDescriptors[1]);

//JSON
var descJSON = {'desc1': myDescriptors[0], 'desc2': myDescriptors[1], 'thresh' : my_opt.lowe_criterion, 'id': 0};

console.log(descJSON);
launchMatchingWebWorker(descJSON);
 
};

// console.log("start");

function launchMatchingWebWorker(sendData) {

var sendJSON = {'value': document.getElementById("loop").value};

console.log("Start from html script");
var worker = new Worker('matchingWorker.js');
worker.onmessage = function(e) {
    var data = e.data;
    console.log("done", data.matches.length, data.id);
    switch (data.type) {
        case 'error':
          var msg = 'Input Error: '
          switch (data.code) {
            case 'errInvalidNumber':
              msg += 'Invalid number.';
              break;
            case 'errNegativeNumber':
              msg += 'Input must be positive.';
              break;
          }
          alert(msg);
          break;
        case 'data':
          //document.getElementById("PiValue").innerHTML = data.PiValue;
          break;
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