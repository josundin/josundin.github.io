//blobObj
var finalcanvas =  loadCanvas("final-canvas");
var mouse = {};
var myblobs1 = [];
(function(_this){
"use strict";

    _this['blobObj'] = function(){
    
        var thresholdfunc = {};


        var demo_opt = function(blobimg){
            this.threshold = 14;
            this.blobMap = blobimg;
        }

        var overlapData = {}; 
        
        var blobSelected = {};
        var bmaps = {}; 
        var blobMaps = [];

        $('#btn1').hide();
        createButton1();
        var globalNumberOfUnique = 0;

        function findBlobs(){
            globalNumberOfUnique = 0;
            var overlapBase = overlapData[0];
            var imgBaseChanels = getChanels(overlapBase);
            blobMaps = [];

            var thresValues = {};
            for (var xii = 1; xii < imagesRef.length; xii++){
                thresValues[xii] = 14;
            }
            for (var xii = 1; xii < imagesRef.length; xii++){
                var overlap = overlapData[xii];
                var img1Chanels = getChanels(overlap);

                ////// Go find them blobs //////////
                myblobs1[xii] = findDiff(imgBaseChanels, img1Chanels, overlap.width, overlap.height, xii);
                overlap.blobs = myblobs1[xii].getData();
                // Separate the aryes
                for (var y = 0; y < overlap.blobs.numberOfUnique; y++){
                    
                    var currentblobindx = y + 1;
                    var blobtmp = zeros(overlap.blobs.data.length);
                    for (var x = 0; x < overlap.blobs.data.length; x++){
                        if(currentblobindx === overlap.blobs.data[x]){
                            blobtmp[x] = currentblobindx + globalNumberOfUnique;
                        }
                    }
                    blobMaps.push([blobtmp, xii]);
                }
                globalNumberOfUnique += overlap.blobs.numberOfUnique;
            }
            for (var xii = 0; xii < globalNumberOfUnique; xii++){
                blobSelected[xii + 1] = false;
            }
            return blobMaps;
        }

        function getChanels(imageDatar){
            var dptr=0, dptrSingle=0;
            var imgR_f32 = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.F32_t | jsfeat.C1_t);
            var imgG_f32 = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.F32_t | jsfeat.C1_t);
            var imgB_f32 = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.F32_t | jsfeat.C1_t);
            var imgAlpha = new jsfeat.matrix_t(imageDatar.width, imageDatar.height, jsfeat.U8_t | jsfeat.C1_t);

            for (var y = 0; y < imageDatar.height; y++) {
                for (var x = 0; x < imageDatar.width; x++, dptr+=4, dptrSingle+=1) {
                    imgR_f32.data[dptrSingle] = imageDatar.data[dptr];
                    imgG_f32.data[dptrSingle] = imageDatar.data[dptr + 1];
                    imgB_f32.data[dptrSingle] = imageDatar.data[dptr + 2];
                    imgAlpha.data[dptrSingle] = imageDatar.data[dptr + 3];
                }
            }
            return [imgR_f32, imgG_f32, imgB_f32, imgAlpha];
        };

        function createButton1(){
            var button = document.createElement("input");
            button.type = "button";
            button.className="btn btn-primary";
            button.value = "reset";
            button.onclick = reset;
            var div = document.getElementById("btn1"); 
            div.appendChild(button);
        }

        function reset(){
            finalcanvas.width = 0;
            finalcanvas.height = 0;
            $('#btn1').hide();
            for (var xii = 0; xii < _.size(blobSelected); xii++){
                blobSelected[xii + 1] = false;
            }
            redrawScrean(bmaps, overlapData, blobSelected, mouse.getOffset()); 
            var el = document.getElementById('blobs');
            el.scrollIntoView(true);
        }
        return{
            createBlobView: function() {

                result_canvas = loadCanvas("blobs");
                overlapData = stitch.getOverlap();
                var ModOverlapData = stitch.getModOverlap();
                 
                bmaps = findBlobs();

                $('#ComputingBlobs').hide();
                $('#blobInterface').show();

                mouse = interactMouse(bmaps, overlapData, blobSelected, overlapData[0].width, overlapData[0].height, ModOverlapData);
                mouse.setup(0);
                redrawScrean(bmaps, overlapData, blobSelected, mouse.getOffset());

                var el = document.getElementById('blobs');
                el.scrollIntoView(true);

                return 1;
            },
            getData: function() {
                return 1;
            },
            remove: function() {
                for (var xii = 1; xii < imagesRef.length; xii++){
                    console.log("REMOVE:", xii);
                    if(thresholdfunc[xii]){
                        gui.remove(thresholdfunc[xii]);
                    }
                }
                reset();
                //Remove element
                var element = document.getElementById('blobs');
                element.children.blobs.remove();
                result_canvas = {};
                blobSelected = {};
                overlapData = {}; 
                myblobs1 = [];
                bmaps = {}; 
                blobMaps = [];

                return 1;
            }
        };
    };
}(this));

