let data = [];

//selections
let gender = [];
let fiction = [];
let genre = [];

let rectangleRatio = 0.6666667; //the width to height ratio or rectangles is generally around 1.5
let gridColumns;
let gridRows;

let width, height;

let smallImages = {};
let largeImages = {};

let holder;
let magnifier;
let ctx;

let magnifierCtx;


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


function preloadLargeImages(){
	for (var i = 0; i < data.length; i++){
		let point = data[i];
			if (point["grid_point"]){
				if (!largeImages[point["isbn13"]]){
					let base_image = new Image();
				    let url = point.book_image;
				    base_image.src = url;
				    base_image.onload = function(){
				    	largeImages[point["isbn13"]] = base_image;
					};
			}

		}
	}
}

function setup(){
	width = d3.select(".main").node().getBoundingClientRect().width;
	height = d3.select(".main").node().getBoundingClientRect().height;
	holder = d3.select(".main").select("#mainCanvas");
	holder.attr("width", width);
	holder.attr("height", height);

	magnifier = d3.select(".main").select("#magnifier");
	magnifier.attr("width", 300);
	magnifier.attr("height", 300);
	ctx = holder.node().getContext('2d');



	d3.json("./full_json_output.json").then(function(loaded_data) {
		getRatio(width, height, loaded_data.length);
		preloadLargeImages();
		window.addEventListener('mousemove', moveMagnifier, false);
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

	let rectWidth = width/gridColumns;
	let rectHeight = height/gridRows;
  	ctx.save();

  	for (var i = 0; i < data.length; i++){
  		const point = data[i];
	    ctx.fillStyle = d3.hsl(point.hue/2, point.saturation/255, point.value/255);
	    if (point.grid_point){
	    	if (smallImages[point["isbn13"]]){
	    		ctx.drawImage(smallImages[point["isbn13"]], point.grid_point[0] * rectWidth, point.grid_point[1] * rectHeight, rectWidth, rectHeight); // Or at whatever offset you like
	    	} else {
		    	let base_image = new Image();
		    	let url = "./small_images/" + point.book_image.split("/")[point.book_image.split("/").length-1];
		    	base_image.src = url;
		    	base_image.onload = function(){
		    		smallImages[point["isbn13"]] = base_image;
				  	ctx.drawImage(base_image, point.grid_point[0] * rectWidth, point.grid_point[1] * rectHeight, rectWidth, rectHeight); // Or at whatever offset you like
				};
			}

	    }
  	}

	ctx.restore();
}

function getMousePos(evt) {
    var rect = holder.node().getBoundingClientRect();

    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * holder.node().width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * holder.node().height
    };
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