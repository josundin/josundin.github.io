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
	_this['myPowerConstructor'] = function(x, stat){
		stat.add("load image into browser");
		stat.add("fast corners");
		stat.add("gradientVectors");
		stat.add("descriptors");

		stat.start("load image into browser");
		var that = new imgOpt(x);
		stat.stop("load image into browser");

		var myCtx;
		var myImageW;  
        var myImageH;
        var myImg_u8;
        //var myCorners = [];
        that.corners = [];
        that.descriptors = [];

		/////////////////////////////////////////////////////////
		//corner stuff
	     // This is sets up the intrestpoint detector stuff
		function setupFastkeypointdetector(my_opt, callback) {
			myImg_u8 = new jsfeat.matrix_t(myImageW, myImageH, jsfeat.U8_t | jsfeat.C1_t);
		    
		    //set corners
		    var i = myImageW*myImageH;
		    while(--i >= 0) {
		        that.corners[i] = new jsfeat.point2d_t(0,0,0,0);
		    }

		    jsfeat.fast_corners.set_threshold(my_opt.corner_threshold);

		    callback(0 , my_opt);
	  	};


		function computeFast(xoffset, my_opt) {

			var border = my_opt.descriptor_radius; //is relative to the descriptor radius
			var imageData = myCtx.getImageData(xoffset, 0, myImageW, myImageH);
			jsfeat.imgproc.grayscale(imageData.data, myImg_u8.data);
			//prev_count = count;
			that.count = jsfeat.fast_corners.detect(myImg_u8, that.corners, border);
	  	};
	  	///////END corner stuff/////////////////////////////////////////////


		//////////////////////////////////////////////////////////////////////////////
		/// Descriptor stuff
	    function computeDetectors(this_canvas, descriptor_radius) {

	    	var windowRadius = descriptor_radius;//my_opt.descriptor_radius;
			var numout = 0;
			stat.start("gradientVectors");
			var vectors = processing.gradientVectors(this_canvas);
			stat.stop("gradientVectors");

			stat.start("descriptors");

			var desc = new Array(that.count);
			for(var i =0; i < that.count; i++)
			{
				var xpos = that.corners[i].x;
				var ypos = that.corners[i].y;
				that.descriptors[i] = [[xpos, ypos], extractHistogramsFromWindow(xpos,ypos,windowRadius, vectors)];
			}

			stat.stop("descriptors");
		 };

	    function extractHistogramsFromWindow(x,y, radius, vectors){

	      var cellradius = radius / 2;
	      
	       var histograms = extractHistogramsFromCell(x-radius, y-radius, cellradius, vectors).concat(
	                        extractHistogramsFromCell(x-(radius/2), y-radius, cellradius, vectors), 
	                        extractHistogramsFromCell(x, y-radius, cellradius, vectors),
	                        extractHistogramsFromCell(x+(radius/2), y-radius, cellradius, vectors),

	                        extractHistogramsFromCell(x-radius, y-(radius/2), cellradius, vectors),
	                        extractHistogramsFromCell(x-(radius/2), y-(radius/2), cellradius, vectors), 
	                        extractHistogramsFromCell(x, y-(radius/2), cellradius, vectors),
	                        extractHistogramsFromCell(x+(radius/2), y-(radius/2), cellradius, vectors),

	                        extractHistogramsFromCell(x-radius, y, cellradius, vectors),
	                        extractHistogramsFromCell(x-(radius/2), y, cellradius, vectors), 
	                        extractHistogramsFromCell(x, y, cellradius, vectors),
	                        extractHistogramsFromCell(x+(radius/2), y, cellradius, vectors),

	                        extractHistogramsFromCell(x-radius, y+(radius/2), cellradius, vectors),
	                        extractHistogramsFromCell(x-(radius/2), y+(radius/2), cellradius, vectors), 
	                        extractHistogramsFromCell(x, y+(radius/2), cellradius, vectors),
	                        extractHistogramsFromCell(x+(radius/2), y+(radius/2), cellradius, vectors)

	                        );

	      norm.L2(histograms);

	      return histograms;
	    }

		/*
		Provide the x, y cordinates of the upper left corner of the cell
		*/
		function extractHistogramsFromCell(x,y, cellradius, gradients) {
			//from x-rad, y-rad till x,y
			var histogram = zeros(8);

			for (var i = 0; i < cellradius; i++) {
			  for (var j = 0; j < cellradius; j++) {
			    var vector = gradients[y + i][x + j];
			    var bin = binFor(vector.orient, 8);
			    histogram[bin] += vector.mag;
			    //console.log("y : ", y + i, "x :", x + j);
			  }
			}

			//console.log("my hist : ", histogram);
			return histogram;
		}; 


		function binFor(radians, bins) {
			var angle = radians * (180 / Math.PI);
			if (angle < 0) {
			  angle += 180;
			}

			// center the first bin around 0
			angle += 90 / bins;
			angle %= 180;

			var bin = Math.floor(angle / 180 * bins);
			return bin;
		}

		function zeros(size) {
			var array = new Array(size);
			for (var i = 0; i < size; i++) {
			array[i] = 0;
			}
			return array;
		}
		///////END descriptor stuff//////////////////////////////////////


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
					
					callback();
				};
		
			return myImageW;
			},
			set_threshold: function(threshold) {
                _threshold = Math.min(Math.max(threshold, 0), 255);
                
                return _threshold;
        	},

        	getNuberOfPoints: function() {
        		var npts = that.count;
        		 return that.count;
        	},
        	getDescriptor: function() {
        		var descr = that.descriptors;
				 return descr;
        	}
	    };
	};



}(this));
