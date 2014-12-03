//blobMan.js

function blobMan(blobImage, baseImage, blobCanvas){

	blobCanvas.width = blobImage.width;
	blobCanvas.height = blobImage.height;
	var blobCtx = blobCanvas.getContext("2d");
	blobCtx.putImageData(baseImage, 0, 0);

    var canvas2 = document.createElement("canvas");
    canvas2.width = blobImage.width;
    canvas2.height = blobImage.height;
    var ctx2 = canvas2.getContext("2d");
	var imageDatar = ctx2.getImageData(0, 0, blobImage.width, blobImage.height);//blobCtx.getImageData(0, 0, blobImage.width, blobImage.height);
	
	var dptr = 0, dptr_s = 0;
	for (var y = 0; y < blobImage.height; y++) {
		for (var x = 0; x < blobImage.width; x++, dptr+=4, dptr_s+=1) {
        	if(blobImage.blobs.data[dptr_s] !== 0){
	        	imageDatar.data[dptr] = blobImage.data[dptr];
				imageDatar.data[dptr + 1] = 0;//blobImage.data[dptr + 1];
				imageDatar.data[dptr + 2] = 0;//blobImage.data[dptr + 2];
				imageDatar.data[dptr + 3] = 200;
        	}
        	else{
        		imageDatar.data[dptr + 3] = 0;	
        	}			
		}
	}

    // put the modified pixels on the temporary canvas
    ctx2.putImageData(imageDatar, 0, 0);

    blobCtx.drawImage(canvas2, 0, 0);
    // blobCtx.putImageData(imageDatar, 0, 0);
}