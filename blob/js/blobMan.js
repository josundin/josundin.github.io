//blobMan.js

function blobMan(blobImage, baseImage, blobCanvas){

	blobCanvas.width = blobImage.width;
	blobCanvas.height = blobImage.height;
	var blobCtx = blobCanvas.getContext("2d");
	
	blobCtx.putImageData(baseImage, 0, 0);
	var imageDatar = blobCtx.getImageData(0, 0, blobImage.width, blobImage.height);
	
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
        		imageDatar.data[dptr + 3] = 255;	
        	}			
		}
	}

    // blobCtx.putImageData(blobImage.imageData, 0, 0);
    blobCtx.putImageData(imageDatar, 0, 0);
}