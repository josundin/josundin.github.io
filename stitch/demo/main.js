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
	var timeProcces = new profiler();
	var statMatch = new profiler();
	var statRansac = new profiler();
	var table1 = document.getElementById('table1');
	//table1.style= "width:100%";
	var table3 = document.getElementById('table3');
	//table3.style= "width:100%";
	var indx = 0;
	var imgNameIndx = 0;
	var homographies = [];
	//var images = ["../imgs/P112.jpg", "../imgs/P110.jpg", "../imgs/P111.jpg"];
	//var images = ["../imgs/P112.jpg", "../imgs/P110.jpg", "../imgs/P111.jpg", "../imgs/IMG_0050.jpg" ,"../imgs/IMG_0051.jpg" ,"../imgs/IMG_0053.jpg"];
	//var images = ["../imgs/P112.jpg","../imgs/IMG_0051.jpg", "../imgs/P110.jpg", "../imgs/IMG_0050.jpg" ,"../imgs/IMG_0053.jpg","../imgs/P111.jpg", ];
	var images = ["../imgs/IMG_0050.jpg" ,"../imgs/IMG_0051.jpg" ,"../imgs/IMG_0053.jpg"];
	//var images = ["../imgs/left.jpg", "../imgs/right.jpg"];
	//var images = ["../imgs/P112.jpg"];
	var imgNames = [];
	
	function init() {

		var log = document.getElementById('log');
		var detInfo = document.getElementById('detInfo');
		var canvas = loadCanvas("divStitched");
		

		timeProcces.add("T1");

		stat.add("load image into browser");
		stat.add("fast corners");
		stat.add("gradientVectors");
		stat.add("descriptors");
		statMatch.add("matching");
		statRansac.add("ransac");

		updateTable(table1 ,'Image name: ', 'Number of pts: ', 'Process time: ');
		updateTable2(table3 ,'Image pair: ', 'Number of matches : ', 'Matching time: ', "Ransac good matches", "Ransac time");


		computeFeatures(images[indx++]);

		function computeFeatures(img){
			timeProcces.start("T1");

		 	var test_img = myPowerConstructor(img, stat);	
		 	test_img.set(canvas, my_opt, whenDataReady);

			function whenDataReady() {
				console.log("Features computed ", indx);
				timeProcces.stop("T1");
				var pts = test_img.getNuberOfPoints();
				var srcImg = test_img.getSrc();
				var lastIndex = srcImg.lastIndexOf("/");

				myDescriptors.push(test_img.getDescriptor());

				srcImg = srcImg.substring(srcImg.length, lastIndex +1);
				//Img name | number of points | time to process
				//log_pts.innerHTML += "Img name: " + srcImg + " Nr of pts: " +  pts + " in: " + "Process time: " + timeProcces.log(1) + " ms" + "<br>";	
				updateTable(table1, srcImg, pts, timeProcces.log(1));

			    ///////////////////////////////////////
				log.innerHTML = stat.log();
				detInfo.innerHTML = "<strong> Detailed info :   " + srcImg + " </strong>";
				imgNames.push(srcImg);

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
	};

////////////////////////////////////////////////////////////////


function doneComputeFeatures(){
	statMatch.start("matching");
    var matching = bruteForceMatching(myDescriptors[0], myDescriptors[indx], my_opt.lowe_criterion);

    matching.set(whenMatchinDone);

    function whenMatchinDone() {
		console.log("Matches computed ", indx);
    	statMatch.stop("matching");
    	var theMatches = matching.getMatches();

    	//updateTable2(table3, " par 1 - 2", theMatches.length, statMatch.log(1), " ", "");
    	if(theMatches.length > 5){
	    	statRansac.start("ransac");
		  	//RASAC to find a good model
	      	var myRansac = ransac(theMatches, my_opt.ransac_inlier_threshold, my_opt.ransac_iter);
	      	myRansac.getHomographie(whenRANSACDone);	
    	}
    	else{
    		updateTable2(table3, imgNames[0] + " -" + imgNames[++imgNameIndx] , theMatches.length, statMatch.log(1), 0, 0);
    		//pop imdx in image list
    		images.splice(indx, 1);
    		myDescriptors.splice(indx, 1);
    		//console.log("Images", images);

    		computeNext();

    	}
    	

      	function whenRANSACDone(homography) {
      		
			statRansac.stop("ransac");
      		updateTable2(table3, imgNames[0] + " -" + imgNames[++imgNameIndx], theMatches.length, statMatch.log(1), myRansac.getBestinlier(), statRansac.log(1));
      		homographies.push(homography);
      		++indx;
      		computeNext();
      	}

      	function computeNext(){
      		if(indx < (images.length)){
      			console.log("Compute next pair 0-2 osv ", images[indx]);
      			doneComputeFeatures();
      		}
      		else{
      			console.log("The list should be empty ", indx);	
      			console.log(homographies);
      			warp_App("divStitched", homographies, images);
      		}
      	}
    }
 
};

function updateTable(id, txt1, txt2, text3) {

	var tr = document.createElement('tr');
    var text1 = document.createTextNode(txt1);
	var text2 = document.createTextNode(txt2);
	var text3 = document.createTextNode(text3);
	var td1 = document.createElement('td');
	var td2 = document.createElement('td');
	var td3 = document.createElement('td');
    td1.appendChild(text1);
    td2.appendChild(text2);
    td3.appendChild(text3);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    id.appendChild(tr);
};

function updateTable2(id, txt1, txt2, txt3, txt4, txt5) {

	var tr = document.createElement('tr');
    var text1 = document.createTextNode(txt1);
	var text2 = document.createTextNode(txt2);
	var text3 = document.createTextNode(txt3);
	var text4 = document.createTextNode(txt4);
	var text5 = document.createTextNode(txt5);
	var td1 = document.createElement('td');
	var td2 = document.createElement('td');
	var td3 = document.createElement('td');
	var td4 = document.createElement('td');
	var td5 = document.createElement('td');
    td1.appendChild(text1);
    td2.appendChild(text2);
    td3.appendChild(text3);
    td4.appendChild(text4);
    td5.appendChild(text5);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    id.appendChild(tr);
};

function loadCanvas(id){

    var canvas = document.createElement('canvas');
    var div = document.getElementById(id); 
    canvas.id     = "calculateDecriptors";
    div.appendChild(canvas);

    return canvas;
};