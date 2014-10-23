//findDiff.js
// Input the two images


(function(_this){
"use strict";

	// _this['findDiff'] = function(img1, im2, canvas, callback){
	_this['findDiff'] = function(img1, img2, myImageW, myImageH){

		
		var myBlobs = computeGaussians();
		// dispImg(img2.imageData);

		// callback();

		function computeGaussians(){

			var kernelSizePre = 5;
			var sigmaPre = 0.5;
			var kernelSizePost = 161;
			var sigmaPost = 20;
			// var kernelSizePost = 9;
			// var sigmaPost = 1;
	        
	        var diff = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.F32_t | jsfeat.C1_t);

			//diff per channel, normalized by 3
			for (var i = 0; i < 3; i++)
			{
				var img1GaussBlur = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.F32_t | jsfeat.C1_t);
				var img2GaussBlur = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.F32_t | jsfeat.C1_t);
		        
		        jsfeat.imgproc.gaussian_blur(img1[i], img1GaussBlur, kernelSizePre, sigmaPre);
	        	jsfeat.imgproc.gaussian_blur(img2[i], img2GaussBlur, kernelSizePre, sigmaPre);

				var tempArray = numeric.sub(img1GaussBlur.data, img2GaussBlur.data);
				tempArray = numeric.abs(tempArray);
				numeric.addeq(diff.data, tempArray);
			}

			numeric.diveq(diff.data, 3);

			//OBS olika resultat med olika datatyper
			console.log("skillnad mellan olika datatyper");
			var diff_u8 = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.U8_t | jsfeat.C1_t);
			var diffGaus_u8 = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.U8_t | jsfeat.C1_t);

			// var diff_u8 = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.F32_t | jsfeat.C1_t);
			// var diffGaus_u8 = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.F32_t | jsfeat.C1_t);

			diff_u8.data = numeric.floor(diff.data);
			
			// do not consider nonOverlap
	        var i = diffGaus_u8.cols*diffGaus_u8.rows;
	        while(--i >= 0) {
	        	if(img2[3].data[i] == 0){
		            diff_u8.data[i] = 0;
	        	}
	        }

			//Post blur
	        jsfeat.imgproc.gaussian_blur(diff_u8, diffGaus_u8, kernelSizePost, sigmaPost);  	

			var blobs = findBlobs(diffGaus_u8.data, myImageW, myImageH, 10);
			console.log("blob nrs", blobs.numberOfUnique);

			return blobs;

		};
		
		return{
        	getData: function() {
				return myBlobs;
        	}
		};
	};
}(this));


