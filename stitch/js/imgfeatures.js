//imgfeatures
/*///////////////////////////////////////////////////////////////////
Make getters and setters for width and hight in order to make the canvas outside this object
////////////////////////////////////////////////////////////////////*/

(function(_this){
"use strict";

	var imgOpt = function(imgsrc){
		this.dummy = 12;
	    this.img = new Image();
	    this.img.src = imgsrc;
	    
		}

	//function myPowerConstructor(x){
	_this['myPowerConstructor'] = function(x){
		var that = new imgOpt(x);

		var myCtx;
		var myImageW;  
        var myImageH;
        var myImg_u8;
        var myCorners = [];

        var log = document.getElementById('log');
		var stat = new profiler();
		stat.add("fast corners");
		
		function sec1(){
		return 11;
		};

		/////////////////////////////////////////////////////////
		//corner stuff
	     // This is sets up the intrestpoint detector stuff
		function setupFastkeypointdetector(my_opt, callback) {
			console.log("setupFast w:", myImageW, "h:",myImageH, my_opt.corner_threshold);
		    myImg_u8 = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.U8_t | jsfeat.C1_t);
		    
		    //set corners
		    var i = myImageW*myImageH;
		    while(--i >= 0) {
		        myCorners[i] = new jsfeat.point2d_t(0,0,0,0);
		    }

		    jsfeat.fast_corners.set_threshold(my_opt.corner_threshold);

		    callback(0 , my_opt);
	  	};


		function computeFast(xoffset, my_opt) {

			var border = my_opt.descriptor_radius; //is relative to the descriptor radius
			var imageData = myCtx.getImageData(xoffset, 0, myImageW, myImageH);
			jsfeat.imgproc.grayscale(imageData.data, myImg_u8.data);
			//prev_count = count;
			that.count = jsfeat.fast_corners.detect(myImg_u8, myCorners, border);
			console.log("cnt", that.count, myCorners.length);
	  	};
	  	///////END corner stuff/////////////////////////////////////////////


		//////////////////////////////////////////////////////////////////////////////
		/// Descriptor stuff
	    function computeDetectors(this_canvas, descriptor_radius) {

			var windowRadius = descriptor_radius;//my_opt.descriptor_radius;
			var numout = 0;
			//var vectors = processing.gradientVectors(this_canvas);
			//var desc = new Array(image.count);

			// for(var i =0; i < image.count; i++)
			// {
			// var xpos = image.corners[i].x + xoffset;
			// var ypos = image.corners[i].y;

			// // [f,d] = vl_sift(I) ;
			// image.descriptors[i] = [[xpos, ypos], extractHistogramsFromWindow(xpos,ypos,windowRadius, vectors)];
			// //console.log(ypos, xpos, vectors[ypos][xpos]);
			// //console.log(desc[i]);
			// }

			// //image.descriptors.push(desc);
			// //console.log(desc);
	    }















		return {
				set: function(this_canvas, my_opt, callback) {

					//initialize the image resolution
				    that.img.onload = function() {
				        myImageW = that.img.width;  
						myImageH = that.img.height;
						this_canvas.width = myImageW;
						this_canvas.height = myImageH;
						myCtx = this_canvas.getContext('2d');
				 		myCtx.drawImage(this, 0, 0);
				 		stat.start("fast corners");

						setupFastkeypointdetector(my_opt, computeFast);
						stat.stop("fast corners");
						computeDetectors(this_canvas, my_opt.descriptor_radius); 
						log.innerHTML = stat.log();
						callback();
					};
			
				return myImageW;
				},
				set_threshold: function(threshold) {
	                _threshold = Math.min(Math.max(threshold, 0), 255);
	                
	                return _threshold;
	        	},

	        	getW: function() {
	        		 return myImageW;
	        }
	    };
	};



}(this));
