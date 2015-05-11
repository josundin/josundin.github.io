//findDiff.js
// Input the two images


(function(_this){
"use strict";
	_this['findDiff'] = function(img1, img2, myImageW, myImageH, iid){
		
		var statdiff = new profiler();
		statdiff.add("statdiff");  
		statdiff.start("statdiff");
		var id = iid;

		var gGauss, rGauss;
		var gW = myImageW;
		var gH = myImageH;

		var myBlobs = computeGaussians();
					statdiff.stop("statdiff");
			console.log("Bluring done in:", statdiff.log(1), "ms"); 


		function computeGaussians(){
			var kernelSizePre = 5;
			var sigmaPre = 0.5;
			var kernelSizePost_Relative = 25; //6
			var sigmaPost_Relative = 3; //1

			var kernelSizePost = 120;//161; // 25
			var sigmaPost = 15;//20; // 3

	        var diff = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.F32_t | jsfeat.C1_t);

			//diff per channel, normalized by 3, to remove noice
			for (var i = 0; i < 3; i++)
			{
				var img1GaussBlur = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.F32_t | jsfeat.C1_t);
				var img2GaussBlur = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.F32_t | jsfeat.C1_t);
		        
		        jsfeat.imgproc.gaussian_blur(img1[i], img1GaussBlur, kernelSizePre, sigmaPre);
	        	jsfeat.imgproc.gaussian_blur(img2[i], img2GaussBlur, kernelSizePre, sigmaPre);

				var tempArray = numeric.sub(img1GaussBlur.data, img2GaussBlur.data);
				tempArray = numeric.abs(tempArray);
				//	Pointwise sum x+=y 
				numeric.addeq(diff.data, tempArray);
			}

			numeric.diveq(diff.data, 3);

			//OBS olika resultat med olika datatyper
			// console.log("skillnad mellan olika datatyper");
			// var diff_u8 = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.U8_t | jsfeat.C1_t);
			// var diffGaus_u8 = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.U8_t | jsfeat.C1_t);

			var diff_u8 = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.F32_t | jsfeat.C1_t);
			var diffGaus_u8 = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.F32_t | jsfeat.C1_t);
			var diffGaus_u8_r = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.F32_t | jsfeat.C1_t);

			diff_u8.data = numeric.floor(diff.data);
			
			// do not consider nonOverlap
	        var i = diffGaus_u8.cols*diffGaus_u8.rows;
	        while(--i >= 0) {
	        	if(img2[3].data[i] == 0){
		            diff_u8.data[i] = 0;
	        	}
	        }

	        jsfeat.imgproc.gaussian_blur(diff_u8, diffGaus_u8, kernelSizePost, sigmaPost); 	
	        //					   diff_u8, diffGaus_u8
			var blobs = findBlobs(diffGaus_u8.data, myImageW, myImageH, 24);
			gGauss = diffGaus_u8.data;

			jsfeat.imgproc.gaussian_blur(diff_u8, diffGaus_u8_r, kernelSizePost_Relative, sigmaPost_Relative);
			rGauss = diffGaus_u8_r.data;
			// printa32(numeric.round(gGauss), 32);
			return blobs;

		};
		
		return{
        	getGauss: function() {
				return {"g":gGauss, "r":rGauss}; 
        	},
        	getData: function() {
				return myBlobs;
        	},
        	compareToThres: function(cmpThreshold) {
        		myBlobs = findBlobs(gGauss, gW, gH, cmpThreshold);
				return myBlobs;
        	},
        	getSize: function(blobNr) {
        		var tmp = unique(myBlobs.data);
				return tmp[blobNr];
        	},
        	compareSingleBlob: function(cmpThreshold, blobNr, prevCmpThreshold) {
        		var myBlobsTmp = findBlobs2(myBlobs.data, gGauss, blobNr, gW, gH, cmpThreshold, prevCmpThreshold);
		
				// var newBlobs = {numberOfUnique: myBlobs.numberOfUnique, data: myBlobsTmp.slice()}
				// console.log("newblobs", newBlobs);

				return myBlobsTmp;
        	},
        	paint: function(clicked, xpos, ypos, radioval) {
        		console.log("paint");
        		
        		var inout = 0;
        		if(radioval == 2)
        			inout = 0;
        		else if(radioval == 3)
        			inout = clicked;

		        var pos = (xpos + ypos * gW);
        
		        var nn = pos - gW; 
		        var nnn = pos - 2 * gW; 
		        var ww = pos - 1;
		        var www = pos - 2;
		        var nw = pos - gW - 1;
		        var ne = pos - gW + 1;
		        var ee = pos + 1; 
		        var eee = pos + 2; 
		        var ss = pos + gW;
		        var sss = pos + 2 * gW;
		        var sw = pos + gW - 1; 
		        var se = pos + gW + 1; 

		        if(xpos > 0 && xpos < gW && ypos >= 0 && ypos < gH){
	        		myBlobs.data[pos] = inout;
        		
	        		if(nnn > gW){
	        			myBlobs.data[nnn] = inout;
	        			myBlobs.data[nn] = inout;
	        			myBlobs.data[nw] = inout;
	        			myBlobs.data[ne] = inout;
	        		}
	        		if(www > 3){
	        			myBlobs.data[www] = inout;
	        			myBlobs.data[ww] = inout;
	        		}
	        		if(xpos < (gW - 3)){
	        			myBlobs.data[eee] = inout;
	        			myBlobs.data[ee] = inout;
	        		}
	        		if(ypos < (gH - 2)){
	        			myBlobs.data[sss] = inout;
	        			myBlobs.data[ss] = inout;
		        		myBlobs.data[sw] = inout;
	        			myBlobs.data[se] = inout;
	        		}

			        }
		        else{
		        	console.log("utanför");
		        }

        		// console.log(clicked, xpos, ypos, eee, myBlobs.data.length);
        		// printa(myBlobs.data, 16);

        		function printa(data, myImageH){

				    var dptr = 0;
				    for (var ypsilon = 0; ypsilon < myImageH; ypsilon++) {
				        console.log(
				          data[dptr++], data[dptr++], data[dptr++], data[dptr++], data[dptr++], data[dptr++], data[dptr++], data[dptr++], data[dptr++], data[dptr++], data[dptr++], data[dptr++] , data[dptr++], data[dptr++], data[dptr++], data[dptr++],"  ", ypsilon);    
				    }
				}

				return myBlobs.data.slice();
        	}
		};
	};
}(this));


