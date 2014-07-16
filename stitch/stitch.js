//stitch.js

"use strict";

var width = 0;
var height = 0;
var canvasSize = [0, 0];
var canvasOffset = [0, 0];
var imaga_from_button  = 0;


//makes as gui options
var stitch_opt = function(){
    this.ransac_iter = 1000;
    this.ransac_inlier_threshold = 1;
    this.Lowe_criterion = 0.8;
    this.descriptor_radius = 8;
    this.corner_threshold = 45;
    this.img1 = [ "imgs/left.jpg", "imgs/right.jpg", "imgs/IMG_0053.jpg", "imgs/IMG_0051.jpg","imgs/P1100328.jpg", "imgs/P1100329.jpg"];
    this.img2 = [ "imgs/right.jpg", "imgs/left.jpg", "imgs/IMG_0051.jpg", "imgs/IMG_0053.jpg","imgs/P1100329.jpg", "imgs/P1100328.jpg"];
}


var my_opt = new stitch_opt();
var img2Loaded = false;
window.addEventListener('load', eventWindowLoaded, false);  
function eventWindowLoaded() {
  //var my_opt = new stitch_opt();
  detector_App();
}




function createcanvas( )
{
  
  var canvas = document.createElement('canvas');
  //canvas.width = width;
  //canvas.height = height;

  canvas.style=("position: absolute; top: 0px; left: 0px;", "border:1px solid #000000;");

  //add the canvas
  var body = document.getElementsByTagName("body")[0];
  body.appendChild(canvas);
  canvas.id="ett";
  body.id="body";

  return canvas;
}

function createButton()
{
  var body = document.getElementsByTagName("body")[0];
  var button = document.createElement("input");
  button.type = "button";
  button.value = "new imgs";
  button.onclick = start;
  button.id = "button";

  body.appendChild(button);
}


function start()
{
  
  var canvasElements=document.getElementById("body");

  console.log("getElementById", canvasElements.childNodes);
  for (var i=0; i<canvasElements.childNodes.length; i++)
    if(canvasElements.childNodes[i].id == "ett" || canvasElements.childNodes[i].id == "tva")
      canvasElements.childNodes[i].remove();

  for (var i=0; i<canvasElements.childNodes.length; i++)
    if(canvasElements.childNodes[i].id == "ett" || canvasElements.childNodes[i].id == "tva")
      canvasElements.childNodes[i].remove();
  for (var i=0; i<canvasElements.childNodes.length; i++)
    if(canvasElements.childNodes[i].id == "ett" || canvasElements.childNodes[i].id == "tva" || canvasElements.childNodes[i].id == "button")
      canvasElements.childNodes[i].remove();

  img2Loaded = false;
  
  if(++imaga_from_button > my_opt.img1.length -1)
    imaga_from_button = 0;

  detector_App();
}


function detector_App( )
{
  
  console.log("***** START ******");

  //descriptor variables
  var gui,options,ctx,gridCtx;
  var img_u8, corners, prev_corners, threshold, count, prev_count;
  var descriptors = new Array();


  var img = new Image();
  var dummy = new Image();
  img.src =  my_opt.img1[imaga_from_button];
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
      console.log("the matches", matches);

      var pts_img1 = [];
      var pts_img2 = [];

      for(var i=0; i<matches.length; i++)
      {
        pts_img1.push(matches[i][0]);
        pts_img2.push(matches[i][1]);
      }

      placeImgSidebySide(matches);

      console.log("pts_img1", pts_img1, pts_img1.length);
      // // console.log("pts_img2", pts_img2);
     
      // var T1 = normalized_points(pts_img1, pts_img1.length);
      // var T2 = normalized_points(pts_img2, pts_img2.length);

      // //console.log("corners", corners);
      // console.log("T1", T1);

      //       //var T2P2 = numeric.dot(T2, homogenius);


      // pts_img1 = to_homogenius(pts_img1, pts_img1.length);
      // T1 = numeric.transpose(T1);
      // var T1P1 = multiplyMatrix(T1, pts_img1);

      // console.log("pts_img1 homogenius", pts_img1);
      // console.log("T1P1", T1P1);


      // pts_img2 = to_homogenius(pts_img2, pts_img2.length);
      // T2 = numeric.transpose(T2);
      // var T2P2 = multiplyMatrix(T2, pts_img2);

      var T1 , T1P1, T2 , T2P2 = [];

      // [T1P1, T1] = hartly_normalization(pts_img1);
      // [T2P2, T2] = hartly_normalization(pts_img2);

      var tmp_V1 = hartly_normalization(pts_img1);
      var tmp_V2 = hartly_normalization(pts_img2);

      T1P1 = tmp_V1[0];
      T1 = tmp_V1[1];

      T2P2 = tmp_V2[0];
      T2 = tmp_V2[1];



      T1P1 = numeric.transpose(T1P1);
      T2P2 = numeric.transpose(T2P2);
    
      var norm_matches = [];

      for(var i=0; i<T2P2.length; i++)
      {
        norm_matches.push([ [ T1P1[i][0], T1P1[i][1] ] , [ T2P2[i][0], T2P2[i][1] ]]);
      }

      console.log("PROVIDE RANSC WITH THIS", norm_matches);

      //*******************************
      // TEST POINT 
      //*******************************
      var test = [];
      test = [ [1, 2],[3, 4], [5, 6], [7,8] ];

      //var T1_test , T1P1_test, T2_test , T2P2_test = [];

      //[T1P1_test, T1_test] = hartly_normalization(test);

     //  console.log("good stuff <matrix:", T1_test, "points", T1P1_test);

     //  var test2 = [ [9, 10], [11, 12], [13, 14], [15, 16] ];
     //  [T2P2_test, T2_test] = hartly_normalization(test2);


     //  var H_hat = [[9,4,7],[2,5,8],[3,6,1]];

     //  denormalize(T1_test, T2_test, H_hat)

     //  var A = [[1,2,3],[4,5,6],[7,3,9]];
     //  var B = [[12,12,13],[24,25,26],[37,33,39]];

     // console.log("H_hat :", H_hat);
     // console.log("A :", A);
     // console.log("B :", B);

     // var AB = numeric.dot(A, B);

     // console.log("AB", AB);

     // AB = multiplyMatrix(numeric.transpose(A),numeric.transpose(B));
     // console.log("AB mul", AB);



      // nästa steg 
      // sätt upp matris för ransac computation
      // Matrisen bör vara 
      // n x 9
      // var av den sista columnen är ett över hela
      
      var bestH = ransac(norm_matches, T1, T2);
      //findCorners(bestH);
      stitch(bestH);

      stitch_color(bestH);      
      
    }

    else if(!img2Loaded)
    {
      img2Loaded = true;
      img.src =  my_opt.img2[imaga_from_button];  
    }
  }

  //Returns the T matrix and the normalized points
  function hartly_normalization(pts)
  {
      console.log("pts", pts);
      var T_matrix = normalized_points(pts, pts.length);
      
      pts = to_homogenius(pts, pts.length);
      pts = numeric.transpose(pts);
      //
      var TtimiesP = numeric.dot(T_matrix, pts);

      //console.log("TtimiesP", TtimiesP, pts);

      return [TtimiesP, T_matrix ]

  }  

  function denormalize(T1, T2, H_hat)
  {

    // ************
    // solve
    // ************
    // dot((T2t, T2)̈́^1, (T2t, H*T1))


    var T2t  = numeric.transpose(T2);
    var T2tT2 = numeric.dot(T2t, T2);
    var T2tT2inv = numeric.inv(T2tT2);
    var HT1 = numeric.dot(H_hat, T1);
    //console.log("HT1", HT1);
    var T2tHT1 = numeric.dot(T2t, HT1);

    var H_norm = numeric.dot(T2tT2inv, T2tHT1);     

    //console.log("H_norm", H_norm);

    return H_norm;
  }


  function multiplyMatrix(m1, m2) 
  {
    var result = [];
    for(var j = 0; j < m2.length; j++) {
        result[j] = [];
        for(var k = 0; k < m1[0].length; k++) {
            var sum = 0;
            for(var i = 0; i < m1.length; i++) {
                sum += m1[i][k] * m2[j][i];
            }
            result[j].push(sum);
        }
    }
    return result;
  }


  function to_homogenius(points, size_p)
  {

    var augmented_homogenius_points = []; 

      for(var i =0; i < size_p; i++)
      {
        augmented_homogenius_points.push([points[i][0], points[i][1], 1]);
      }

      return augmented_homogenius_points;
  }


  //Hartleys normalization
  //Returns the 3x3 T matrix
  function normalized_points(crnrs, n_crnrs)
  {
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



  function placeImgSidebySide(matches){

    //First place the two images next to other.
    canvas.width = width * 2;
    dummy.src = my_opt.img1[imaga_from_button];
    ctx = canvas.getContext('2d');
    dummy.addEventListener('load', dummyLoaded(matches) , false);

  }

  var height_offset = 200;

  function dummyLoaded(matches) {
    
    ctx.drawImage(dummy, 0, 0);
    img1Data = ctx.getImageData(0, 0, width *2, height + height_offset);
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




function stitch_color(bestH){

  //create the common canvas
  var common_canvas = createcanvas_warp("tva");
  common_canvas.width = canvasSize[0];
  common_canvas.height = canvasSize[1];
  var common_ctx = common_canvas.getContext('2d');


  var img1 = new Image();
  img1.src =  my_opt.img1[imaga_from_button];

  img1.onload = function() {
      setupWarp(img1);
      var Homography1 = [1,0,canvasOffset[0],0,1,canvasOffset[1],0,0,1];                    
      applyWarp(img1, Homography1);

    //      console.log("REMOVE CANVAS");
    // var canvasElements=document.getElementById("body");
    // for (var i=0; i<canvasElements.childNodes.length; i++)
    //   if(canvasElements.childNodes[i].id == "warping")
    //     canvasElements.childNodes[i].remove();

    // for (var i=0; i<canvasElements.childNodes.length; i++)
    //   if(canvasElements.childNodes[i].id == "warping")
    //     canvasElements.childNodes[i].remove();

  }

  var img2 = new Image();
  img2.src =  my_opt.img2[imaga_from_button];

  img2.onload = function() {
      setupWarp(img2);
      //var Homography2 =  numeric.dot(bestH, [1,0,canvasOffset[0],0,1,canvasOffset[1],0,0,1]);
      

      var transform = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);
      var transform_dot = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);

      var trans_offset = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);

      trans_offset.data = [1,0,canvasOffset[0],0,1,canvasOffset[1],0,0,1];


      for (var i=0; i<9; i++)
      {
        transform.data[i] = bestH[i];
      }
      jsfeat.matmath.multiply(transform_dot, transform, trans_offset);


      console.log("Homography2:", transform_dot.data);
      // var Atb = numeric.dot(At, b);


      applyWarp(img2, transform_dot.data);

         console.log("REMOVE CANVAS");
    var canvasElements=document.getElementById("body");
    for (var i=0; i<canvasElements.childNodes.length; i++)
      if(canvasElements.childNodes[i].id == "warping")
        canvasElements.childNodes[i].remove();

    for (var i=0; i<canvasElements.childNodes.length; i++)
      if(canvasElements.childNodes[i].id == "warping")
        canvasElements.childNodes[i].remove();

  }



    var tmpctx,canvasWidth,canvasHeight, s_canvas;

    function createcanvas_warp( idname )
    {
      
      var canvas = document.createElement('canvas');
      
 

      canvas.style=("position: absolute; top: 0px; left: 0px;", "border:1px solid #000000;");
      //canvas.style=(" width:640px;height:480px;margin: 10px auto;");

      //add the canvas
      var body = document.getElementsByTagName("body")[0];
      body.appendChild(canvas);
      canvas.id = idname;
      body.id = "body";

      return canvas;
    }


    function setupWarp(den_img) {

        canvas = createcanvas_warp("warping");
        canvas.width = den_img.width;
        canvas.height = den_img.height;
        tmpctx = canvas.getContext('2d');
        tmpctx.drawImage(den_img, 0, 0, den_img.width, den_img.height);
    }

    function applyWarp(den_img, Homography) {

      //https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Pixel_manipulation_with_canvas
      var imageData = tmpctx.getImageData(0, 0, den_img.width , den_img.height );
      //Find out how big the warped canvas should bee
      //var max_img_size = find_max(Homography);
      // create a new image where we will store the warped image
      var imageWarpData = tmpctx.getImageData(0, 0, canvasSize[0], canvasSize[1]);

      warp_perspective_color(imageData, imageWarpData, Homography);
      common_ctx.save;
      common_ctx.globalAlpha = 0.5;
      common_ctx.globalCompositeOperation = 'destination-over'
      common_ctx.putImageData(imageWarpData, 0, 0);
      common_ctx.restore;

      //console.log(imageWarpData);

      //imageWarpData;

    }


    //Bilinear interpolation
    function warp_perspective_color(src, dst, transform)
    {
        var dst_width=dst.width|0, dst_height=dst.height|0;
        var src_width=src.width|0, src_height=src.height|0;

        var x=0,y=0,off=0,ixs=0,iys=0,xs=0.0,ys=0.0,xs0=0.0,ys0=0.0,ws=0.0,sc=0.0,a=0.0,b=0.0,p0r=0.0,p1r=0.0, p0g=0.0,p1g=0.0, p0b=0.0,p1b=0.0;
        var td=transform;
        var m00=td[0],m01=td[1],m02=td[2],
            m10=td[3],m11=td[4],m12=td[5],
            m20=td[6],m21=td[7],m22=td[8];

        var dptr = 0;
        for(var i = 0; i < dst_height; ++i)
        {

            xs0 = m01 * i + m02,
            ys0 = m11 * i + m12,
            ws  = m21 * i + m22;
            for(var j = 0; j < dst_width; j++, dptr+=4, xs0+=m00, ys0+=m10, ws+=m20)
            {
                sc = 1.0 / ws;
                xs = xs0 * sc, ys = ys0 * sc;
                ixs = xs | 0, iys = ys | 0;

                if(xs > 0 && ys > 0 && ixs < (src_width - 1) && iys < (src_height - 1))
                {

                    a = Math.max(xs - ixs, 0.0);
                    b = Math.max(ys - iys, 0.0);
                    //off = (src_width*iys + ixs)|0;
                    off = (( (src.width*4)*iys) + (ixs * 4))|0;

                    p0r = src.data[off] +  a * (src.data[off+4] - src.data[off]);
                    p1r = src.data[off+(src_width*4)] + a * (src.data[off+(src_width*4)+4] - src.data[off+(src_width*4)]);

                    p0g = src.data[off +1] +  a * (src.data[off+4 +1] - src.data[off +1]);
                    p1g = src.data[off+(src_width*4)+1] + a * (src.data[off+(src_width*4)+4 +1] - src.data[off+(src_width*4) +1]);

                    p0b = src.data[off +2] +  a * (src.data[off+4 +2] - src.data[off +2]);
                    p1b = src.data[off+(src_width*4)+2] + a * (src.data[off+(src_width*4)+4 +2] - src.data[off+(src_width*4) +2]);

                    dst.data[dptr + 0] = p0r + b * (p1r - p0r);
                    dst.data[dptr + 1]= p0g + b * (p1g - p0g);
                    dst.data[dptr + 2]= p0b + b * (p1b - p0b);

                    dst.data[((i*(dst.width*4)) + (j*4))+ 3]= 255;
                }
                else
                    dst.data[((i*(dst.width*4)) + (j*4))+ 3]= 0;
            }
        }
    }


}












  function stitch(bestH){

    var canvas2 = document.createElement('canvas');
    canvas2.width = canvasSize[0];
    canvas2.height = canvasSize[1];

    canvas2.style=("position: absolute; top: 0px; left: 0px;", "border:1px solid #000000;");
  
    //add the canvas
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas2);
    canvas2.id= "tva";
    var ctx2 = canvas2.getContext('2d');


    ctx2.drawImage(img, 0, 0,  width, height);
    var imageData = ctx2.getImageData(0, 0, width * 2, height + height_offset );
    
    var img_u8;

    var data_u32 = new Uint32Array(imageData.data.buffer);
    var alpha = (0xff << 24);


    var gray_img = new jsfeat.matrix_t(width * 2, height+ height_offset, jsfeat.U8_t | jsfeat.C1_t);
    var gray_img_warp = new jsfeat.matrix_t(width * 2, height + height_offset, jsfeat.U8_t | jsfeat.C1_t);
    jsfeat.imgproc.grayscale(img1Data.data, gray_img.data);

    var trans_offset = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);

    trans_offset.data = [1,0,canvasOffset[0],0,1,canvasOffset[1],0,0,1];

    //(source:matrix_t, dest:matrix_t,warp_mat:matrix_t, fill_value = 0);
    jsfeat.imgproc.warp_perspective(gray_img, gray_img_warp, trans_offset, 0);


    var img_u8_warp = new jsfeat.matrix_t(width * 2, height + height_offset, jsfeat.U8_t | jsfeat.C1_t);
    img_u8_warp = warpPerspective();

    var i = img_u8_warp.cols*img_u8_warp.rows;
    var pix = 0;
    while(--i >= 0) {
        pix = img_u8_warp.data[i] ||  gray_img_warp.data[i]; //
        data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
    }
    //console.log(data_u32);
    
    
    ctx2.putImageData(imageData, 0, 0);
    //ctx2.putImageData(img1Data, 0, 0);
    createButton();

    // inputs 
    function warpPerspective() 
    {

      var img_u8 = new jsfeat.matrix_t(width * 2, height + height_offset, jsfeat.U8_t | jsfeat.C1_t);
      var img_u8_warp = new jsfeat.matrix_t(width * 2, height + height_offset, jsfeat.U8_t | jsfeat.C1_t);
      var transform = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);
      var transform_dot = new jsfeat.matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);


      for (var i=0; i<9; i++)
      {
        transform.data[i] = bestH[i];
      }

      jsfeat.imgproc.grayscale(imageData.data, img_u8.data); 
       //(source:matrix_t, dest:matrix_t,warp_mat:matrix_t, fill_value = 0);
      jsfeat.matmath.multiply(transform_dot, transform, trans_offset);
      jsfeat.imgproc.warp_perspective(img_u8, img_u8_warp, transform_dot, 0);

      console.log("transform_dot:", transform_dot.data);
    
      return img_u8_warp;

    }

  } 




  function ransac(pairs , T1 , T2){
      var bestliers = [];
      

      for (var i=0; i<my_opt.ransac_iter; i++) 
      {
        //Make a sample     
        var sample = _.sample(pairs, 4);
        //remove the samples
        var pr = _.difference(pairs, sample);
        //create a new H from the samples
        var H = Solve_8X8(sample);

        // console.log("H innan :", H);
        H = denorm(T1, T2, H);
        // console.log("H efter :", H);

        // var tmp_hh = [ [H[0], H[1], H[2]],
        //       [H[3], H[4], H[5]],
        //       [H[6], H[7], H[8]]];

        // var tmp_h = denormalize(T1, T2, tmp_hh);

        // var HH = [tmp_h[0][0],tmp_h[0][1],tmp_h[0][2],tmp_h[1][0],tmp_h[1][1],tmp_h[1][2], tmp_h[2][0],tmp_h[2][1],tmp_h[2][2] ];
        // H = HH;

        var currentInliers = [];
        //check all matches for inliers
        for (var j=0; j<pairs.length; j++) 
        {  
          //compute the transformation points
          var Xp = projectPointNormalized(pairs[j][0] ,H);
          var err = backProjectedError(pairs[j][1], Xp);

          //console.log("ERROR", err);            
          if(err < my_opt.ransac_inlier_threshold){
              currentInliers.push(j);
              //console.log("ERROR", err, i);
            }
        }

        if(bestliers.length < currentInliers.length)
        {
          bestliers = currentInliers;
          console.log("inliers ", bestliers.length, i);
        }

      }
      console.log("best inliers", bestliers.length);
      
      ctx.strokeStyle="rgb(0,255,0)";
      ctx.beginPath();

      var construcktH = [];
      for(var i in bestliers)
      {
        ctx.moveTo( pairs[bestliers[i]][0][0], pairs[bestliers[i]][0][1]);
        ctx.lineTo( pairs[bestliers[i]][1][0] + width, pairs[bestliers[i]][1][1]);
        ctx.stroke();

        construcktH.push(pairs[bestliers[i]]);  
      }

      console.log("construcktH", construcktH);

      var Hbest = Solve_8X8(construcktH);



      //HERE APPLY DENORM
      console.log("HERE APPLY DENORM");
      Hbest = denorm(T1, T2, Hbest);

      console.log("Best homographie", Hbest);

      findCorners(Hbest);

      return Hbest;
    //============================== end of RANSC algorithm ==============================================

    function denorm(T1, T2, H_hat)
    {

      // // make H_hat a matrix
      var tmp_h = [ [H_hat[0], H_hat[1], H_hat[2]],
                    [H_hat[3], H_hat[4], H_hat[5]],
                    [H_hat[6], H_hat[7], H_hat[8]]];


    // ************
    // solve
    // ************
    // dot((T2t, T2)̈́^1, (T2t, H*T1))

    // dot (T1^⁻1, Ḧ , T2 )

    //var T2tT2 = numeric.dot(T2t, T2);
    var T1inv = numeric.inv(T1);
    var T1H = numeric.dot(T1inv, tmp_h);
    var T1HT2 = numeric.dot(T1H, T2);

    //console.log("T1HT2", T1HT2);

    tmp_h = numeric.transpose(T1HT2) ;
    // tmp_h = T1HT2 ;

    return [tmp_h[0][0],tmp_h[0][1],tmp_h[0][2],tmp_h[1][0],tmp_h[1][1],tmp_h[1][2], tmp_h[2][0],tmp_h[2][1], tmp_h[2][2] ]; //

      //return H_hat;

    }


    function findCorners(H){

    //points [];

    var points = [[0, 0], [width, 0], [0, height], [width, height]];

    for(i in points)
      //console.log(points[i][0], points[i][1]);


    var projpointsX = [];
    var projpointsY = [];
    for(i in points)
    {
      projpointsX.push(perspectiveTransform(points[i], Hbest)[0]);
      projpointsY.push(perspectiveTransform(points[i], Hbest)[1]);
      
    }

    projpointsX.push(0);
    projpointsY.push(0);

    // console.log(projpointsX);
    // console.log(projpointsY);
    
    var minX = _.min(projpointsX);
    var minY = _.min(projpointsY);

    // console.log("minX", minX);
    // console.log("minY", minY);

    projpointsX.push(width);
    projpointsY.push(height);

    var maxX = _.max(projpointsX) - minX;
    var maxY = _.max(projpointsY) - minY;


    // console.log("maxX", maxX);
    // console.log("maxY", maxY);

    canvasSize = [maxX, maxY];
    canvasOffset = [minX, minY]; 

  }

  function perspectiveTransform(pt, H)
  {
   // console.log("H", H);

    var Hd = [[H[0],H[1],H[2]],[H[3],H[4],H[5]],[H[6],H[7],H[8]]];
    var Hdinv = numeric.inv(Hd);

    var X = [ pt[0], pt[1], 1];
    var Xp = numeric.dot(Hdinv, X);

    //console.log(Xp[0]/Xp[2], Xp[1]/Xp[2]);

    return [Xp[0]/Xp[2], Xp[1]/Xp[2]];

  }


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
      var ax = new Array(8);
      ax[0] = pts[ii][0][0];
      ax[1] = pts[ii][0][1];
      ax[2] = 1;
      ax[3] = 0;
      ax[4] = 0;
      ax[5] = 0;
      ax[6] = -pts[ii][0][0] * pts[ii][1][0]; 
      ax[7] = -pts[ii][0][1] * pts[ii][1][0];
       

      var ay = new Array(8);
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

      //console.log("A", A);

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

      var dists = [];
      var test = [];
      var dista = [];
      var imgdata = [];
      
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

    prev_corners = corners;
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
      prev_count = count;
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
      var desc = new Array(count);
      
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

}//end of detector app


