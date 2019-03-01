import Magnifier from "./magnifier.js";

let data = [];

//selections
let gender = [];
let fiction = [];
let genre = [];

let rectangleRatio = 0.6666667; //the width to height ratio or rectangles is generally around 1.5
let gridColumns;
let gridRows;

let width, height;

let spriteSheets = {}
let smallImages = {};

let holder;
let ctx;


let mag = new Magnifier();


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
                alert("Your browser does not support AJAX!");
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

function loadSpriteSheet(file, objName, func){
	let sSheet = new Image();
	let url = file;
	sSheet.src = url;
	sSheet.onload = function(){
		spriteSheets[objName] = sSheet;
		func();
	};
}

function setup(){
	width = d3.select(".main").node().getBoundingClientRect().width;
	height = d3.select(".main").node().getBoundingClientRect().height;
	holder = d3.select(".main").select("#mainCanvas");
	holder.attr("width", width);
	holder.attr("height", height);
	ctx = holder.node().getContext('2d');
	mag.init();

	window.addEventListener('mousemove', mag.moveMagnifier, false);

	d3.json("./../data/full_json_output.json").then(function(loaded_data) {

		loadSpriteSheet("./../images/sprite_sheet_1.jpg", "one", () => loadSpriteSheet("./../images/sprite_sheet_2.jpg", "two", load));

		function load(){
			getRatio(width, height, loaded_data.length);
			mag.setSpriteSheets(spriteSheets, loaded_data);

		}

	});
}

function getRatio(wid, hei, numRectangles){
	let normalizedAspectRatio = (hei/wid) * rectangleRatio;
	gridRows = Math.ceil(Math.sqrt(normalizedAspectRatio * numRectangles));
	gridColumns = Math.ceil(Math.sqrt(numRectangles/normalizedAspectRatio));

	xml_http_post("http://localhost:8070", [gridColumns, gridRows], function (req) {
        data = JSON.parse(req.responseText);
        mag.setData(data);
        mag.setDimensions(width, height, gridRows, gridColumns);
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
	    	if (i < 2500){
	    		ctx.drawImage(spriteSheets["one"], i * 20, 0, 20, 30, point.grid_point[0] * rectWidth, point.grid_point[1] * rectHeight, rectWidth, rectHeight); //
	    	} else {
	    		ctx.drawImage(spriteSheets["two"], (i - 2500) * 20, 0, 20, 30, point.grid_point[0] * rectWidth, point.grid_point[1] * rectHeight, rectWidth, rectHeight); //
	    	}
	    	
	    }
  	}

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