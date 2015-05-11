//blobMan.js
function redrawScrean(maps, odata, blobSelected, clickedPos){
    var baseImgData = odata[0];
    // console.log("BLOB MAN");

    //In maps we have a pointer to which image we reffer
    // console.log("maps", maps);
    // console.log("odata", odata);

    // printa32(clickedPos, 32);

    result_canvas.width = baseImgData.width;
    result_canvas.height = baseImgData.height;
    var result_ctx = result_canvas.getContext("2d");
    var canvas2 = document.createElement('CANVAS');
    // document.body.appendChild(canvas2);
    canvas2.width =  baseImgData.width;
    canvas2.height =  baseImgData.height;
    var ctx2 = canvas2.getContext('2d');
    var imageDatar = result_ctx.createImageData(baseImgData.width, baseImgData.height);

    var dptr = 0, dptr_s = 0;
    for (var y = 0; y < baseImgData.height; y++) {
        for (var x = 0; x < baseImgData.width; x++, dptr+=4, dptr_s+=1) {
            for (var yi = 0; yi < maps.length; yi++){
                if((clickedPos[dptr_s] != 0 || maps[yi][0][dptr_s] === yi + 1) &&  odata[maps[yi][1]].data[dptr + 3] != 0){

                    imageDatar.data[dptr]     =  clickedPos[dptr_s] ? 0 : odata[maps[yi][1]].data[dptr]; 
                    imageDatar.data[dptr + 1] =  clickedPos[dptr_s] ? odata[maps[yi][1]].data[dptr + 1] : 0 ;
                    
                    imageDatar.data[dptr + 2] =  odata[maps[yi][1]].data[dptr + 2];
                    imageDatar.data[dptr + 3] = clickedPos[dptr_s] ? 255 : 200;

                    // imageDatar.data[dptr]     =  blobSelected[yi + 1] ? 0 : odata[maps[yi][1]].data[dptr]; 
                    // imageDatar.data[dptr + 1] =  blobSelected[yi + 1] ? odata[maps[yi][1]].data[dptr + 1] : 0 ;
                    
                    // imageDatar.data[dptr + 2] =  odata[maps[yi][1]].data[dptr + 2];
                    // imageDatar.data[dptr + 3] = blobSelected[yi + 1] ? 255 : 200;
                }
            }            
        }
    }
    ctx2.putImageData(imageDatar, 0, 0);
    result_ctx.putImageData(baseImgData, 0, 0);
    result_ctx.drawImage(canvas2,0,0);
}






























function zeros(size) {
    var array = new Array(size);
    for (var i = 0; i < size; i++) {
        array[i] = 0;
    }
    return array;
};
