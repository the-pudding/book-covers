function moveMagnifier(e){

	
	const magnifierCtx = magnifier.node().getContext('2d');
  	magnifierCtx.save();

  	let rectWidth = width/gridColumns;
	let rectHeight = height/gridRows;



	let pos = getMousePos(e);
	let colWeAreOn = pos["x"]/width * gridColumns;
	let rowWeAreOn = pos["y"]/height * gridRows;

	magnifier.style("left", pos["x"] - 100 + "px");
	magnifier.style("top", pos["y"] - 100 + "px");


	let imagesToLoad = data.filter(function(d){
		if (!d["grid_point"]){
			return false;
		}
		if ((d["grid_point"][0] > (colWeAreOn - 3) && d["grid_point"][0] < (colWeAreOn + 3))
		&&	(d["grid_point"][1] > (rowWeAreOn - 3) && d["grid_point"][1] < (rowWeAreOn + 3))){
			return true;
		} else {
			return false;
		}
	});

		let offsetX = colWeAreOn%1 * rectWidth * 8;
		let offsetY = rowWeAreOn%1 * rectHeight * 8;

		for (var i = 0; i < imagesToLoad.length; i++){
			let point = imagesToLoad[i];
			if (largeImages[point["isbn13"]]){
				magnifierCtx.drawImage(largeImages[point["isbn13"]],
					100 - rectWidth * 4 + ((colWeAreOn - point.grid_point[0]) * rectWidth * 8),
					100 - rectHeight * 4 + ((rowWeAreOn - point.grid_point[1]) * rectHeight * 8), 
					rectWidth * 8, rectHeight * 8); // Or at whatever offset you like
		    } else {
				let base_image = new Image();
			    let url = point.book_image;
			    base_image.src = url;
			    base_image.onload = function(){
			    	largeImages[point["isbn13"]] = base_image;
				  	magnifierCtx.drawImage(base_image, 
				  		100 - rectWidth * 4 + ((colWeAreOn - point.grid_point[0]) * rectWidth * 8), 
				  		100 - rectHeight * 4 + ((rowWeAreOn - point.grid_point[1]) * rectHeight * 8),
				  		rectWidth * 8, rectHeight * 8); // Or at whatever offset you like
				};
			}

	}
	magnifierCtx.restore();


}