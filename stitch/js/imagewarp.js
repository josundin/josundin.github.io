/*
imageWarp
And some stuff
*/
"use strict";

//make private???
var imgOpt = function(imgsrc){
    this.warpData = 0;
    this.img = new Image();
    this.img.src = imgsrc;
}


function warp_App(id, homographies,images) {

    console.log("Waaaaaaaaaaaaaaarping");

    var canvas, ctx,canvasWidth,canvasHeight, canvas;

    var imageW = 0;
    var imageH = 0;
    //This is the base image, create object and then remove element from images
    //var baseImage = new imgOpt(images.shift());
    var baseImage = new imgOpt(images[0])


    // This is the warp images, loop and pusch them to the ImageList
    var imagesList = [];
    for (var i=0; i<images.length - 1; i++)
    {
        imagesList.push(new imgOpt(images[i + 1]));
    }

    ////////////////////////////////////////////////////////////////////////
    baseImage.img.onload = function() {

        var scale = 1;//findScale(baseImage.img.width, baseImage.img.height);

        //Kan ta bort en av variablerna???
        imageW = canvasWidth = baseImage.img.width * scale;  //640;//892;
        imageH = canvasHeight = baseImage.img.height *scale;  //480;//642;
        //setupWarp();                    
        applyWarp(id, imagesList);

      //eventuellt radera canvasen när klar... fast inte här

    }

    function createcanvas(id){

      var tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = imageW;
      tmpCanvas.height = imageH;

      tmpCanvas.style=("position: absolute; top: 0px; left: 0px;", "border:1px solid #000000;");
      //canvas.style=(" width:640px;height:480px;margin: 10px auto;");

      //add the canvas
      var div = document.getElementById(id); 
      div.appendChild(tmpCanvas);
      //add the canvas
      // var body = document.getElementsByTagName("body")[0];
      // body.appendChild(tmpCanvas);
      // tmpCanvas.id="warping";
      //body.id="body";

      return tmpCanvas;
    }


    function applyWarp(id, warpImages) {

        //Create a canvas, to temporary draw the warp
        canvas = createcanvas(id);
        ctx = canvas.getContext('2d');

        // Calculate the offsets
        var canvasOffset = new canvasOpt(homographies); //Homography

        //Create the final canvas
        var canvas2 = createcanvas(id);
        canvas2.width =  canvasOffset.maxW;
        canvas2.height =  canvasOffset.maxH;
        var ctx2 = canvas2.getContext('2d');


        ////////////////////////
        ////Start the steps////
        ///////////////////////
        for (var i=0; i<warpImages.length; i++)
        {
            //Draw the image
            ctx.drawImage(warpImages[i].img, 0, 0, canvasWidth, canvasHeight);
            //Copy the image data into a var
            var imageData = ctx.getImageData(0, 0, imageW , imageH );
            
            // Reset canvas, optional
            canvas.width = canvasOffset.maxW;//max_img_size[0];
            canvas.height= canvasOffset.maxH;//max_img_size[1];

            // create the warp data, where we will store the warped image
            warpImages[i].warpData = ctx.getImageData(0, 0, canvasOffset.maxW,canvasOffset.maxH);

            console.log(homographies[i], i);

            // multiply the homographie with the transaltion matrix
            var h_dot = H_times_offset(homographies[i]);

            // Apply the warp
            warp_perspective_color(imageData, warpImages[i].warpData, h_dot);

            // Update the context with newly-modified data
             ctx.putImageData(warpImages[i].warpData, 0, 0);
            //ctx.putImageData(warpImages[i].warpData, 0, 0, imageW, imageH, imageW, imageH);
            //ctx.putImageData(imgData,x,y,dirtyX,dirtyY,dirtyWidth,dirtyHeight);

            // Draw the image data in final canvas
            ctx2.drawImage(ctx.canvas,0,0); // Eventuellt pusha ctx.canvas för senare bruk
            //ctx2.drawImage(ctx.canvas,0, 0, imageW, imageH);
        }

        // Draw the base image at the offset
        ctx2.drawImage( baseImage.img, - canvasOffset.minW , - canvasOffset.minH);

        //hide the first canvas
        canvas.width = 0;
        canvas.height = 0;
        canvas.style = ('visibility', 'hidden');

        
        // ctx2.drawImage(ctx.canvas,0,0);
       
        function H_times_offset(H){

            //create a 3 x 3 matrix
            var tmp_h = [[H[0],H[1],H[2]],[H[3],H[4],H[5]],[H[6],H[7],H[8]]];  
            var trans_offset_mul = [[1,0,canvasOffset.minW],[0,1,canvasOffset.minH],[0,0,1]];
            tmp_h = numeric.dot(tmp_h, trans_offset_mul);
            return( [tmp_h[0][0],tmp_h[0][1],tmp_h[0][2],tmp_h[1][0],tmp_h[1][1],tmp_h[1][2], tmp_h[2][0],tmp_h[2][1], tmp_h[2][2] ] );

        }

    }


    //bryta upp i två delar.
    //1. multiplicerar och puschar
    //2. extraherar max min 


    var canvasOpt = function(Hs){

        var points = [[0, 0], [canvasWidth, 0], [0, canvasHeight], [canvasWidth, canvasHeight]];
        var projpointsX = [];
        var projpointsY = [];

        //loop over number of Hs

        //console.log("Hs", Hs);

        for (var j=0; j<Hs.length; j++)
        {
            for(var i in points)
            {
              projpointsX.push(perspectiveTransform(points[i], Hs[j])[0]);
              projpointsY.push(perspectiveTransform(points[i], Hs[j])[1]);        
            }
        }

        projpointsX.push(0);
        projpointsY.push(0);

        this.minW = _.min(projpointsX);
        this.minH = _.min(projpointsY);

        projpointsX.push(canvasWidth);
        projpointsY.push(canvasHeight);

        this.maxW = _.max(projpointsX) - this.minW;
        this.maxH = _.max(projpointsY) - this.minH;

        // console.log("minW", this.minW);
        // console.log("minH", this.minH);
        // console.log("maxW", this.maxW);
        // console.log("maxH", this.maxH);

      }



     var canvasOpt_org = function(H){

        var points = [[0, 0], [canvasWidth, 0], [0, canvasHeight], [canvasWidth, canvasHeight]];
        var projpointsX = [];
        var projpointsY = [];

        //loop over number of Hs

        for(var i in points)
        {
          projpointsX.push(perspectiveTransform(points[i], H)[0]);
          projpointsY.push(perspectiveTransform(points[i], H)[1]);        
        }

        projpointsX.push(0);
        projpointsY.push(0);

        this.minW = _.min(projpointsX);
        this.minH = _.min(projpointsY);

        projpointsX.push(canvasWidth);
        projpointsY.push(canvasHeight);

        this.maxW = _.max(projpointsX) - this.minW;
        this.maxH = _.max(projpointsY) - this.minH;

      }


      function perspectiveTransform(pt, H){

       // console.log("H", H);

        var Hd = [[H[0],H[1],H[2]],[H[3],H[4],H[5]],[H[6],H[7],H[8]]];
        var Hdinv = numeric.inv(Hd);

        var X = [ pt[0], pt[1], 1];
        var Xp = numeric.dot(Hdinv, X);

        //console.log(Xp[0]/Xp[2], Xp[1]/Xp[2]);

        return [Xp[0]/Xp[2], Xp[1]/Xp[2]];

      }

    //Bilinear interpolation
    function warp_perspective_color(src, dst, transform){
        
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

//return imageWarpData;

};
