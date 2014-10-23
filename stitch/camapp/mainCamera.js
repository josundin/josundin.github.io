
function findScale(xSize,ySize){return 1; };

$(window).load(function() {
    "use strict";

    // lets do some fun
    var video = document.getElementById('webcam');
    var canvas = document.getElementById('canvas');
    try {
        var attempts = 0;
        var readyListener = function(event) {
            findVideoSize();
        };
        var findVideoSize = function() {
            if(video.videoWidth > 0 && video.videoHeight > 0) {
                video.removeEventListener('loadeddata', readyListener);
                onDimensionsReady(video.videoWidth, video.videoHeight);
            } else {
                if(attempts < 10) {
                    attempts++;
                    setTimeout(findVideoSize, 200);
                } else {
                    onDimensionsReady(640, 480);
                }
            }
        };
        var onDimensionsReady = function(width, height) {
            demo_app(width, height);
            compatibility.requestAnimationFrame(tick);
        };

        video.addEventListener('loadeddata', readyListener);

        compatibility.getUserMedia({video: true}, function(stream) {
            try {
                video.src = compatibility.URL.createObjectURL(stream);
            } catch (error) {
                video.src = stream;
            }
            setTimeout(function() {
                    video.play();
                }, 500);
        }, function (error) {
            $('#canvas').hide();
            $('#log').hide();
            $('#no_rtc').html('<h4>WebRTC not available.</h4>');
            $('#no_rtc').show();
        });
    } catch (error) {
        $('#canvas').hide();
        $('#log').hide();
        $('#no_rtc').html('<h4>Something goes wrong...</h4>');
        $('#no_rtc').show();
    }

    var ctx;
    var img_prev;
    var indx = 0, aIndx = 0, hIndx = 0;
    var imgDatas = [], warpImgs = [];
    var orb = {};
    var homographies = [], stitchImgs = [];;

    function takePhoto(){
        // prepare preview
        console.log("Photo taken");
        
        //////////////////////
        //    OBS
        //spar undan img_prev
        //////////////////////
        imgDatas[indx++] = img_prev;
        warpImgs[aIndx++] = canvas.toDataURL();

        dispImg(img_prev, 640/4, 480/4);

    }

    function stitchPhoto(){
        

        if(indx > 1){
            console.log("Stitche them photo");
            aIndx = 0;
            baseImg(otherImg);
            
        }
        else
            console.log("Need More than two photos");
    };

    function baseImg(callback){

        stitchImgs.push(warpImgs[0]);
        var img = imgDatas[aIndx++]; 

        var myImageW = img.width ;  
        var myImageH = img.height;
        orb = orbObj(myImageW, myImageH);

        orb.setOrbBase(img, myImageW, myImageH);
        // orb.setOrbOther(imgDatas[1], myImageW, myImageH);
        // homographies[hIndx++] = orb.getHomograph();
        // imagewarp("divStitched", homographies, warpImgs, blobStuff);
        callback();
        
    };

    function otherImg(){
        var img2 = imgDatas[aIndx];
        var myImageW = img2.width ;  
        var myImageH = img2.height;
 
        orb.setOrbOther(img2, myImageW, myImageH);
        if(orb.getNumMatches() > 10){
            homographies[hIndx++] = orb.getHomograph();
            stitchImgs.push(warpImgs[aIndx]);
            // stitchImgs.push(images[aIndx]);
            
            console.log("homographies",homographies.length);
        }
        else{
            console.log("nada", orb.getNumMatches());
        }
        // homographies[0] = orb.getHomograph();
       
        //check if done with imgLisst
       if(aIndx < (warpImgs.length - 1)){
            console.log("aIndx", aIndx, warpImgs.length);
            ++aIndx;
            otherImg();
        }
        else{
            imagewarp("divStitched", homographies, stitchImgs, blobStuff);
            //Återställ allt
            // indx = 1;
            // doneComputeFeatures();
        }
    };

/////////////////////////////////////////////////////////////

    function dispImg(dispIm, myImageW, myImageH){

        // var dispCanvas = createNewCanvas("disp");
        var dispCanvas = loadCanvas("disp");

        var myContext = dispCanvas.getContext('2d');

        dispCanvas.width = myImageW;
        dispCanvas.height = myImageH;

        // myContext.putImageData(dispIm, 0, 0);
        myContext.drawImage( canvas, 0, 0, myImageW, myImageH);
        console.log(dispIm);
    }

    function demo_app(videoWidth, videoHeight) {
        ctx = canvas.getContext('2d');

        console.log("Start");
        $('#theBtns').show();
        createButton1();
        createButton2();

    }

    function tick() {
        compatibility.requestAnimationFrame(tick);
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            ctx.drawImage(video, 0, 0, 640, 480);
            var imageData = ctx.getImageData(0, 0, 640, 480);
            img_prev = imageData;
            
            ctx.putImageData(imageData, 0, 0);
        }
    }

    function blobStuff(){
        $('#results').show();
        var el = document.getElementById('divStitched');
        el.scrollIntoView(true); 
        $('#theBtns').hide();
        console.log("Now do the blob stuff")
    }

    //////////////////////////////////////////////////
    // UTILITIES
    function createButton1()
    {
        var button = document.createElement("input");
        button.type = "button";
        button.className="btn btn-danger";
        button.value = "take photo";
        button.onclick = takePhoto;
        var div = document.getElementById("btn1"); 
        div.appendChild(button);
    }
    function createButton2()
    {
        var button = document.createElement("input");
        button.type = "button";
        button.className="btn btn-primary";
        button.value = "stitch photo";
        button.onclick = stitchPhoto;
        var div = document.getElementById("btn2"); 
        div.appendChild(button);
    }

    function loadCanvas(id){
        var canvas = document.createElement('canvas');
        var div = document.getElementById(id); 
        canvas.id     = "preview imgs";
        canvas.style=("position: absolute; top: 10px; left: 30px;", "border:10px solid #000000;");
        div.appendChild(canvas);

        return canvas;
    };


    $(window).unload(function() {
        video.pause();
        video.src=null;
    });
});