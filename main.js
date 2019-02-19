let data = [];

//selections
let gender = [];
let fiction = [];
let genre = [];

window.onload =function(e){
	setup();
}

function setup(){
	let bodyWidth = d3.select(".main");
	d3.json("./full_json_output.json").then(function(loaded_data) {
		d3.select(".blocker").style("display", "none");
		d3.selectAll("input").on("change", changeSelection);
		loaded_data.forEach(function(e){ return e.is_opaque = 100})
		data = loaded_data;
	  	draw();

	});
}


function draw(){
		let holder = d3.select(".main");

		let books = holder.selectAll(".book")
		  			.data(data, function(id){ return id.isbn13})

		books
			.style("display", function(d){ return d.is_opaque === 100 ? "block" : "none"})

		books.enter().append("div")
		  	.attr("class", "book")
		  	.style("left", function(book){ 
		  		if (book.grid_point){
		  			return "calc(100% / 90 * " + book.grid_point[0] + ")";
		  		} else {
		  			return "-500px";
		  		}
		  	})
		  	.style("top", function(book){ 
		  	if (book.grid_point){
		  		return "calc(100% / 61 * " + book.grid_point[1] + ")";
		  		} else {
		  			return "-500px";
		  		}
		  	})
		  	.style("display", function(d){ return d.is_opaque === 100 ? "block" : "none"})
		  	.style("background-color", function(book){ return d3.hsl(book.hue/2, book.saturation/255, book.value/255)})
		  	.on("mouseenter", function(d){
		  		d3.select(this).classed("large", true);
		  		d3.select(this).select("img").attr("src", function(e){ return e.book_image});
		  	})
		  	.on("mouseout", function(d){
		  		d3.select(this).classed("large", false);
		  		d3.select(this).select("img").attr("src", function(e){ 
		  			let url = e.book_image.split("/")[e.book_image.split("/").length-1];
		  	 		return "./small_images/" + url;
		  		});
		  	})
		  	.append("img")
		  	.attr("src", function(d){
		  		let url = d.book_image.split("/")[d.book_image.split("/").length-1];
		  	 	return "./small_images/" + url;
		  	 })
	  		// .attr("src", function(d){ return d.book_image})

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