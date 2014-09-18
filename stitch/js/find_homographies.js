// find_homographies.js
// input: images
// output: homographies

"use strict";



function find_homographies(images, dp){
	function imgObj (imgsrc)
	{
	//this.warpData = 0;
	    this.corners = [];
	    this.count = 0;
	    this.descriptors = [];

	    this.img = new Image();
	    this.img.src = imgsrc;
	}

	function pipe_opt(){

	    this.ransac_iter = 1500;
	    this.ransac_inlier_threshold = 3 * 0.01;//Math.sqrt(5.99 *3); 0.8 
	    this.Lowe_criterion = 0.8;  			//0.9
	    this.descriptor_radius = 8;
	    this.corner_threshold = 45;	//22.5			//15

	    //Gör corner threshold till multiplie
	    // tex m = 45 * (width * height) / (640 * 480) 

	}

	var homographies = [];
	var data_p = [];

	var my_opt = new pipe_opt();

    var imageW = 0;
    var imageH = 0;

    var img_u8 = 0;

	//compute the homographies in order 1-2. 1-3 
	// this is because of the restricted problem within one view

	//baseImage is the first image 
	var baseImage = new imgObj(images[0]);
	console.log(baseImage);
	console.log("First img:" , images[0]);
   
   	// these are the rest of the images
    var imagesList = [];
    for (var i=0; i<images.length - 1; i++)
    {
        imagesList.push(new imgObj(images[i + 1]));
        console.log("img:" , i + 1, images[i + 1]);
    }
    
	var canvas_find = createcanvas();
	var ctx = canvas_find.getContext('2d');


	/////////////////////////////////////////////////////////////
	/// All stuff is made in here
	baseImage.img.onload = function(){

		var scale = findScale(baseImage.img.width, baseImage.img.height);

		imageW = baseImage.img.width * scale |0;  
        imageH = baseImage.img.height * scale |0;

        //my_opt.corner_threshold = 45 * ((imageW * imageH) / (640 * 480)); 
        
        canvas_find.width = imageW;
        canvas_find.height = imageH;
        
        var inOrder = first_base().then(the_rest);

    	function first_base(){
			var done1 = new $.Deferred();
			
   			computeTheStuff(baseImage, computeDetectors);
   			console.log("First", baseImage.img.src, baseImage.count);
			done1.resolve();
        	return done1.promise();
    	}



    	function the_rest(){
    		var done2 = new $.Deferred();

	        // Loop over the rest if the images
	        for (var i=0; i<imagesList.length; i++)
	        {
		    	computeTheStuff(imagesList[i], computeDetectors);

		    	var matches = [];
		      	computeMatches(baseImage, imagesList[i], matches);
		      	console.log("IMG:", i, imagesList[i].img.src, imagesList[i].count);

		      	console.log("num matches", matches.length);

		      	//RASAC to find a good model
		      	var homography = ransac(matches, my_opt.ransac_inlier_threshold, my_opt.ransac_iter);
		      	homographies.push(homography);
		      	//data_p.push(homography[1]);
	        }
	        done2.resolve();
        	return done2.promise();
		}    	

		function computeTheStuff(imageObject, callback){
			
			computeFast( imageObject,0);
			callback(imageObject ,0);
		}
    
    	console.log("DONE finding H");
    	    	
	    //Hide the tmp canvas
	    canvas_find.width = 0;
	    canvas_find.height = 0;
	    //canvas_find.style = ('visibility', 'hidden');
    	
    	dp.resolve();
	
	}

	//return homographies;
	this.H = homographies;
	//this.data = data_p;
	
	///////////////////////////////////////////////////////////////////////
	// Matching 
	function computeMatches( img1, img2, matches){

	/*
	Coordinates of original match and the closest descriptor is stored in
	each column of matches and the distance between the pair is stored in scores. 

	output
	Matches = [ [x and y coordinate in img 1], [x and y coordinate in img 2] ]

	*/

	  //compute the matches N*M matches (N = number of matches in img1, M = number of matches in img2)

	  var dists = [];
	  var test = [];
	  var dista = [];
	  var imgdata = [];
	  
	  for (var i = 0; i < img1.descriptors.length; i++) {
	      dists = [];
	      test = [];
	      for(var j = 0; j < img2.descriptors.length; j++) {
	        dista = computeVectorDistance(img1.descriptors[i][1], img2.descriptors[j][1]);
	        imgdata = [img2.descriptors[j][0], dista];
	        dists.push(imgdata);
	        test.push(dista);
	        //console.log("secound img desc :", j, " distance :", dist);
	      }
	      //sort
	      dists.sort(byDist);
	      //console.log(dists[0][0]);
	      //console.log( "minsta", _.min(test)); 

	      //console.log("distance", dists[0][1]);
	      //Lowe criterion with threshold for these descriptors
	      if((dists[0][1] / dists[1][1] ) < my_opt.Lowe_criterion)
	        matches.push([img1.descriptors[i][0] ,dists[0][0]]);
	       
	    }         
	}


	//Computes the Squared Eucledian distance between the vectors
	function computeVectorDistance(p ,q){
	// dist = dot( (vec1 - vec2).T,(vec1 - vec2))
	//var d = Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2));
	var d = 0;
	for(var i =0; i < p.length; i++)
	  d += Math.pow(p[i] - q[i], 2);

	return Math.sqrt(d);

	}

	function byDist(a, b) {
	  if (a[1] < b[1]) return -1;
	  if (b[1] < a[1]) return 1;
	  return 0;
	}
	////////END matching///////////////////////////////////////////


/////////////////////////////////////////////////////////
	//corner stuff
     // This is sets up the intrestpoint detector stuff
	function setupFastkeypointdetector(image, thres) {

	    img_u8 = new jsfeat.matrix_t(imageW, imageH, jsfeat.U8_t | jsfeat.C1_t);
	    
	    //set corners
	    var i = imageW*imageH;
	    while(--i >= 0) {
	        image.corners[i] = new jsfeat.point2d_t(0,0,0,0);
	    }

	    var threshold = thres;
	    jsfeat.fast_corners.set_threshold(threshold);
  	}



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
	        
	  // render result back to canvas as an option
		if(0)
		  {
		    var data_u32 = new Uint32Array(imageData.data.buffer);
		    render_corners(image.corners, count, data_u32, imageW);
		    ctx.putImageData(imageData, xoffset, 0);  
		  }
		//console.log("corners", image.corners);
  	}

  	//Dispaly the keypoints on the image
    function render_corners(corners, count, img, step) {
	    var pix = (0xff << 24) | (0x00 << 16) | (0xff << 8) | 0x00;
	    for(var i=0; i < count; ++i)
	    {
	        var x = corners[i].x;
	        var y = corners[i].y;
	        var off = (x + y * step);
	        img[off] = pix;
	        img[off-1] = pix;
	        img[off+1] = pix;
	        img[off-step] = pix;
	        img[off+step] = pix;
	    }
  	}
  	///////END corner stuff/////////////////////////////////////////////


	//////////////////////////////////////////////////////////////////////////////
	/// Descriptor stuff
    function computeDetectors(image, xoffset) {
    //computeDetectors: function(image, xoffset){	
      
      //todo make the radius a variable
      var windowRadius = my_opt.descriptor_radius;//my_opt.descriptor_radius;
      var numout = 0;
      var vectors = processing.gradientVectors(canvas_find);
      //var desc = new Array(image.count);
      
      for(var i =0; i < image.count; i++)
      {
        var xpos = image.corners[i].x + xoffset;
        var ypos = image.corners[i].y;

        // [f,d] = vl_sift(I) ;
        image.descriptors[i] = [[xpos, ypos], extractHistogramsFromWindow(xpos,ypos,windowRadius, vectors)];
        //console.log(ypos, xpos, vectors[ypos][xpos]);
        //console.log(desc[i]);
      }

      //image.descriptors.push(desc);
      //console.log(desc);
    }

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


	} 


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
	///////END descriptor stuff//////////////////////////////////////

	function createcanvas( ){

		var tmpCanvas = document.createElement('canvas');
		tmpCanvas.width = imageW;
		tmpCanvas.height = imageH;

		//tmpCanvas.style=("position: absolute; top: 0px; left: 0px;", "border:1px solid #000000;");
		//canvas.style=(" width:640px;height:480px;margin: 10px auto;");

		//add the canvas
		var body = document.getElementsByTagName("body")[0];
		body.appendChild(tmpCanvas);
		tmpCanvas.id="descriptors";
		//body.id="body";

		return tmpCanvas;
	}
	
};