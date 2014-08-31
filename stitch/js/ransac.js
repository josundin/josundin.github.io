//ransac.js

///////RANSAC//////////////////////////////
function ransac(non_norm_pairs, ransac_threshold, ransac_iter){

	var normalzed = new normalize_points(non_norm_pairs);
	//used for the report
	//var datatoplot = [];

	var pairs = normalzed.pts;

	var bestinliers = [];
     
	for (var i=0; i < ransac_iter; i++) 
	{
		//Make a sample     
		var sample = _.sample(pairs, 5);
		 
		//////////////////////////////////
		//create a new H from the samples
		//var H = Solve_8X8(sample);
		var H = Solve_SVD(sample);
		//console.log("H innan", H);
		//H = denorm(normalzed.T1, normalzed.T2, H);
		//console.log("H efter", H);

		//iH: invert H here to save computations
		// but first convert to 3x3 format
		var H3x3 = [[H[0],H[1],H[2]],[H[3],H[4],H[5]],[H[6],H[7],H[8]]];
		var iH = numeric.inv(H3x3);
		var currentInliers = [];
		//check all matches for inliers
		for (var j=0; j<pairs.length; j++) 
		{  

			//calculate error in both images, called Symmetric transfer error in the book 
			var err = Sym_trans_error(pairs[j][0] , pairs[j][1], H, iH);

			//console.log("ERROR", err, j);            
			if(err < ransac_threshold)
			{
			  currentInliers.push(j);
			  //console.log("ERROR", err, i);
			}
		}

		if(bestinliers.length < currentInliers.length)
		{
			//console.log("cuuuuuuuuuuuuuuuuuurrent inliers ", currentInliers.length, i);
			lostep();	  
			  
		}

	}
	
	console.log("best inliers", bestinliers.length);
	console.log(" In/Out ratio ;", bestinliers.length / non_norm_pairs.length );
	//datatoplot.push(bestinliers.length / non_norm_pairs.length);

	if(bestinliers.length >= 7) {
		// ctx.strokeStyle="rgb(0,255,0)";
		// ctx.beginPath();

		var construcktH = [];
		for(var i in bestinliers)
		{
		// ctx.moveTo( pairs[bestinliers[i]][0][0], pairs[bestinliers[i]][0][1]);
		// ctx.lineTo( pairs[bestinliers[i]][1][0] + width, pairs[bestinliers[i]][1][1]);
		// ctx.stroke();

		construcktH.push(pairs[bestinliers[i]]);  
		}

		//var Hbest = Solve_8X8(construcktH);
		var Hbest = Solve_SVD(construcktH);
		Hbest = denorm(normalzed.T1, normalzed.T2, Hbest);

		console.log("h", Hbest);

		return Hbest;
	}
	else
		return -1;

//============================== end of RANSC algorithm ==============================================



    function denorm(T1a, T2a, H_hat){

      // // make H_hat a matrix
      var tmp_h = [ [H_hat[0], H_hat[1], H_hat[2]],
                    [H_hat[3], H_hat[4], H_hat[5]],
                    [H_hat[6], H_hat[7], H_hat[8]]];

// tmp_h = [[0.5442653702683261, 0.048553630466743866, 0.34128643958145793],
//         [-0.05683973379692488, 0.5498128214955385, -0.03564699346169651],
//         [0.0006937786749569595, -0.0000377825123939255, 0.5273947600562368]];


    // ************
    // solve
    // ************
    // dot (T1^⁻1, Ḧ , T2 )
    var T2inv = numeric.inv(T2a);
    var T2invH = numeric.dot(T2inv, tmp_h);
    var T2invHT1 = numeric.dot(T2invH, T1a);

    tmp_h = T2invHT1;//T1HT2;

    return [tmp_h[0][0],tmp_h[0][1],tmp_h[0][2],tmp_h[1][0],tmp_h[1][1],tmp_h[1][2], tmp_h[2][0],tmp_h[2][1], tmp_h[2][2] ]; //

    }





	function normalize_points(pts){

		var pts_img1 = [];
		var pts_img2 = [];

		for(var i=0; i<pts.length; i++)
		{
			pts_img1.push(pts[i][0]);
			pts_img2.push(pts[i][1]);
		}

		var tmp_V1 = hartly_normalization(pts_img1);
		var tmp_V2 = hartly_normalization(pts_img2);

		var T1P1, T2P2 = [];

		T1P1 = tmp_V1[0];
		this.T1 = tmp_V1[1];
		T2P2 = tmp_V2[0];
		this.T2 = tmp_V2[1];

		this.T1P1 = numeric.transpose(T1P1);
		this.T2P2 = numeric.transpose(T2P2);

		//never used
		this.s1 = this.T1[0][0];
		this.s2 = this.T2[0][0];

		var norm_matches = [];

		for(var i=0; i<this.T2P2.length; i++)
		{
			norm_matches.push([ [ this.T1P1[i][0], this.T1P1[i][1] ] , [ this.T2P2[i][0], this.T2P2[i][1] ]]);
		}

		this.pts = norm_matches;

	}


	function to_homogenius(points, size_p){

	var augmented_homogenius_points = []; 

	  for(var i =0; i < size_p; i++)
	  {
	    augmented_homogenius_points.push([points[i][0], points[i][1], 1]);
	  }

	  return augmented_homogenius_points;
	}



	function hartly_normalization(pts){
      	//console.log("pts", pts);
		var T_matrix = normalized_points(pts, pts.length);

		pts = to_homogenius(pts, pts.length);
		pts = numeric.transpose(pts);
		//
		var TtimiesP = numeric.dot(T_matrix, pts);

		//return the normalized points and the normalization matrix T
		return [TtimiesP, T_matrix ]

	 }  



	//Hartleys normalization
	//Returns the 3x3 T matrix as desscribed in the paper:
	//Revisiting Hartley’s Normalized Eight-Point Algorithm
	function normalized_points(crnrs, n_crnrs){
	// console.log("prev_corners", prev_count);
	// console.log("corners", count);

	var m_x1 = 0;
	var m_y1 = 0;
	var av_distance = 0;

	for(var i =0; i < n_crnrs; i++)
	{
		m_x1 += crnrs[i][0];
		m_y1 += crnrs[i][1];
	}

	m_x1 = m_x1 / n_crnrs;
	m_y1 = m_y1 / n_crnrs;

	for(var i =0; i < n_crnrs; i++)
	{
		av_distance += Math.sqrt(Math.pow(crnrs[i][0] - m_x1, 2) + Math.pow(crnrs[i][1] - m_y1, 2));
	}      

	av_distance = av_distance / n_crnrs;

	//console.log("m_x1 :", m_x1 , "m_y1 :", m_y1, "sum_d :", av_distance);

	return [[Math.sqrt(2)/av_distance,0,-m_x1 * (Math.sqrt(2)/av_distance)],
	      [0,Math.sqrt(2)/av_distance,-m_y1 * (Math.sqrt(2)/av_distance)],
	      [0,0,1]];

	}




	function lostep(){
		//var currentloInliers = [];

		if(currentInliers.length >= 7)
		{
			for (var iii=0; iii < 1000; iii++) 
			{
				var losample = _.sample(currentInliers, 6);
				//console.log(" sample", sample);
				var loconstrucktH = [];
				for(var k in losample)
				{
					loconstrucktH.push(pairs[losample[k]]);  
				}
				//console.log(iii, " losample", losample, pairs[0]);
				//console.log(loconstrucktH);
			
				var loH = Solve_SVD(loconstrucktH);
				//loH = denorm(normalzed.T1, normalzed.T2, loH);
				
				// //iH: invert H here to save computations
				// // but first convert to 3x3 format
				var loH3x3 = [[loH[0],loH[1],loH[2]],[loH[3],loH[4],loH[5]],[loH[6],loH[7],loH[8]]];
				var loiH = numeric.inv(loH3x3);

				var current_loInliers = [];


				//check all matches for inliers
				for (var jj=0; jj<pairs.length; jj++) 
				{  

					//calculate error in both images, called Symmetric transfer error in the book 
					var loerr = Sym_trans_error(pairs[jj][0] , pairs[jj][1], loH, loiH);

					//console.log("ERROR", err, j);            
					if(loerr < ransac_threshold)
					{
					  current_loInliers.push(jj);
					  //console.log("ERROR", err, i);
					}
				}

				// om lo-ransac håller med då spar best inliers
				if(bestinliers.length < current_loInliers.length)
				{
					bestinliers = current_loInliers;
					//console.log("cuurr best inliers ", bestinliers.length, iii, i);
				}
			}
		}

	}



	function backProjectedError(p, q){
     	return Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2));
    }



    function Sym_trans_error(pt_img1 , pt_img2, H, Hdinv){


          ////////////////////////////////////////
          /// Calculates distance of data using symmetric transfer error
          /// p.95 in the book
          ///////////////////////////////////////


          /////////////////////////////////////////
          ///////// Error img 1 ////////////

          var Hd = [[H[0],H[1],H[2]],[H[3],H[4],H[5]],[H[6],H[7],H[8]]];  
          var X = [ pt_img1[0], pt_img1[1], 1];
          //xp = Hx
          var Xp = numeric.dot(Hd, X);
    
          var err1 = backProjectedError(pt_img2, [Xp[0]/Xp[2], Xp[1]/Xp[2]]) ;

          /////////////////////////////////////////////////
          ///////// Error img 2 ////////////
          X = [ pt_img2[0], pt_img2[1], 1];
          Xp = numeric.dot(Hdinv, X);

          var err2 = backProjectedError(pt_img1, [Xp[0]/Xp[2], Xp[1]/Xp[2]]) ;

          //return [Xp[0]/Xp[2], Xp[1]/Xp[2]];
          /////////////////////////////////////////////////

          // console.log("err1" ,err1);
          // console.log("err2" ,err2);

          //sum the two errors
          return err1 + err2;
    }



	function Solve_SVD(pts) {

	var A = [];

		for(var ii in pts){       
		  //var i = ii * 16;
		  var ax = new Array(8);
		  ax[0] = pts[ii][0][0];
		  ax[1] = pts[ii][0][1];
		  ax[2] = 1;
		  ax[3] = 0;
		  ax[4] = 0;
		  ax[5] = 0;
		  ax[6] = -pts[ii][0][0] * pts[ii][1][0]; 
		  ax[7] = -pts[ii][0][1] * pts[ii][1][0];
		  ax[8] = -pts[ii][1][0];

		   

		  var ay = new Array(8);
		  ay[0]  = 0;
		  ay[1]  = 0;
		  ay[2] = 0;
		  ay[3] = pts[ii][0][0];
		  ay[4] = pts[ii][0][1]
		  ay[5] = 1;
		  ay[6] = -pts[ii][0][0] * pts[ii][1][1];  
		  ay[7] = -pts[ii][0][1] * pts[ii][1][1];
		  ay[8] = -pts[ii][1][1];  
		  

		  A.push(ax);
		  A.push(ay);
		}

		var th = numeric.svd(A);
		// console.log("SVD", th);
		// console.log("V", th.V);
		var Vt = numeric.transpose(th.V);
		// console.log("Vt", Vt);
		// console.log("H", Vt[8]);

		  return Vt[8];

	}


}
////////END RANSAC/////////////////////////////////////////////////////
