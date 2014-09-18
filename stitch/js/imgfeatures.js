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


		var secret = 111;
		
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

		    callback(that, 0 , my_opt);
	  	};

		function computeFast(image, xoffset, my_opt) {

			var border = my_opt.descriptor_radius; //is relative to the descriptor radius
			var imageData = myCtx.getImageData(xoffset, 0, myImageW, myImageH);
			jsfeat.imgproc.grayscale(imageData.data, myImg_u8.data);
			//prev_count = count;
			image.count = jsfeat.fast_corners.detect(myImg_u8, myCorners, border);
			console.log("cnt", image.count, myCorners.length);
	  	};
	  	///////END corner stuff/////////////////////////////////////////////
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

						setupFastkeypointdetector(my_opt, computeFast);
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
