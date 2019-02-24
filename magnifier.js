function moveMagnifier(e){

	
	const magnifierCtx = magnifier.node().getContext('2d');
  	magnifierCtx.save();

  	let rectWidth = width/gridColumns;
	let rectHeight = height/gridRows;

	let scale = 6;

	let pos = getMousePos(e);
	let colWeAreOn = pos["x"]/width * gridColumns;
	let rowWeAreOn = pos["y"]/height * gridRows;

	magnifier.style("left", pos["x"] - 150 + "px");
	magnifier.style("top", pos["y"] - 150 + "px");


	let imagesToLoad = data.filter(function(d){
		if (!d["grid_point"]){
			return false;
		}
		if ((d["grid_point"][0] > (colWeAreOn - 5) && d["grid_point"][0] < (colWeAreOn + 5))
		&&	(d["grid_point"][1] > (rowWeAreOn - 5) && d["grid_point"][1] < (rowWeAreOn + 5))){
			return true;
		} else {
			return false;
		}
	});

		let offsetX = colWeAreOn%1 * rectWidth * scale;
		let offsetY = rowWeAreOn%1 * rectHeight * scale;

		for (var i = 0; i < imagesToLoad.length; i++){
			let point = imagesToLoad[i];
			if (largeImages[point["isbn13"]]){
				magnifierCtx.drawImage(largeImages[point["isbn13"]],
					150 - rectWidth * 4 + ((colWeAreOn - point.grid_point[0]) * rectWidth * scale),
					150 - rectHeight * 4 + ((rowWeAreOn - point.grid_point[1]) * rectHeight * scale), 
					rectWidth * scale, rectHeight * scale); // Or at whatever offset you like
		    } else {
				let base_image = new Image();
			    let url = point.book_image;
			    base_image.src = url;
			    base_image.onload = function(){
			    	largeImages[point["isbn13"]] = base_image;
				};
				if (smallImages[point["isbn13"]]){
					magnifierCtx.drawImage(smallImages[point["isbn13"]],
					  	150 - rectWidth * 4 + ((colWeAreOn - point.grid_point[0]) * rectWidth * scale), 
					  	150 - rectHeight * 4 + ((rowWeAreOn - point.grid_point[1]) * rectHeight * scale),
					  	rectWidth * scale, rectHeight * scale); // Or at whatever offset you like
				}
			}

	}
	magnifierCtx.restore();


}