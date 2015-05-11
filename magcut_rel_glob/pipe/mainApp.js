  "use strict";
  // lets do some fun
  var canvas =  loadCanvas("tmpCanvas");//document.getElementById('canvas');
  var imgSrcs = [];

  var orbImages = [];
  var imagesRef = [];
  var selDiv = "";
  var index = 0, hindex = 0;
  var homographies = [];
  var orb = {};
  var stitch = {};
  var stitchImgs = [];
  var computedHs = {};
  var stat2 = new profiler();
  var result_canvas;
  stat2.add("features");   

  document.addEventListener("DOMContentLoaded", init, false);
  // Setup the dnd listeners.
  function init() {
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
    document.querySelector('#files').addEventListener('change', handleFileSelectButton, false);
    selDiv = document.querySelector("#selectedFiles"); 
  }

  function handleFileSelectButton(e) {
    if(!e.target.files || !window.FileReader) return;

    selDiv.innerHTML = "";
    imgSrcs =[];
    
    var files = e.target.files;
    console.log("the files:", files);
    var filesArr = Array.prototype.slice.call(files);

    console.log("fore");    
    filesArr.forEach(function(f){
      if(!f.type.match("image.*")) {
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        var html = "<img src=\"" + e.target.result + "\">"  ;//+ f.name
        //Här är src, pucha denna i en array
        selDiv.innerHTML += html;
        console.log("URL:" ,f.name);
        imgSrcs.push(e.target.result);
      }
      reader.readAsDataURL(f);
    });
    showStuff();
  }

  function handleFileSelect(e) {
    selDiv.innerHTML = "";
    imgSrcs =[];

    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files; 
    var filesArr = Array.prototype.slice.call(files);
   
    filesArr.forEach(function(f){
        if(!f.type.match("image.*")) {
          return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {

          var html = "<img src=\"" + e.target.result + "\">"  ;//+ f.name
        //Här är src, pucha denna i en array
        selDiv.innerHTML += html;
        console.log("URL:" ,f.name);
        imgSrcs.push(e.target.result);

        }
        reader.readAsDataURL(f);
        
    });

    showStuff();

  }

  function showStuff(){
    $('#pre-stitch').show();
    $('#pre-stitch2').show();
  }

  function start(){
    $('#chooseFiles').hide();
    $('#runAlgo').hide();
    stitchImgs = [];
    $('#stitching').show();
    var el = document.getElementById("stitching");
    el.scrollIntoView(true);
    console.log("LENGTH OF IMAGES", imgSrcs.length);

    if(isEmpty(computedHs)){
        imagesRef = imgSrcs.slice();
        for (var i = 0; i < imgSrcs.length; i++){
            computedHs[i] = { val: false, bool: false, H: [] };
        }
    }
    orbImages = imgSrcs.slice();
    baseImg(otherImg);

    return false;
  }

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

  function handleDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

function baseImg(callback){

    var img = new Image();
    img.src = orbImages[index++];
    stitchImgs.push(img.src);
    img.onload = function() {

        stat2.start("features");
        var scale = findScale(img.width, img.height);
        
        var myImageW = img.width * scale |0;  
        var myImageH = img.height * scale |0;
        orb = orbObj(myImageW, myImageH);

        canvas.width  = myImageW;
        canvas.height = myImageH;
        var ctx = canvas.getContext('2d');

        ctx.drawImage(this, 0, 0, myImageW, myImageH);
        var imageData = ctx.getImageData(0, 0, myImageW, myImageH);

        orb.setOrbBase(imageData, myImageW, myImageH);
        stat2.stop("features");
        console.log("features base img:", stat2.log(1), "ms");
        callback();
    }
};

function otherImg(){

    var img2 = new Image();
    img2.src = orbImages[index];
    // console.log("features base img:", stat2.log(1), "ms. found", num_corners );
    img2.onload = function() { 
        stat2.start("features");
      
        var scale = findScale(img2.width, img2.height);
        var myImageW = img2.width * scale |0;  
        var myImageH = img2.height * scale |0;

        canvas.width  = myImageW;
        canvas.height = myImageH;
        var ctx = canvas.getContext('2d');

        ctx.drawImage(this, 0, 0, myImageW, myImageH);
        var imageData = ctx.getImageData(0, 0, myImageW, myImageH);

        orb.setOrbOther(imageData, myImageW, myImageH);
        if(orb.getNumMatches() > 27){
            homographies[hindex++] = orb.getHomograph();
            stitchImgs.push(orbImages[index]);
            
            console.log("homographies",homographies);
        }
        else{
            console.log("nada", orb.getNumMatches());
        }
        stat2.stop("features");
        console.log("features other img:", stat2.log(1), "ms");

        //check if done with imgLisst
       if(index < (orbImages.length - 1)){
            ++index;
            otherImg();
        }
        else{
            if(!computedHs[0].bool){
                console.log("INIT NOT DONE"); 
                stitch = imagewarp('CANVAS', homographies, stitchImgs, selView);
            }
            else{
                console.log("INIT DONE");
                hComputed();
            }
            canvas.width = 0;
            canvas.height = 0;
        }
    }
};

function selView(){
    computedHs[0] = { val: false, bool: true, H: homographies.slice() };
    var mosaic2 = stitch.getMosaic2();
    selectview('canvas', mosaic2);
    $('#stitching').hide();
    $('#poststitch').show();

    var el = document.getElementById('selectViewContainer');
    el.scrollIntoView(true);

};

function hComputed(){
    for (var i = 0; i < imgSrcs.length; i++){
        if (computedHs[i].val){
            computedHs[i] = {val: true, bool: true, H: homographies.slice() };
        }
        else{
          computedHs[i].val = false;
        }
    }
    stitch = imagewarp('CANVAS', homographies, stitchImgs, blobStuff);
}

function loadCanvas(id){
    var canvas = document.createElement('canvas');
    var div = document.getElementById(id); 
    canvas.id     = id;
    div.appendChild(canvas);

    return canvas;
};

var blob;
function createImgObj(val){
    var currentImagesRef = new Array(imagesRef.length);
    var rindx = 0;

    if(!computedHs[val].val){
      currentImagesRef[rindx++] = imagesRef[val]; 
      computedHs[val].val = true;
      for (var i = 0; i < imagesRef.length; i++){
          if (i != val){
              currentImagesRef[rindx++] = imagesRef[i];
              computedHs[i].val = false; 
          }
      }
      imgSrcs = currentImagesRef.slice();
      if(computedHs[val].bool){;
        stitch = imagewarp('CANVAS', computedHs[val].H, currentImagesRef, blobStuff);

      }
      else{
        console.log("!bool");
        index = 0; 
        hindex = 0;
        start();
      }
    }
    else{
      console.log("VAL else");
    }

}

function blobStuff(){
    console.log("do blob Stuff");
    if(!blob){
        blob = blobObj();
        blob.createBlobView();
    }else{
        blob.remove();
        blob.createBlobView();
    }
}


