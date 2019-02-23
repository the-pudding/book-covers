let data = [];

//selections
let gender = [];
let fiction = [];
let genre = [];

let rectangleRatio = 0.6666667; //the width to height ratio or rectangles is generally around 1.5
let gridColumns;
let gridRows;

window.onload =function(e){
	setup();
}

function xml_http_post(url, data, callback) {
    var req = false;
    try {
        // Firefox, Opera 8.0+, Safari
        req = new XMLHttpRequest();
        // req.addEventListener("progress", updateProgress, false);
    }
    catch (e) {
        // Internet Explorer
        try {
            req = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                req = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {
            	console.log(e);
                // alert("Your browser does not support AJAX!");
                return false;
            }
        }
    }
    req.open("POST", url, true);
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            callback(req);
        }
    }
    req.send(data);
}

function setup(){
	let width = d3.select(".main").node().getBoundingClientRect().width;
	let height = d3.select(".main").node().getBoundingClientRect().height;
	d3.json("./full_json_output.json").then(function(loaded_data) {
		getRatio(width, height, loaded_data.length);
	// 	d3.select(".blocker").style("display", "none");
	// 	d3.selectAll("input").on("change", changeSelection);
	// 	loaded_data.forEach(function(e){ return e.is_opaque = 100})
	// 	data = loaded_data;
	//   	draw();

	});
}

function getRatio(wid, hei, numRectangles){
	let normalizedAspectRatio = (hei/wid) * rectangleRatio;
	gridRows = Math.ceil(Math.sqrt(normalizedAspectRatio * numRectangles));
	gridColumns = Math.ceil(Math.sqrt(numRectangles/normalizedAspectRatio));

	xml_http_post("http://localhost:8070", [gridColumns, gridRows], function (req) {
        data = JSON.parse(req.responseText);
        draw();
    })
}


function draw(){
		let width = d3.select(".main").node().getBoundingClientRect().width;
		let height = d3.select(".main").node().getBoundingClientRect().height;

		let holder = d3.select(".main").select("canvas");
		holder.attr("width", width);
		holder.attr("height", height);

		let rectWidth = width/gridColumns;
		let rectHeight = height/gridRows;

		const ctx = holder.node().getContext('2d');
  		ctx.save();
  		

  		for (var i = 0; i < data.length; i++){

  			if (i == 250) {
  				console.log(data[i]);
  			}
  			const point = data[i];
		    ctx.fillStyle = d3.hsl(point.hue/2, point.saturation/255, point.value/255);
		    if (point.grid_point){
		    	// ctx.fillRect(point.grid_point[0]/100 * width, point.grid_point[1]/100 * height, 5, 5);
		    	let base_image = new Image();
		    	let url = "./small_images/" + point.book_image.split("/")[point.book_image.split("/").length-1];
		    	base_image.src = url;
		    	base_image.onload = function(){
				  ctx.drawImage(base_image, point.grid_point[0] * rectWidth, point.grid_point[1] * rectHeight, rectWidth, rectHeight); // Or at whatever offset you like
				};
		    }
  		}



		// let books = holder.selectAll(".book")
		//   			.data(data, function(id){ return id.isbn13})

		// books
		// 	.style("display", function(d){ return d.is_opaque === 100 ? "block" : "none"})

		// books.enter().append("image")
		//   	.attr("class", "book")
		//   	.attr("x", function(book){ 
		//   		if (book.grid_point){
		//   			return "calc(100% / 90 * " + book.grid_point[0] + ")";
		//   		} else {
		//   			return "-500px";
		//   		}
		//   	})
		//   	.attr("y", function(book){ 
		//   	if (book.grid_point){
		//   		return "calc(100% / 61 * " + book.grid_point[1] + ")";
		//   		} else {
		//   			return "-500px";
		//   		}
		//   	})
		//   	.style("display", function(d){ return d.is_opaque === 100 ? "block" : "none"})
		//   	.style("background-color", function(book){ return d3.hsl(book.hue/2, book.saturation/255, book.value/255)})
		//   	// .on("mouseenter", function(d){
		//   	// 	d3.select(this).classed("large", true);
		//   	// 	d3.select(this).select("img").attr("src", function(e){ return e.book_image});
		//   	// })
		//   	// .on("mouseout", function(d){
		//   	// 	d3.select(this).classed("large", false);
		//   	// 	d3.select(this).select("img").attr("src", function(e){ 
		//   	// 		let url = e.book_image.split("/")[e.book_image.split("/").length-1];
		//   	//  		return "./small_images/" + url;
		//   	// 	});
		//   	// })
		  	
		//   	.attr("xlink:href", function(d){
		//   		let url = d.book_image.split("/")[d.book_image.split("/").length-1];
		//   	 	return "./small_images/" + url;
		//   	 })
	 //  		// .attr("src", function(d){ return d.book_image})

	 ctx.restore();

}

function changeSelection(){
	gender = [];
	fiction = [];
	genre = [];

	let genderSelection = d3.select("#gender").selectAll("input").each(function(e){
		if (d3.select(this).property("checked")){
			gender.push(d3.select(this).attr("value"));
		}
	});

	let fictionSelection = d3.select("#fictional").selectAll("input").each(function(e){
		if (d3.select(this).property("checked")){
			fiction.push(d3.select(this).attr("value"));
		}
	});

	let genreFiction = d3.select("#f_genres").selectAll("input").each(function(e){
		if (d3.select(this).property("checked")){
			genre.push(d3.select(this).attr("value"));
		}
	});

	let genreNonFiction = d3.select("#n_genres").selectAll("input").each(function(e){
		if (d3.select(this).property("checked")){
			genre.push(d3.select(this).attr("value"));
		}
	});

	for (var i = 0; i < data.length; i++){
		data[i]["is_opaque"] = determineOpacity(data[i]);
	}

	draw();

}



function determineOpacity(d){
	if (gender.length > 0){
		if (!gender.includes(d["gender"])){
			return 0;
		}
	} 

	if (fiction.length > 0){
		if (!fiction.includes("" + d["is_fiction"])){
			return 0;
		}
	}

	//need to distinguish between fiction crime and non-fiction crime etc.
	if (genre.length > 0){
		if (!genre.includes(d["main_genre"])){
			return 0;
		}
	}
	return 100;

}