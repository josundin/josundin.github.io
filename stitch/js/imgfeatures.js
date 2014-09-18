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

		var myImageW;  
        var myImageH;
        var myImg_u8;


		var secret = 111;
		
		function sec1(){
		return 11;
		};

		/////////////////////////////////////////////////////////
		//corner stuff
	     // This is sets up the intrestpoint detector stuff
		function setupFastkeypointdetector() {
			console.log("setupFast w:", myImageW, "h:",myImageH);
		    myImg_u8 = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.U8_t | jsfeat.C1_t);
		    
		    // //set corners
		    // var i = imageW*imageH;
		    // while(--i >= 0) {
		    //     image.corners[i] = new jsfeat.point2d_t(0,0,0,0);
		    // }

		    // var threshold = thres;
		    // jsfeat.fast_corners.set_threshold(threshold);
	  	};

		 //compute the intrestpoints
		function computeFast(image, xoffset) {
			canvas_find.width = 0;
		    canvas_find.height = 0;


			setupFastkeypointdetector(image, my_opt.corner_threshold);       

			var border = my_opt.descriptor_radius; //is relative to the descriptor radius

			canvas_find.width = imageW;
		    canvas_find.height = imageH;
			ctx.drawImage(image.img, 0, 0, imageW, imageH);
			var imageData = ctx.getImageData(xoffset, 0, imageW, imageH);
			jsfeat.imgproc.grayscale(imageData.data, img_u8.data);
			//prev_count = count;
			image.count = jsfeat.fast_corners.detect(img_u8, image.corners, border);
	  	};
	  	///////END corner stuff/////////////////////////////////////////////
		return {
				set: function(this_canvas, callback) {

					//initialize the image resolution
				    that.img.onload = function() {
				        myImageW = that.img.width;  
						myImageH = that.img.height;
						var ctx = this_canvas.getContext('2d');
				 		ctx.drawImage(this, 0, 0);
				 		console.log("set w:", myImageW, "h:",myImageH);
						//ctx.drawImage(this, 0, 0);
						setupFastkeypointdetector();
						callback();
					};

        			console.log(that);


	 				// console.log(secret);
	 				// console.log(sec1());


			
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
