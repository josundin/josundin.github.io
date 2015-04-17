//segment.js
"use strict";
var imagesReady = false;

function Coordinates(x, y) {
    this.left = x;
    this.top = y;
}

var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
var canvas = document.getElementById('canvas_input_photo');
var genCanvas = document.getElementById('canvas_output_photo');
var context = canvas.getContext('2d');
var genContext = genCanvas.getContext('2d');
var image;

var curLineStart = new Coordinates(0, 0);
var curLineEnd = new Coordinates(0, 0);
var paint;

var FOREGROUND = 0;
var BACKGROUND = 1;
var lineType = FOREGROUND;
var foregroundLines = [];
var backgroundLines = [];

var imageData;
var foregroundKDE_L = [];
var foregroundKDE_A = [];
var foregroundKDE_B = [];
var backgroundKDE_L = [];
var backgroundKDE_A = [];
var backgroundKDE_B = [];

var foregroundPixels = [];
var backgroundPixels = [];

////////
$(window).load(function() {
    imagesReady = true;
    enablestart();
});

var imagesRef = ["t12.png"];
var selDiv1 = document.querySelector("#selectedF1");
placeimgs(imagesRef, selDiv1);


function placeimgs(images, wdiv){
    var filesArr = Array.prototype.slice.call(images);
    for (var i = 0; i < images.length; i++) 
    {
        var image = new Image();
        image.src = images[i];
        wdiv.appendChild(image);
    }
};

var mousep = {};

function enablestart() {
    image = new Image();
    image.src = imagesRef[0];
    // var canvas = document.getElementById('canvas_input_photo');
    // var contex = canvas.getContext('2d');

    if (imagesReady) {
        console.log("Start by putting out the image");
        canvas.width = image.width;
        genCanvas.width = image.width;
        canvas.height = image.height;
        genCanvas.height = image.height;
        context.drawImage(image,0,0);
        var imageData = context.getImageData(0,0,canvas.width,canvas.height);
        context.drawImage(image, 0, 0);
        
        mousep = new mousePaint();
        mousep.setup();

        //create the mouse painting
    }
}

////////

// http://stackoverflow.com/questions/10906734/how-to-upload-image-into-html5-canvas
// http://jsfiddle.net/influenztial/qy7h5/
function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        while(foregroundLines.length > 0) {
            foregroundLines.pop();
        }
        while(backgroundLines.length > 0) {
            backgroundLines.pop();
        }
        while(foregroundPixels.length > 0) {
            foregroundPixels.pop();
        }
        while(backgroundPixels.length > 0) {
            backgroundPixels.pop();
        }
        image = new Image();
        image.onload = function(){
            canvas.width = image.width;
            genCanvas.width = image.width;
            canvas.height = image.height;
            genCanvas.height = image.height;
            context.drawImage(image,0,0);
        }
        image.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
}


// http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/
function redraw() {
    var foregroundColor = "#1111FF";
    var backgroundColor = "#33FF33";

    canvas.width = canvas.width; //clear
    context.drawImage(image,0,0);

    //context.strokeStyle = "#df4b26";
    context.lineJoin = "round";
    context.lineWidth = 3;

    context.beginPath();
    if (lineType == FOREGROUND) {
        context.strokeStyle = foregroundColor;
    }
    else {
        context.strokeStyle = backgroundColor;
    }

    if (paint) {
        context.moveTo(curLineStart.left, curLineStart.top);
        context.lineTo(curLineEnd.left, curLineEnd.top);
        context.stroke();
    }
}

function findPosOnScreen(obj) {
    var curLeft, curTop;
    curLeft = 0;
    curTop = 0;
    do {
        curLeft += obj.offsetLeft;
        curTop += obj.offsetTop;
    } while(obj = obj.offsetParent);
    return [curLeft, curTop];
}

function addLine() {
    if (lineType == FOREGROUND) {
        foregroundLines[foregroundLines.length] = 
            [curLineStart, curLineEnd];
    }
    else {
        backgroundLines[backgroundLines.length] = 
            [curLineStart, curLineEnd];
    }
    curLineStart = new Coordinates(0, 0);
    curLineEnd = new Coordinates(0, 0);
    paint = false;
}

// http://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
function calcStraightLine (startCoordinates, endCoordinates) {
    var coordinatesArray = new Array();
    // Translate coordinates
    var x1 = startCoordinates.left;
    var y1 = startCoordinates.top;
    var x2 = endCoordinates.left;
    var y2 = endCoordinates.top;
    // Define differences and error check
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;
    // Set first coordinates
    coordinatesArray.push(new Coordinates(x1, y1));
    // Main loop
    while (!((x1 == x2) && (y1 == y2))) {
      var e2 = err << 1;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
      // Set coordinates
      coordinatesArray.push(new Coordinates(x1, y1));
    }
    // Return the result
    return coordinatesArray;
}

var usePQ = true;
var finalForegroundDistances;
var finalBackgroundDistances;
var finalForegroundOrder;
var finalBackgroundOrder;
// var hasBeenGenerated = false;
var cancelled = false;
var animationSpeed = 1;

function updateSpeed(value) {
    animationSpeed = value;
}

function showFinalSegmentation() {
    context.drawImage(image,0,0);
    var genImageData = context.getImageData(0, 0, canvas.width, canvas.height);
    redraw();
    for (var i=0; i < finalForegroundDistances.length; i++) {
        if (finalForegroundDistances[i] > finalBackgroundDistances[i]) {
            var index = i * 4;
            genImageData.data[index+0] = 0;
            genImageData.data[index+1] = 0;
            genImageData.data[index+2] = 255;
            genImageData.data[index+3] = 255;
        }
    }
    genContext.putImageData(genImageData, 0, 0);
}

function showFinalHeatFG() {
    var genImageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var max = 0;
    for (var i=0; i < finalForegroundDistances.length; i++) {
        if (finalForegroundDistances[i] > max && finalForegroundDistances[i] != Infinity) {
            max = finalForegroundDistances[i];
        }
    }
    for (var i=0; i < finalForegroundDistances.length; i++) {
            var index = i * 4;
            genImageData.data[index+0] = 255 - Math.round(254*(finalForegroundDistances[i]/max));
            genImageData.data[index+1] = 0;
            genImageData.data[index+2] = 0;
            genImageData.data[index+3] = 255;
    }
    genContext.putImageData(genImageData, 0, 0);
}

function animateHeatFG() {
    cancelled = false;
    context.drawImage(image,0,0);
    var genImageData = context.getImageData(0, 0, canvas.width, canvas.height);
    redraw();
    var numPixelsDrawn = 0;
    var max = 0;
    for (var i=0; i < finalForegroundDistances.length; i++) {
        if (finalForegroundDistances[i] > max && finalForegroundDistances[i] != Infinity) {
            max = finalForegroundDistances[i];
        }
    }
    (function loop() {
        var timesPerFrame = animationSpeed;
        for (var i=0; i < timesPerFrame; i++) {
            if (!cancelled && (numPixelsDrawn < finalForegroundOrder.length)) {
                var index = finalForegroundOrder[numPixelsDrawn] * 4;
                genImageData.data[index+0] = 255 - Math.round(254*(finalForegroundDistances[finalForegroundOrder[numPixelsDrawn]]/max));
                genImageData.data[index+1] = 0;
                genImageData.data[index+2] = 0;
                genImageData.data[index+3] = 255;
                numPixelsDrawn++;
            }
            else {
                break;
            }
        }
        genContext.putImageData(genImageData, 0, 0);
        if (!cancelled && (numPixelsDrawn < finalForegroundOrder.length)) {
            setTimeout(loop, 1); // drawing at 30fps
        }
    })();
}

function showFinalHeatBG() {
    var genImageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var max = 0;
    for (var i=0; i < finalBackgroundDistances.length; i++) {
        if (finalBackgroundDistances[i] > max && finalBackgroundDistances[i] != Infinity) {
            max = finalBackgroundDistances[i];
        }
    }
    for (var i=0; i < finalBackgroundDistances.length; i++) {
            var index = i * 4;
            genImageData.data[index+0] = 0;
            genImageData.data[index+1] = 255 - Math.round(254*(finalBackgroundDistances[i]/max));
            genImageData.data[index+2] = 0;
            genImageData.data[index+3] = 255;
    }
    genContext.putImageData(genImageData, 0, 0);
}

function animateHeatBG() {
    cancelled = false;
    context.drawImage(image,0,0);
    var genImageData = context.getImageData(0, 0, canvas.width, canvas.height);
    redraw();
    var numPixelsDrawn = 0;
    var max = 0;
    for (var i=0; i < finalBackgroundDistances.length; i++) {
        if (finalBackgroundDistances[i] > max && finalBackgroundDistances[i] != Infinity) {
            max = finalBackgroundDistances[i];
        }
    }
    (function loop() {
        var timesPerFrame = animationSpeed;
        for (var i=0; i < timesPerFrame; i++) {
            if (!cancelled && (numPixelsDrawn < finalBackgroundOrder.length)) {
                var index = finalBackgroundOrder[numPixelsDrawn] * 4;
                genImageData.data[index+0] = 0;
                genImageData.data[index+1] = 255 - Math.round(254*(finalBackgroundDistances[finalBackgroundOrder[numPixelsDrawn]]/max));
                genImageData.data[index+2] = 0;
                genImageData.data[index+3] = 255;
                numPixelsDrawn++;
            }
            else {
                break;
            }
        }
        genContext.putImageData(genImageData, 0, 0);
        if (!cancelled && (numPixelsDrawn < finalBackgroundOrder.length)) {
            setTimeout(loop, 1); // drawing at 30fps
        }
        
    })();
}

///////////////////////////////////////////////////////////
/// START
///////////////////////////////////////////////////////////

function generateImage() {

    var startTime = new Date();
    $(text_generate_status).html("Working...");
    generateKDEs();
    console.log(new Date() - startTime);
    context.drawImage(image,0,0);
    var genImageData = context.getImageData(0, 0, canvas.width, canvas.height);


    // var context = canvas.getContext('2d');
    var testContext = context.getImageData(0, 0, canvas.width, canvas.height);

    finalBackgroundOrder = [];//new Array();
    finalForegroundOrder = [];//new Array();

    function addOrUpdateForeground(r, c, curDistance, curProbability) {
        if (r >= image.height || r < 0 || c >= image.width || c < 0) {
            return;
        }

        var index = (c + r * image.width);
        //Eller om vi är utanför regionen, så return nu
        if (indexDone[index] || genImageData.data[((index) *4)+3] == 0 ) {
            return;
        }
        var curCoordinate = new Coordinates(c, r);
        var curCoordinateProbability = getPixelProbability(curCoordinate, FOREGROUND);
        var distanceBetween = Math.abs(curProbability - curCoordinateProbability);
        if (!(foregroundBuckets[index] == undefined)) {
            // check if better
            if ((curDistance + distanceBetween) < foregroundDistances[index]) {
                //priorityQueue.remove(index);
                //priorityQueue.enqueue(curDistance+distanceBetween, index);
                // TODO
                var bucket = foregroundBuckets[index];
                priorityQueue.increase_priority(index, bucket, (curDistance+distanceBetween))
                foregroundDistances[index] = curDistance+distanceBetween;
            }
        }
        else {
            // add with our distance
            var bucket = priorityQueue.push(index, curDistance+distanceBetween);
            foregroundBuckets[index] = bucket;
            foregroundDistances[index] = curDistance+distanceBetween;
            foregroundProbability[index] = curCoordinateProbability;
        }
    }

    function addOrUpdateBackground(r, c, curDistance, curProbability) {
        if (r >= image.height || r < 0 || c >= image.width || c < 0) {
            return;
        }

        var index = (c + r * image.width);
        if (indexDone[index] || genImageData.data[((index) *4)+3] == 0 ) {
            return;
        }
        var curCoordinate = new Coordinates(c, r);
        var curCoordinateProbability = getPixelProbability(curCoordinate, BACKGROUND);
        var distanceBetween = Math.abs(curProbability - curCoordinateProbability);
        // old if (priorityQueue.containsValue(index)) {
        if (!(backgroundBuckets[index] == undefined)) {
            // check if better
            // old if ((curDistance + distanceBetween) < priorityQueue.peekKey(index)) {
            if ((curDistance + distanceBetween) < backgroundDistances[index]) {
                // old priorityQueue.remove(index);
                // old priorityQueue.enqueue(curDistance+distanceBetween, index);
                var bucket = backgroundBuckets[index];
                priorityQueue.increase_priority(index, bucket, (curDistance+distanceBetween))
                backgroundDistances[index] = curDistance+distanceBetween;
            }
        }
        else {
            // add with our distance
            // old priorityQueue.enqueue(curDistance+distanceBetween, index);
            var bucket = priorityQueue.push(index, curDistance+distanceBetween);
            backgroundBuckets[index] = bucket;
            backgroundDistances[index] = curDistance+distanceBetween;
            backgroundProbability[index] = curCoordinateProbability;
        }
    }

    if (usePQ) {
        var foregroundDistances = new Array(image.width * image.height);
        var foregroundProbability = new Array(image.width * image.height);
        var foregroundBuckets = new Array(image.width * image.height);

        var backgroundDistances = new Array(image.width * image.height);
        var backgroundProbability = new Array(image.width * image.height);
        var backgroundBuckets = new Array(image.width * image.height);

        var indexDone = new Array(image.width * image.height);


        for (var i=0; i<(image.width * image.height); i++) {
            foregroundDistances[i] = Infinity;
            indexDone[i] = false;
        }
        // set up priority queue
        var priorityQueue = new UntidyPriorityQueue(20, 2);

        for (var i=0; i < foregroundPixels.length; i++) {
            var c = foregroundPixels[i].left;
            var r = foregroundPixels[i].top;
            var index = c + r * image.width;
            // console.log(genImageData.data[(index) *4]);

            var bucket = priorityQueue.push(index, 0);
            foregroundBuckets[index] = bucket;
            foregroundDistances[index] = 0;
            foregroundProbability[index] = getPixelProbability(foregroundPixels[i], FOREGROUND);
        }

        while (!priorityQueue.empty()) {
            var curPixel = priorityQueue.pop();
            indexDone[curPixel] = true;
            finalForegroundOrder.push(curPixel);
            var r = Math.floor(curPixel / image.width);
            var c = curPixel % image.width;
            
            addOrUpdateForeground(r, c-1, foregroundDistances[curPixel], foregroundProbability[curPixel]);
            addOrUpdateForeground(r-1, c, foregroundDistances[curPixel], foregroundProbability[curPixel]);
            addOrUpdateForeground(r, c+1, foregroundDistances[curPixel], foregroundProbability[curPixel]);
            addOrUpdateForeground(r+1, c, foregroundDistances[curPixel], foregroundProbability[curPixel]);
        }

        for (var i=0; i<(image.width * image.height); i++) {
            backgroundDistances[i] = Infinity;
            indexDone[i] = false;
        }

        // set up priority queue
        var priorityQueue = new UntidyPriorityQueue(20, 2);

        for (var i=0; i < backgroundPixels.length; i++) {
            var c = backgroundPixels[i].left;
            var r = backgroundPixels[i].top;
            var index = c + r * image.width;
            // old priorityQueue.enqueue(0, index);
            var bucket = priorityQueue.push(index, 0);
            backgroundBuckets[index] = bucket;
            backgroundDistances[index] = 0;
            backgroundProbability[index] = getPixelProbability(backgroundPixels[i], BACKGROUND);

        }

        // old while(!priorityQueue.isEmpty()) {
        while (!priorityQueue.empty()) {
            var curPixel = priorityQueue.pop();// old priorityQueue.dequeue();
            indexDone[curPixel] = true;
            finalBackgroundOrder.push(curPixel);
            var r = Math.floor(curPixel / image.width);
            var c = curPixel % image.width;
            
            addOrUpdateBackground(r, c-1, backgroundDistances[curPixel], backgroundProbability[curPixel]);
            addOrUpdateBackground(r-1, c, backgroundDistances[curPixel], backgroundProbability[curPixel]);
            addOrUpdateBackground(r, c+1, backgroundDistances[curPixel], backgroundProbability[curPixel]);
            addOrUpdateBackground(r+1, c, backgroundDistances[curPixel], backgroundProbability[curPixel]);
        }
        finalForegroundDistances = foregroundDistances;
        finalBackgroundDistances = backgroundDistances;

        showFinalSegmentation();

    }
    else{
    	console.log("NO PQ?? eh");
    }

    //genContext.putImageData(genImageData, 0, 0);
    var endTime = new Date();
    var diffTime = endTime - startTime;
    var msg = "Done in " + diffTime + "ms";
    $(text_generate_status).html(msg);
    redraw();
    alert("Done");
}

//var ForegroundProbabilityValues = [];
//var BackgroundProbabilityValues = [];
function getPixelProbability(coordinate, type) {
    var LABA = getLabForPixel(coordinate);
    var L = Math.round(LABA.values[0]);
    var A = Math.round(LABA.values[1]);
    var B = Math.round(LABA.values[2]);

    var L_foreground_prob = foregroundKDE_L[L][1];
    var A_foreground_prob = foregroundKDE_A[(A+127)][1];
    var B_foreground_prob = foregroundKDE_B[(B+127)][1];
    var LAB_foreground_prob = L_foreground_prob * A_foreground_prob * B_foreground_prob * 1000;

    var L_background_prob = backgroundKDE_L[L][1];
    var A_background_prob = backgroundKDE_A[(A+127)][1];
    var B_background_prob = backgroundKDE_B[(B+127)][1];
    var LAB_background_prob = L_background_prob * A_background_prob * B_background_prob * 1000;

    if (type == FOREGROUND) {
        return (LAB_foreground_prob / (LAB_foreground_prob + LAB_background_prob));
    }
    else {
        return (LAB_background_prob / (LAB_foreground_prob + LAB_background_prob));
    }
}

function generateKDEs() {
    var foregroundLAB_L = [];
    var foregroundLAB_A = [];
    var foregroundLAB_B = [];
    var backgroundLAB_L = [];
    var backgroundLAB_A = [];
    var backgroundLAB_B = [];
    var kde;
    var bandwidth;

    foregroundPixels = [];
    backgroundPixels = [];

    var maskTime = new Date();

    var maskData = mousep.getPainted(context);

    for(var y=1; y<canvas.height - 1; y++){
        for(var x=1; x<canvas.width - 1; x++){
          
            if(maskData[y][x] == 1){
                foregroundPixels.push(new Coordinates(x, y));
            }
            else if(maskData[y][x] == 2 ){
                backgroundPixels.push(new Coordinates(x, y));
            }
        }
    }

    console.log(new Date - maskTime)

    // Get image data without the lines
    context.drawImage(image,0,0);
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    redraw();

    // Generate the KDE for the foreground and background LAB values
    // NOTE: Each KDE's sumation is 10, so we need to divide each value by 10
    for (var i = 0; i < foregroundPixels.length; i++) {
        var LABA = getLabForPixel(foregroundPixels[i]);
        foregroundLAB_L.push(LABA.values[0]);
        foregroundLAB_A.push(LABA.values[1]);
        foregroundLAB_B.push(LABA.values[2]); 
    }

    kde = science.stats.kde().sample(foregroundLAB_L);
    bandwidth = science.stats.bandwidth.nrd0(foregroundLAB_L);
    foregroundKDE_L = kde.bandwidth(bandwidth)(_.range(0, 101, 1));  //(d3.range(0, 101, 1));

    kde = science.stats.kde().sample(foregroundLAB_A);
    bandwidth = science.stats.bandwidth.nrd0(foregroundLAB_A);
    foregroundKDE_A = kde.bandwidth(bandwidth)(_.range(-127, 127, 1));//(d3.range(-127, 127, 1));

    kde = science.stats.kde().sample(foregroundLAB_B);
    bandwidth = science.stats.bandwidth.nrd0(foregroundLAB_B);
    foregroundKDE_B = kde.bandwidth(bandwidth)(_.range(-127, 127, 1));//


    for (var i = 0; i < backgroundPixels.length; i++) {
        var LABA = getLabForPixel(backgroundPixels[i]);
        backgroundLAB_L.push(LABA.values[0]);
        backgroundLAB_A.push(LABA.values[1]);
        backgroundLAB_B.push(LABA.values[2]); 
    }

    kde = science.stats.kde().sample(backgroundLAB_L);
    bandwidth = science.stats.bandwidth.nrd0(backgroundLAB_L);
    backgroundKDE_L = kde.bandwidth(bandwidth)(_.range(0, 101, 1));

    kde = science.stats.kde().sample(backgroundLAB_A);
    bandwidth = science.stats.bandwidth.nrd0(backgroundLAB_A);
    backgroundKDE_A = kde.bandwidth(bandwidth)(_.range(-127, 127, 1));//

    kde = science.stats.kde().sample(backgroundLAB_B);
    bandwidth = science.stats.bandwidth.nrd0(backgroundLAB_B);
    backgroundKDE_B = kde.bandwidth(bandwidth)(_.range(-127, 127, 1));//
}

function getLabForPixel(coordinate) {
    var index = (coordinate.left + coordinate.top * imageData.width) * 4;
    var r = imageData.data[index+0];
    var g = imageData.data[index+1];
    var b = imageData.data[index+2];
    var a = imageData.data[index+3];

    var colourRGBA = Colour.fromString("rgba("+r+","+g+","+b+","+(a/255)+")");
    var colourLABA = colourRGBA.convertTo(Colour.LABA);

    return colourLABA;
}

/////////
//END
/////////
//x ,y pos
// $(canvas_input_photo).mousedown(function(e) {
//     curLineStart.left = e.pageX - findPosOnScreen(this)[0];
//     curLineStart.top = e.pageY - findPosOnScreen(this)[1];
//     paint = true;
// });

// $(canvas_input_photo).mousemove(function(e) {
//     if (paint) {
//         curLineEnd.left = e.pageX - findPosOnScreen(this)[0];
//         curLineEnd.top = e.pageY - findPosOnScreen(this)[1];
//         redraw();
//     }
// });

// $(canvas_input_photo).mouseleave(function(e) {
//     if (paint) {
//         addLine();
//     }
// });

// $(canvas_input_photo).mouseup(function(e) {
//     addLine();
// });

// $(button_foreground).click(function(e) {
//     lineType = FOREGROUND;
//     $(text_line_type).html("Drawing Foreground Lines");
// });

// $(button_background).click(function(e) {
//     lineType = BACKGROUND;
//     $(text_line_type).html("Drawing Background Lines");
// });

$(text_line_type).html("Drawing Foreground Lines");

$(button_clear_lines).click(function(e) {
    while(foregroundLines.length > 0) {
        foregroundLines.pop();
    }
    while(backgroundLines.length > 0) {
        backgroundLines.pop();
    }
    while(foregroundPixels.length > 0) {
        foregroundPixels.pop();
    }
    while(backgroundPixels.length > 0) {
        backgroundPixels.pop();
    }
    redraw();
});

$(button_generate_image).click(generateImage);

$(button_result_heat_fg).click(showFinalHeatFG);

$(button_result_heat_bg).click(showFinalHeatBG);

$(button_result_normal).click(showFinalSegmentation);

$(button_animate_heat_fg).click(animateHeatFG);

$(button_animate_heat_bg).click(animateHeatBG);

$(button_stop_animation).click(function() {
    cancelled = true;
});
