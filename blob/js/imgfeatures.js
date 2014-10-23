//imgfeatures
/*///////////////////////////////////////////////////////////////////
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
			var vectors = processing.gradientVectors(this_canvas);

			var desc = new Array(that.count);
			for(var i =0; i < that.count; i++)
			{
				var xpos = that.corners[i].x;
				var ypos = that.corners[i].y;
				that.descriptors[i] = [[xpos, ypos], extractHistogramsFromWindow(xpos,ypos,windowRadius, vectors)];
			}
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
		};

		function zeros(size) {
			var array = new Array(size);
			for (var i = 0; i < size; i++) {
			array[i] = 0;
			}
			return array;
		};
		///////END descriptor stuff//////////////////////////////////////


		return {
			set: function(this_canvas, my_opt, callback) {

				//initialize the image resolution
			    that.img.onload = function() {
			    	var scale = findScale(that.img.width, that.img.height);
			        
			        myImageW = that.img.width * scale |0;  
					myImageH = that.img.height * scale |0;
					this_canvas.width = myImageW;
					this_canvas.height = myImageH;
					myCtx = this_canvas.getContext('2d');
			 		myCtx.drawImage(this, 0, 0, myImageW, myImageH);
					setupFastkeypointdetector(my_opt, computeFast);
					computeDetectors(this_canvas, my_opt.descriptor_radius); 					
					
					callback();
				};
		
			return;
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
        	},
        	getSrc: function() {
        		var src = that.img.src;
				 return src;
        	}
	    };
	};
}(this));
