function selectview(arrayImages){

	// var arrayImages = [];

	var imageHeight = 602;
	var imageWidth = 856;	
	var scrollValue = 0;//zoomWidgetObj.value.target[1]*2;

	//This creates the canvas
	var selectView = d3.select("#selectViewContainer")
		.append("svg")
		.attr("width", 960)
		.attr("height", imageHeight)
		.attr("id","selectView")
		.call(d3.behavior.zoom()
	  	.on("zoom", function(d){
	  	//console.log(d3.event.sourceEvent);
		if ((d3.event.sourceEvent.deltaY || d3.event.sourceEvent.wheelDelta) > 0 && scrollValue < (arrayImages.length -1) ){
				//Scroll in one direction
				scrollValue = scrollValue + 1;
				createImageObjects(scrollValue);
				//console.log(scrollValue);
			}else if((d3.event.sourceEvent.deltaY || d3.event.sourceEvent.wheelDelta) < 0 && scrollValue > 0){
				//Scroll in the other direction					
				scrollValue = scrollValue - 1;
				//console.log(scrollValue);
				createImageObjects(scrollValue);
			}					
		}))
		.append("g");

	//Default img Scene
	(function start(scene){
		console.log("scene :", scene);
		// arrayImages = ["allignedbaseImageMosaic.png", "allignedImage1mosaic.png"];
		selectView.selectAll("image").remove();
		for(var i = 0; i < arrayImages.length; i++)
			imageOncanvas(arrayImages[i]);
	}());

	// The mouse wheel is scrolled The highligted is put on top
	function createImageObjects(val){
	//Remove all the images.
	selectView.selectAll("image").remove();

	//For all the images which are not the selected one.
	for (var i = 0; i < arrayImages.length; i++){
		if (i != val)
			{
			var imageName = arrayImages[i];
			selectView.append("image")
				.attr("xlink:href", imageName)
				.attr("id", i)			
				.attr("width", imageWidth)
				.attr("height", imageHeight)
				.attr("opacity", 0.3)
				//.attr("transform", function(d) { return "translate("+(xpos - (imageWidth/2))+","+(ypos -(imageHeight/2))+")"; })
				.attr("class", "image");

			}
		}
	//Put the selected image on top.
		selectView.append("image")
		.attr("xlink:href", arrayImages[val])
		.attr("id", val)			
		.attr("width", imageWidth)
		.attr("height", imageHeight)
		.attr("opacity", 1)
		//.attr("transform", function(d) { return "translate("+(xpos - (imageWidth/2))+","+(ypos -(imageHeight/2))+")"; })
		.attr("class", "image")
		.on("click", function(){
				console.log("clicked id : " + val);
			});
	}

	function imageOncanvas(elementName){
		selectView.append("image")
		.attr("xlink:href", elementName)
		.attr("width", imageWidth)
		.attr("height", imageHeight)
		//.attr("transform", function(d) { return "translate("+(xpos - (imageWidth/2))+","+(ypos -(imageHeight/2))+")"; })
		.attr("opacity", 0.3)
		.attr("class", "image");	
	}
}
