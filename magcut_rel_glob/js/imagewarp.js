/*
imageWarp
And some stuff
*/
// function warp_App(id, homographies,images) {
(function(_this){
"use strict";
    _this['imagewarp'] = function(id, homographies,images, callback){
        var imgOpt = function(imgsrc){
            this.warpData = 0;
            this.img = new Image();
            this.img.src = imgsrc;
        };

        var canvas, ctx,canvasWidth,canvasHeight;

        var imageW = 0;
        var imageH = 0;
        //This is the base image
        var baseImage = new imgOpt(images[0]);
        var baseImageMosaic;
        var mosaicImgs = new Array(images.length);

        // This is the warp images, loop and pusch them to the ImageList
        var imagesList = [];
        var overlapList = [0];
        var modoverlapList = [0];
        for (var i=0; i<images.length - 1; i++)
        {
            imagesList.push(new imgOpt(images[i + 1]));
        }

        baseImage.img.onload = function() {
            var scale = findScale(baseImage.img.width, baseImage.img.height);

            //Kan ta bort en av variablerna???
            imageW = canvasWidth = baseImage.img.width * scale |0;  //640;//892;
            imageH = canvasHeight = baseImage.img.height * scale |0;  //480;//642;
            canvasWidth = baseImage.img.width * scale |0;  //640;//892;
            canvasHeight = baseImage.img.height * scale |0;  //480;//642;
                       
            applyWarp(id, imagesList);

            // stopppp()
            callback();
        };

        function applyWarp(id, warpImages) {
            //Create a canvas, to temporary draw the warp
            canvas = createcanvas('canvas', imageW, imageH);
            ctx = canvas.getContext('2d');

            // Calculate the offsets
            var canvasOffset = new canvasOpt(homographies); //Homography

            //Create the final canvas
            var canvas2 = createcanvas(id, imageW, imageH);
            canvas2.width =  canvasOffset.maxW;
            canvas2.height =  canvasOffset.maxH;
            var ctx2 = canvas2.getContext('2d');

            //create histogram for base img
            var targetHistograms = getHisograms(images[0]);


            ////////////////////////
            ////Start the steps////
            ///////////////////////
            for (var i=0; i<warpImages.length; i++)
            {
                //START histogram matching
                var srcHistograms = getHisograms(images[i + 1]);
                var mapTables = new Array(3);
                for(var j = 0; j <mapTables.length ; ++j){

                    var pr_k = srcHistograms[j];
                    var specified_histogram_p_z = targetHistograms[j];

                    var s_k = histogramEqualizationTransform(pr_k);
                    var Gz_q = histogramEqualizationTransform(specified_histogram_p_z);

                    mapTables[j] = step3(s_k, Gz_q);
                }
                var modifiedImageData = ctx.getImageData(0, 0, imageW , imageH );
                // END histogram matching
                
                //Draw the image
                ctx.drawImage(warpImages[i].img, 0, 0, canvasWidth, canvasHeight);

                //Copy the image data into a var
                var imageData = ctx.getImageData(0, 0, imageW , imageH );
                correctImg(mapTables, imageData, modifiedImageData);

                // Reset canvas, optional
                canvas.width = canvasOffset.maxW;//max_img_size[0];
                canvas.height= canvasOffset.maxH;//max_img_size[1];

                // create the warp data, where we will store the warped image
                warpImages[i].warpData = ctx.getImageData(0, 0, canvasOffset.maxW,canvasOffset.maxH);
                var modifiedWarpData = ctx.getImageData(0, 0, canvasOffset.maxW,canvasOffset.maxH);


                // multiply the homographie with the transaltion matrix
                var h_dot = H_times_offset(homographies[i]);

                // Apply the warp
                warp_perspective_color(imageData, warpImages[i].warpData, h_dot);
                warp_perspective_color(modifiedImageData, modifiedWarpData, h_dot);

                // Update the context with newly-modified data
                ctx.putImageData(warpImages[i].warpData, 0, 0);
                // mosaicImgs[1] = canvas.toDataURL();

                var imagecanvas = document.createElement('CANVAS');
                        imagecanvas.width = canvas.width;
                        imagecanvas.height = canvas.height;
                        imagecanvas.getContext('2d').drawImage(ctx.canvas,0,0);
                        mosaicImgs[i+1] = imagecanvas;

                // ctx2.globalAlpha = 0.5;
                // Draw the image data in final canvas
                ctx2.drawImage(ctx.canvas,0,0); // Eventuellt pusha ctx.canvas för senare bruk
                // ctx2.globalAlpha = 1;

                // // OBS Spar denna i eget object
                var test = ctx.getImageData(- canvasOffset.minW , - canvasOffset.minH, imageW,imageH);
                overlapList.push(test);
                // ctx2.putImageData(test, 0, 0);
                // console.log(test);
                ctx.putImageData(modifiedWarpData, 0, 0);
                var test = ctx.getImageData(- canvasOffset.minW , - canvasOffset.minH, imageW,imageH);
                modoverlapList.push(test);
            }

            // Draw the base image at the offset
            ctx2.drawImage( baseImage.img, - canvasOffset.minW , - canvasOffset.minH, imageW, imageH);
            overlapList[0] = ctx2.getImageData(- canvasOffset.minW , - canvasOffset.minH, imageW,imageH);

            canvas.width = canvasOffset.maxW;//max_img_size[0];
            canvas.height= canvasOffset.maxH;//max_img_size[1];

            ctx.drawImage( baseImage.img, - canvasOffset.minW , - canvasOffset.minH, imageW, imageH);
            baseImageMosaic = ctx.getImageData(0, 0, canvasOffset.maxW, canvasOffset.maxH);
            // mosaicImgs[0] = canvas.toDataURL();
            var imagecanvas = document.createElement('CANVAS');
            imagecanvas.width = canvas.width;
            imagecanvas.height = canvas.height;
            imagecanvas.getContext('2d').drawImage(ctx.canvas,0,0);
            mosaicImgs[0] = imagecanvas;

            //hide the first canvas
            // canvas.width = 0;
            // canvas.height = 0;
            //canvas.style = ('visibility', 'hidden');

            
            // ctx2.drawImage(ctx.canvas,0,0);
           
            function H_times_offset(H){
                //create a 3 x 3 matrix
                var tmp_h = [[H[0],H[1],H[2]],[H[3],H[4],H[5]],[H[6],H[7],H[8]]];  
                var trans_offset_mul = [[1,0,canvasOffset.minW],[0,1,canvasOffset.minH],[0,0,1]];
                tmp_h = numeric.dot(tmp_h, trans_offset_mul);
                return( [tmp_h[0][0],tmp_h[0][1],tmp_h[0][2],tmp_h[1][0],tmp_h[1][1],tmp_h[1][2], tmp_h[2][0],tmp_h[2][1], tmp_h[2][2] ] );

            };

        };

        var canvasOpt = function(Hs){
            var points = [[0, 0], [canvasWidth, 0], [0, canvasHeight], [canvasWidth, canvasHeight]];
            var projpointsX = [];
            var projpointsY = [];
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
        };


        function perspectiveTransform(pt, H){
            var Hd = [[H[0],H[1],H[2]],[H[3],H[4],H[5]],[H[6],H[7],H[8]]];
            var Hdinv = numeric.inv(Hd);
            var X = [ pt[0], pt[1], 1];
            var Xp = numeric.dot(Hdinv, X);

            return [Xp[0]/Xp[2], Xp[1]/Xp[2]];
        };

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
        };
        return{
            getOverlap: function() {
                // console.log("Datan vi blendar fins i overlapList", overlapList);
                return overlapList;
            },
            getModOverlap: function() {
                
                return modoverlapList;
            },
            getMosaic: function() {
                //return the mosaic data
                return [baseImageMosaic, imagesList];
            },
            getMosaic2: function() {
                //return the mosaic data
                return mosaicImgs;
            }
        };
    };
}(this));

function createcanvas(id, imageW, imageH){
    var tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = imageW;
    tmpCanvas.height = imageH;
    if(0 === id.localeCompare('CANVAS') || 0 === id.localeCompare('canvas')  ){}
    else{
        var div = document.getElementById(id); 
        div.appendChild(tmpCanvas);
    }

    return tmpCanvas;
};

/////////Functions for histogram matching

function getHisograms(imgRef){

      //the target histogra img
        var image = new Image();
        image.src = imgRef;
        var canvas = createcanvas("canvas", image.width, image.height); //document.getElementById("canvas"); 
        var ctx = canvas.getContext('2d');
              
        ctx.drawImage(image, 0, 0);
        var imageData = ctx.getImageData(0, 0, image.width, image.height);
        var img1_RGBA = getChanels_U8(imageData);
        // console.log("RGBA", img1_RGBA, "MAX", _.max(img1_RGBA[0]), "MIN", _.min(img1_RGBA[0]));

        var histR = get_histogram(img1_RGBA[0]);
        var histG = get_histogram(img1_RGBA[1]);
        var histB = get_histogram(img1_RGBA[2]);
       
        normalize(histR, image.width * image.height);
        normalize(histG, image.width * image.height);
        normalize(histB, image.width * image.height);

        return [histR, histG, histB];
}

function getChanels_U8(imageDatar){
    var dptr=0, dptrSingle=0;
    var imgR_u8 = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.U8_t | jsfeat.C1_t);
    var imgG_u8 = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.U8_t | jsfeat.C1_t);
    var imgB_u8 = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.U8_t | jsfeat.C1_t);
    var imgAlpha = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.U8_t | jsfeat.C1_t);

    for (var y = 0; y < imageDatar.height; y++) {
        for (var x = 0; x < imageDatar.width; x++, dptr+=4, dptrSingle+=1) {
            imgR_u8.data[dptrSingle] = imageDatar.data[dptr];
            imgG_u8.data[dptrSingle] = imageDatar.data[dptr + 1];
            imgB_u8.data[dptrSingle] = imageDatar.data[dptr + 2];
            imgAlpha.data[dptrSingle] = imageDatar.data[dptr + 3];
        }
    }
    return [imgR_u8.data, imgG_u8.data, imgB_u8.data, imgAlpha.data];
};

function get_histogram(src){

    var hist = new Array(256);
    for(var i = 0; i <256 ; ++i) hist[i] = 0;
    for (var i = 0; i < src.length; ++i) {
        ++hist[src[i]];
    }
    return hist;
}

function normalize(hist, NM){
    for(var i = 0; i <hist.length ; ++i) hist[i] = hist[i] / NM;
}

function histogramEqualizationTransform(hist){
    var prevValue = 0;
    var s_k = new Array(hist.length);
    for(var i = 0; i <hist.length ; ++i){
        s_k[i] = (hist.length - 1) * hist[i] + prevValue;
        prevValue = s_k[i];
        s_k[i] = Math.round(s_k[i]);
    }
    return s_k;
}

//Step 3. that is: For every value of s_k, k = 0,1,2 ... L -1, use the stored value og G to find 
//the corresponding value of z_q so that G_z is closest to sk and store the mapping from s to z.
//When more then one value of z_q satisfies the given s_k choose the smallest value.
function step3(s_k, Gz_q){
    var mapTable = new Array(s_k.length);
    // for(var i = 0; i <s_k.length ; ++i) hist[i] = 0;

    for(var i = 0; i <s_k.length ; ++i){
        // console.log("find the closest of ", s_k[i], " in", Gz_q);
        mapTable[i] = findClosest( s_k[i], Gz_q, i);
    }

    return mapTable;
}

function findClosest(val, arr, s_kIndx){

    var min = 9999;
    var indx = 0;

    for(var i = 0; i <arr.length ; ++i){
        var error = val - arr[i];
        error = error >= 0 ? error : -error;
        if(error < min){
            min = error;
            indx = i;
        }
    }
    ///////////////////////////
    var sameVal = [];
    for(var ii = 0; ii <arr.length ; ++ii){
        var error2 = val - arr[ii];
        error2 = error2 >= 0 ? error2 : -error2;
        if(error2 === min && ii !== indx){
            //console.log("saaaaaaaaame", val, s_kIndx,  " indx", ii, "or", indx, error2);
            sameVal.push(ii);
        }
    }
    // if(sameVal.length > 0){
        sameVal.push(indx);
        //console.log("sameVal does exsist", sameVal.length, sameVal);
        min = 9999;
        for(var ii = 0; ii <sameVal.length ; ++ii){
            var error = s_kIndx - sameVal[ii];
            error = error >= 0 ? error : -error;
            if(error <= min){
                min = error;
                indx = sameVal[ii];
            }
        }
        //To prevent local negative clipping
        if(min > 10){
            // console.log("Too High diff", min , val, s_kIndx,  " ->", indx);
            indx = s_kIndx;
        }


        // console.log(indx, "Choosen");
    // }
    //////////////////////////7
    return indx;
}

//apply the map
function correctImg(maps, srcImageData, dstImageData){
    
    var dptr=0, dptrSingle=0;

    for (var y = 0; y < srcImageData.height; y++) {
        for (var x = 0; x < srcImageData.width; x++, dptr+=4, dptrSingle+=1) {
            dstImageData.data[dptr]   = maps[0][srcImageData.data[dptr]];
            dstImageData.data[dptr+1] = maps[1][srcImageData.data[dptr + 1]];
            dstImageData.data[dptr+2] = maps[2][srcImageData.data[dptr + 2]];
            dstImageData.data[dptr+3] = srcImageData.data[dptr+3];
        }
    }
    // return modifiedImageData;
}

///END of Functions for histogram matching