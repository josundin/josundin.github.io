  "use strict";
  // lets do some fun
  var canvas =  loadCanvas("tmpCanvas");//document.getElementById('canvas');
  var imgSrcs = [];
  var images = [];
  var selDiv = "";
  var index = 0, hindex = 0;
  var homographies = [];
  var orb = {};
  var stitchImgs = [];
  var stat2 = new profiler();
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
    $('#stitching').show();
    //start_stitch();
    $('#stitched').show();
    var el = document.getElementById("stitching");
    el.scrollIntoView(true);
    console.log("img list:", imgSrcs);


    images = imgSrcs;
    baseImg(otherImg);   

    //Obs ladda bilderna i en ctx
    // computeFeatures(imgSrcs[indx++]);
    return false;
  }

  function handleDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }
//////////////////////////////////////

function baseImg(callback){

    var img = new Image();
    img.src = images[index++];
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
    img2.src = images[index];
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
            stitchImgs.push(images[index]);
            
            console.log("homographies",homographies[0]);
        }
        else{
            console.log("nada", orb.getNumMatches());
        }
        // homographies[0] = orb.getHomograph();
        stat2.stop("features");
        console.log("features other img:", stat2.log(1), "ms");

        //check if done with imgLisst
       if(index < (images.length - 1)){
            console.log("index", index, images.length);
            ++index;
            otherImg();
        }
        else{
            var stitch = imagewarp("divStitched", homographies, stitchImgs, blobStuff);
            // indx = 1;
            canvas.width = 0;
            canvas.height = 0;
            // doneComputeFeatures();
        }
    }
};


function blobStuff(){
$('#results').show();
var el = document.getElementById('results');
el.scrollIntoView(true); 
console.log("Now do the blob stuff")
}


        function loadCanvas(id){
            var canvas = document.createElement('canvas');
            //canvas.style=("border:1px solid #000000;");
            var div = document.getElementById(id); 
            canvas.id     = "tmpCanvas";
            div.appendChild(canvas);

            return canvas;
        };
