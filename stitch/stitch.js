//stitch.js
var width = 0;
var height = 0;

//makes as gui options
var stitch_opt = function(){
    this.ransac_iter = 1000;
    this.ransac_inlier_threshold = 1;
    this.Lowe_criterion = 0.8;
    this.descriptor_radius = 8;
    this.corner_threshold = 35;
    this.img1 = "imgs/P1100328.jpg";
    this.img2 = "imgs/P1100329.jpg";
}


window.addEventListener('load', eventWindowLoaded, false);  
function eventWindowLoaded() {
  my_opt = new stitch_opt();
  detector_App();
}


function createcanvas( width, height )
{
  
  var canvas = document.createElement('canvas');
  //canvas.width = width;
  //canvas.height = height;

  canvas.style=("position: absolute; top: 0px; left: 0px;", "border:1px solid #000000;");

  //add the canvas
  var body = document.getElementsByTagName("body")[0];
  body.appendChild(canvas);
  
  return canvas;
}



function detector_App( )
{
  //descriptor variables
  var gui,options,ctx,gridCtx;
  var img_u8, corners, threshold, count;
  var descriptors = new Array();

  var img2Loaded = false;
  var img = new Image();
  var dummy = new Image();
  img.src =  my_opt.img1;
  var canvas = createcanvas();
  var ctx = canvas.getContext('2d');
  img.addEventListener('load', imgLoaded , false);

  var img1Data;

  function imgLoaded() {

    width = canvas.width = img.width;
    height = canvas.height = img.height;
    
    setupFastkeypointdetector(my_opt.corner_threshold);
    computeFast(img, 0);
    computeDetectors(0);

    if(img2Loaded)
    {
      //matches has the dataformat: [[[x1, y1], [x2, y2]]..............[[],[]]]
      var matches = [];
      computeMatches(matches);

      console.log("numbers of matches", matches.length);
      console.log("The matches", matches);
      console.log("my_opt", my_opt);
      placeImgSidebySide(matches);
     
      var bestH = ransac(matches);
      stitch(bestH);
      
    }

    else if(!img2Loaded)
    {
      img2Loaded = true;
      img.src =  my_opt.img2;  
    }
  }


  function placeImgSidebySide(matches){

    //First place the two images next to other.
    canvas.width = width * 2;
    dummy.src = my_opt.img1;
    ctx = canvas.getContext('2d');
    dummy.addEventListener('load', dummyLoaded(matches) , false);

  }


  function dummyLoaded(matches) {
    
    ctx.drawImage(dummy, 0, 0);
    img1Data = ctx.getImageData(0, 0, width *2, height * 2);
    ctx.drawImage(img, width, 0);
    drawMatches(matches);    
  } 


  function drawMatches(matches){
    ctx.lineWidth="1";
    ctx.strokeStyle="rgb(255,0,0)";

    for(var i in matches)
    {
      ctx.moveTo(matches[i][0][0],matches[i][0][1]);
      ctx.lineTo(matches[i][1][0] + width,matches[i][1][1]);
      ctx.stroke();  
    }
  }


  function stitch(bestH){

    var canvas2 = document.createElement('canvas');
    canvas2.width = width * 2;
    canvas2.height = height * 2;

    canvas2.style=("position: absolute; top: 0px; left: 0px;", "border:1px solid #000000;");
  
    //add the canvas
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas2);
    ctx2 = canvas2.getContext('2d');


    ctx2.drawImage(img, 0, 0,  width, height);
    var imageData = ctx2.getImageData(0, 0, width * 2, height * 2 );
    var img_u8_warp, img_u8;

    img_u8 = new jsfeat.matrix_t(width * 2, height * 2, jsfeat.U8_t | jsfeat.C1_t);
    img_u8_warp = new jsfeat.matrix_t(width * 2, height * 2, jsfeat.U8_t | jsfeat.C1_t);


    transform = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);

    transform.data = [0.895631102547577,
                      0.0598650393077765,
                      144.471886478043,
                      -0.0300950416385404,
                      0.875761050039086,
                      24.9868295313110,
                      0.000214010660487613,
                      -0.000115598275298395,
                      1];

    for (var i=0; i<9; i++)
    {
      transform.data[i] = bestH[i];
    }

    //jsfeat.matmath.invert_3x3(transform, transform);
    console.log("transform", transform.data);

    jsfeat.imgproc.grayscale(imageData.data, img_u8.data); 
    jsfeat.imgproc.warp_perspective(img_u8, img_u8_warp, transform, 0);

    var data_u32 = new Uint32Array(imageData.data.buffer);
    var alpha = (0xff << 24);


    var gray_img = new jsfeat.matrix_t(width * 2, height* 2, jsfeat.U8_t | jsfeat.C1_t);
    jsfeat.imgproc.grayscale(img1Data.data, gray_img.data);


    var i = img_u8_warp.cols*img_u8_warp.rows, pix = 0;
    while(--i >= 0) {
        pix = img_u8_warp.data[i] ||  gray_img.data[i]; //
        data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
    }
    //console.log(data_u32);
    
    
    ctx2.putImageData(imageData, 0, 0);
    //ctx2.putImageData(img1Data, 0, 0);

  } 


  function ransac(pairs){
      var bestliers = [];
      

      for (var i=0; i<my_opt.ransac_iter; i++) 
      {
        //Make a sample     
        var sample = _.sample(pairs, 4);
        //remove the samples
        pr = _.difference(pairs, sample);
        //console.log("sample", sample);
        //console.log("pr", pr); 

        //create a new H from the samples
        var H = Solve_8X8(sample);
        currentInliers = [];
        //check all matches for inliers
        for (var j=0; j<pairs.length; j++) 
        {  
          //compute the transformation points
          var Xp = projectPointNormalized(pairs[j][0] ,H);
          var err = backProjectedError(pairs[j][1], Xp);

          //console.log("ERROR", err);            
          if(err < my_opt.ransac_inlier_threshold){
              currentInliers.push(j);
            }
        }

        if(bestliers.length < currentInliers.length)
        {
          bestliers = currentInliers;
        }

      }
      console.log(bestliers.length);
      console.log(pairs);

      ctx.strokeStyle="rgb(0,255,0)";
      ctx.beginPath();

      construcktH = [];
      for(var i in bestliers)
      {
        ctx.moveTo( pairs[bestliers[i]][0][0], pairs[bestliers[i]][0][1]);
        ctx.lineTo( pairs[bestliers[i]][1][0] + width, pairs[bestliers[i]][1][1]);
        ctx.stroke();

        construcktH.push(pairs[bestliers[i]]);  
      }

      var Hbest = Solve_8X8(construcktH);
      console.log(Hbest);
      return Hbest;
    //============================== end of RANSC algorithm ==============================================


  function projectPointNormalized(pt, H){
      var xp = (H[0] * pt[0] + H[1] * pt[1] + H[2]) / (H[6] * pt[0] + H[7] * pt[1] + H[8]);
      var yp = (H[3] * pt[0] + H[4] * pt[1] + H[5]) / (H[6] * pt[0] + H[7] * pt[1] + H[8]);

      return [xp, yp];


    }


    // OBS do not forget to put w=1 in X
    function projectPoint(pt, H){

      X = new jsfeat.matrix_t(1, 3, jsfeat.F32_t | jsfeat.C1_t);
      Xp = new jsfeat.matrix_t(1, 3, jsfeat.F32_t | jsfeat.C1_t);

      X.data = [ pt[0], pt[1], 1];

      jsfeat.matmath.multiply(Xp, H, X);
      
      return [Xp.data[0] / Xp.data[2], Xp.data[1] / Xp.data[2]];
    
    }


     function backProjectedError(p, q){
      //console.log(p[0], p[1], q[0], q[1]);

      return Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2));

     }

  function Solve_8X8(pts) {

    var A = [];

    for(var ii in pts){       
      var i = ii * 16;
      ax = new Array(8);
      ax[0] = pts[ii][0][0];
      ax[1] = pts[ii][0][1];
      ax[2] = 1;
      ax[3] = 0;
      ax[4] = 0;
      ax[5] = 0;
      ax[6] = -pts[ii][0][0] * pts[ii][1][0]; 
      ax[7] = -pts[ii][0][1] * pts[ii][1][0];
       

      ay = new Array(8);
      ay[0]  = 0;
      ay[1]  = 0;
      ay[2] = 0;
      ay[3] = pts[ii][0][0];
      ay[4] = pts[ii][0][1]
      ay[5] = 1;
      ay[6] = -pts[ii][0][0] * pts[ii][1][1];  
      ay[7] = -pts[ii][0][1] * pts[ii][1][1];  
      

      A.push(ax);
      A.push(ay);
    }

    var b = [];

    for(var ii in pts){
      b.push(pts[ii][1][0]);
      b.push(pts[ii][1][1]);
      }

      //solve
      // dot((At, A)̈́^1, (At, b))
      var At  = numeric.transpose(A);
      var AtA = numeric.dot(At, A);
      var AtAinv = numeric.inv(AtA);
      var Atb = numeric.dot(At, b);

      var h = numeric.dot(AtAinv, Atb);
      h.push(1);

      return h;

  }  

    function estimateModel_o( H, points, sample)
    {

    var pts = getIndx(points, sample);
    
    p1 = pts[0];
    p2 = pts[1];

    jsfeat.math.perspective_4point_transform(H, p1[0][0], p1[0][1], p2[0][0], p2[0][1],
                                                p1[1][0], p1[1][1], p2[1][0], p2[1][1],
                                                p1[2][0], p1[2][1], p2[2][0], p2[2][1],
                                                p1[3][0], p1[3][1], p2[3][0], p2[3][1]);
    }

    function estimateModel( H, sam)
    {

                                                //src_x0, src_y0, dst_x0, dst_y0
    jsfeat.math.perspective_4point_transform(H, sam[0][0][0], sam[0][0][1], sam[0][1][0], sam[0][1][1],
                                                sam[1][0][0], sam[1][0][1], sam[1][1][0], sam[1][1][1],
                                                sam[2][0][0], sam[2][0][1], sam[2][1][0], sam[2][1][1],
                                                sam[3][0][0], sam[3][0][1], sam[3][1][0], sam[3][1][1]);
    }


    function getIndx(points, sample)
    {
      //skriv ut i sample ordering
      random_sample_img1 = [];
      random_sample_img2 = [];
      for (var i in sample)
      {
        //put in 2*N format for the estimateModel
        random_sample_img1.push(points[i][0]);
        random_sample_img2.push(points[i][1]);
      }

      return [random_sample_img1, random_sample_img2];
     
    }

  }/*********************** END OF RANSAC functions! ********************/



 function decreasing(a, b) {
    if (a < b) return -1;
    if (b < a) return 1;
    return 0;
  }


function byDist(a, b) {
    if (a[1] < b[1]) return -1;
    if (b[1] < a[1]) return 1;
    return 0;
  }

  function computeMatches(matches)
  {

    /*
    Coordinates of original match and the closest descriptor is stored in
    each column of matches and the distance between the pair is stored in scores. 
    
    output
    Matches = [ [x and y coordinate in img 1], [x and y coordinate in img 2] ]

    */
    
      //compute the matches N*M matches (N = number of matches in img1, M = number of matches in img2)
      
      for (var i = 0; i < descriptors[0].length; i++) {
          dists = [];
          test = [];
          for(var j = 0; j < descriptors[1].length; j++) {
            dista = computeVectorDistance(descriptors[0][i][1], descriptors[1][j][1]);
            imgdata = [descriptors[1][j][0], dista];
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
            matches.push([descriptors[0][i][0] ,dists[0][0]]);
           
        }         
   }


  //Computes the Squared Eucledian distance between the vectors
  function computeVectorDistance(p ,q)
  {
    // dist = dot( (vec1 - vec2).T,(vec1 - vec2))
    //var d = Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2));
    var d = 0;
    for(var i =0; i < p.length; i++)
      d += Math.pow(p[i] - q[i], 2);

    return Math.sqrt(d);
 
  }


  // This is sets up the intrestpoint detector stuff
  function setupFastkeypointdetector(thres)
  {
    img_u8 = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);

    corners = [];
    var i = width*height;
    while(--i >= 0) {
        corners[i] = new jsfeat.point2d_t(0,0,0,0);
    }

    threshold = thres;
    jsfeat.fast_corners.set_threshold(threshold);
  }


  //calculates the intrestpoints
  function computeFast(image, xoffset) {                      

      var border = my_opt.descriptor_radius; //is relative to the descriptor radius
      ctx.drawImage(image, xoffset, 0, width, height);
      var imageData = ctx.getImageData(xoffset, 0, width, height);
      jsfeat.imgproc.grayscale(imageData.data, img_u8.data);
      count = jsfeat.fast_corners.detect(img_u8, corners, border);

      console.log("number of intrestpoints", count);
            
      // render result back to canvas as an option       
      if(0)
      {
        var data_u32 = new Uint32Array(imageData.data.buffer);
        render_corners(corners, count, data_u32, width);
        ctx.putImageData(imageData, xoffset, 0);  
      }
      
  }


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


    function computeDetectors(xoffset) {
      
      //todo make the radius a variable
      var windowRadius = my_opt.descriptor_radius;
      var numout = 0;
      var vectors = processing.gradientVectors(canvas);
      desc = new Array(count);
      
      for(var i =0; i < count; i++)
      {
        var xpos = corners[i].x + xoffset;
        var ypos = corners[i].y;

        // [f,d] = vl_sift(I) ;
        desc[i] = [[xpos, ypos], extractHistogramsFromWindow(xpos,ypos,windowRadius, vectors)];
        //console.log(ypos, xpos, vectors[ypos][xpos]);
        //console.log(desc[i]);
        //drawcell(canvas, xpos, ypos, windowRadius);
      }

      descriptors.push(desc);
      //console.log(desc);
    }
      


    function extractHistogramsFromWindow(x,y, radius, vectors) 
    {
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


    //Draw the cell window
    function drawcell(canvas, x, y, radius)
    {
      var ctxs=canvas.getContext("2d");

      ctx.lineWidth="1";
      ctx.strokeStyle="rgb(255,0,0)";

      // start-x, start-y, x long, y long
      ctx.rect(x-radius , y-radius, radius/2, radius/2);
      ctx.rect(x-(radius/2) , y-radius, radius/2, radius/2);
      ctx.rect(x , y-radius, radius/2, radius/2);
      ctx.rect(x +(radius/2) , y-radius, radius/2, radius/2);

      ctx.rect(x-radius , y-radius/2, radius/2, radius/2);
      ctx.rect(x-(radius/2) , y-radius/2, radius/2, radius/2);
      ctx.rect(x , y-radius/2, radius/2, radius/2);
      ctx.rect(x +(radius/2) , y-radius/2, radius/2, radius/2);

      ctx.rect(x-radius , y, radius/2, radius/2);
      ctx.rect(x-(radius/2) , y, radius/2, radius/2);
      ctx.rect(x , y, radius/2, radius/2);
      ctx.rect(x +(radius/2) , y, radius/2, radius/2);

      ctx.rect(x-radius , y+radius/2, radius/2, radius/2);
      ctx.rect(x-(radius/2) , y+radius/2, radius/2, radius/2);
      ctx.rect(x , y+radius/2, radius/2, radius/2);
      ctx.rect(x +(radius/2) , y+radius/2, radius/2, radius/2);

      ctx.stroke();
    }

  }


  function sign_n(x) { return x ? x < 0 ? true : false : 0; }

  /*
    Provide the x, y cordinates of the upper left corner of the cell
  */
  function extractHistogramsFromCell(x,y, cellradius, gradients) 
  {
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


