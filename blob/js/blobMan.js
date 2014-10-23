//blobMan.js

function blobMan(blobImage, id){

	var result_canvas = createNewCanvas(id);
	result_canvas.width = blobImage.width;
	result_canvas.height = blobImage.height;
	var result_ctx = result_canvas.getContext("2d");
	var imageDatar = result_ctx.getImageData(0, 0, blobImage.width, blobImage.height);
	
	//context.drawImage(img1, 0, 0);

	function createNewCanvas(idname){
		var mycanvas = document.createElement('canvas');
		mycanvas.style=("position: absolute; top: 0px; left: 0px;", "border:1px solid #000000;");
		//add the canvas
		// var body = document.getElementsByTagName("body")[0];
		// body.appendChild(mycanvas);
		// mycanvas.id=idname;
		// body.id="body";

        var div = document.getElementById(id); 
        div.appendChild(mycanvas);

		return mycanvas;
	}

	var dptr = 0, dptr_s = 0;
	for (var y = 0; y < blobImage.height; y++) {
		for (var x = 0; x < blobImage.width; x++, dptr+=4, dptr_s+=1) {
        	if(blobImage.blobs.data[dptr_s] !== 0){
	        	imageDatar.data[dptr] = blobImage.data[dptr];
				imageDatar.data[dptr + 1] = blobImage.data[dptr + 1];
				imageDatar.data[dptr + 2] = blobImage.data[dptr + 2];
				imageDatar.data[dptr + 3] = 255;
        	}
        	else{
        		imageDatar.data[dptr + 3] = 0;	
        	}
			
		}
	}

        // result_ctx.putImageData(blobImage.imageData, 0, 0);
        result_ctx.putImageData(imageDatar, 0, 0);
}