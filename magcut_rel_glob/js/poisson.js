"use strict";

var src_ctx  	;
var mask_ctx 	;
var result_ctx 	;
var base_size = {width:0, height:0};

var blend_position_offset = {x:0, y:0};
function adjustBlendPosition() {
	var src_pixels = src_ctx.getImageData(0, 0, base_size.width, base_size.height);
	var mask_pixels = mask_ctx.getImageData(0, 0, base_size.width, base_size.height);
	var result_pixels = result_ctx.getImageData(0, 0, base_size.width, base_size.height);

	for(var y=1; y<base_size.height-1; y++) {
		for(var x=1; x<base_size.width-1; x++) {
			var p = (y*base_size.width+x)*4;
			if(mask_pixels.data[p+0]==0 && mask_pixels.data[p+1]==255 &&
					mask_pixels.data[p+2]==0 && mask_pixels.data[p+3]==255) {

				var p_offseted = p + 4*((blend_position_offset.y)*base_size.width+blend_position_offset.x);
				for(var rgb=0; rgb<3; rgb++) {
					result_pixels.data[p_offseted+rgb] = src_pixels.data[p+rgb];
				}
			}
		}
	}
	console.log(blend_position_offset.x, blend_position_offset.y);
	result_ctx.putImageData(result_pixels, 0, 0);
}

//from: http://takuti.me/dev/poisson/demo/
/*-----------------------------------------
 Blend Images
 g : src_pixels (using mask_pixels)
 f*: base_pixels
 ---> Blend result is result_pixels
-----------------------------------------*/
function poissonBlendImages(newcanvas, srccanvas, mask_data, finalcanvas, offset){

	var base_ctx 	= newcanvas.getContext("2d");
	src_ctx  	= srccanvas.getContext("2d");
	mask_ctx 	= mask_data.getContext("2d");
	result_ctx 	= finalcanvas.getContext("2d");

	base_size.width  =  srccanvas.width;
	base_size.height = 	srccanvas.height;
	blend_position_offset = offset;
	adjustBlendPosition();

	var base_pixels = base_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);
	var src_pixels = src_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);
	var mask_pixels = mask_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);

	//The inintial layer to blend
	// var result_pixels = base_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);
	var result_pixels = result_ctx.getImageData(0, 0, srccanvas.width, srccanvas.height);
	// saf()
	var is_mixing_gradients = false;

	var dx, absx, previous_epsilon=1.0;
	var cnt=0, cntMask = 0, cntNeigbour = 0;

	do {
		dx=0; absx=0;
		for(var y=1; y<base_size.height-1; y++) {
			for(var x=1; x<base_size.width-1; x++) {
				// p is current pixel
				// rgba r=p+0, g=p+1, b=p+2, a=p+3
				var p = (y*base_size.width+x)*4;

				// Mask area is painted rgba(0,255,0,1.0)
				if(mask_pixels.data[p+0]==0 && mask_pixels.data[p+1]==255 &&
						mask_pixels.data[p+2]==0 && mask_pixels.data[p+3]==255) {

					var p_offseted = p + 4*(blend_position_offset.y*base_size.width+blend_position_offset.x);

					// q is array of connected neighbors
					var q = [((y-1)*base_size.width+x)*4, ((y+1)*base_size.width+x)*4,
										(y*base_size.width+(x-1))*4, (y*base_size.width+(x+1))*4];
					var num_neighbors = q.length;

					for(var rgb=0; rgb<3; rgb++) {
						var sum_fq = 0;
						var sum_vpq = 0;
						var sum_boundary = 0;

						for(var i=0; i<num_neighbors; i++) {
							var q_offseted = q[i] + 4*(blend_position_offset.y*base_size.width+blend_position_offset.x);

							if(mask_pixels.data[q[i]+0]==0 && mask_pixels.data[q[i]+1]==255 &&
									mask_pixels.data[q[i]+2]==0 && mask_pixels.data[q[i]+3]==255) {
								sum_fq += result_pixels.data[q_offseted+rgb];
							} else {
								sum_boundary += base_pixels.data[q_offseted+rgb];
							}

							if(is_mixing_gradients && Math.abs(base_pixels.data[p_offseted+rgb]-base_pixels.data[q_offseted+rgb]) >
								Math.abs(src_pixels.data[p+rgb]-src_pixels.data[q[i]+rgb])) {
								sum_vpq += base_pixels.data[p_offseted+rgb]-base_pixels.data[q_offseted+rgb];
							} else {
								sum_vpq += src_pixels.data[p+rgb]-src_pixels.data[q[i]+rgb];
							}
						}
						var new_value = (sum_fq+sum_vpq+sum_boundary)/num_neighbors;
						dx += Math.abs(new_value-result_pixels.data[p_offseted+rgb]);
						absx += Math.abs(new_value);
						result_pixels.data[p_offseted+rgb] = new_value;
					}
				}
			}
		}
		// console.log(dx, absx);
		cnt++;
		var epsilon = dx/absx;
		if(!epsilon || previous_epsilon-epsilon === 0) break; // convergence
		// if( cnt > 1000) break;
		else previous_epsilon = epsilon;
	} while(true);
	///////////////////////////////////////////////////////////////////////////////////
	// console.log("släng ut extra lager");	
	// extraCtx.putImageData(test_pixels, 0, 0);
	///////////////////////////////////////////////////////////////////////////////////////
	result_ctx.putImageData(result_pixels, 0, 0);
	console.log(cnt+" times iterated. ?", epsilon , previous_epsilon);

	//scroll to canvas
	var el = document.getElementById('final-canvas');
    el.scrollIntoView(true);

	return finalcanvas;
}