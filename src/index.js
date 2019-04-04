import * as d3 from 'd3';
import countby from 'lodash.countby';

import Magnifier from "./magnifier.js";
import SortableTable from "./sortableTable.js";
import CircleGraph from "./circleGraph.js";
import AreaChart from "./areaChart.js";

import css from './../css/main.css';
import loaded_data from "./../data/full_json_output.json";
import sprite1 from "./../images/sprite_sheet_1.jpg";
import sprite2 from "./../images/sprite_sheet_2.jpg";

let data = [];
let filteredData = [];

//selections
let selections = 
{
	"motifs": [],
	"genres": [],
	"fictionality": [],
	"gender": [],
	"textCover": []
}

let rectangleRatio = 0.6666667; //the width to height ratio or rectangles is generally around 1.5
let gridColumns;
let gridRows;

let width, height;

let spriteSheets = {}
let smallImages = {};

let holder;
let ctx;

let mag = new Magnifier();
let genreTable = new SortableTable();
let motifTable = new SortableTable();
let fictionalityTable = new CircleGraph();
let genderTable = new SortableTable();
let textPercentGraph = new AreaChart();

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

function clickCallback(selectionName, selection){
	if (!selections[selectionName].find(function(d){ return d === selection})){
		selections[selectionName].push(selection);
	} else {
		let spliceIndex = selections[selectionName].findIndex(function(d){ return d === selection});
		selections[selectionName].splice(spliceIndex, 1);
	}

	filterData();
}

function doSelectionFilter(value, cat){
	if (selections[value].length > 0){
		filteredData = filteredData.filter(function(d){
			if (selections[value].find(function(e) { return e === d[cat]})){
				return true;
			} else {
				return false;
			}
		})
	}
}

function filterData(){
	filteredData = data;
	if (selections["motifs"].length > 0){
		filteredData = filteredData.filter(function(d){
			if (selections["motifs"].find(function(e) { 
				if (d["labels"].find(function(f){
					return f === e;
				})) {
					return true;
				} else {
					return false;
				}
			})){
				return true;
			} else {
				return false;
			}
		})
	} 

	doSelectionFilter("genres", "main_genre");
	doSelectionFilter("gender", "gender");

	if (selections["fictionality"].length === 1){
		filteredData = filteredData.filter(function(d){
			if (selections["fictionality"][0] === "fiction"){
				return d["is_fiction"] === 1;
			} else {
				return d["is_fiction"] === 0;
			}

		})
	}

	drawCharts();
	draw();
	mag.setData(filteredData);
}

function setup(){
	width = d3.select(".main").node().getBoundingClientRect().width;
	height = d3.select(".main").node().getBoundingClientRect().height;
	holder = d3.select(".main").select("#mainCanvas");
	holder.attr("width", width);
	holder.attr("height", height);
	ctx = holder.node().getContext('2d');
	mag.init();

	//toggle accordians open and close
	d3.selectAll(".controlsHeader").on("click", function(){
		d3.selectAll(".controlsHolder").classed("closed", function () {
			return !d3.select(this).classed("closed");
		});
	})


	window.addEventListener('mousemove', mag.moveMagnifier, false);

	loadSpriteSheet(sprite1, "one", () => loadSpriteSheet(sprite2, "two", load));

	function load(){
		getRatio(width, height, loaded_data.length);
		mag.setSpriteSheets(spriteSheets, loaded_data);
	}

}

function getRatio(wid, hei, numRectangles){
	let normalizedAspectRatio = (hei/wid) * rectangleRatio;
	gridRows = Math.ceil(Math.sqrt(normalizedAspectRatio * numRectangles));
	gridColumns = Math.ceil(Math.sqrt(numRectangles/normalizedAspectRatio));

	xml_http_post("http://localhost:8070", [gridColumns, gridRows], function (req) {
        data = JSON.parse(req.responseText);
        filteredData = data;
        mag.setData(data);
        mag.setDimensions(width, height, gridRows, gridColumns);
        draw();
        initControls(data, filteredData);
    })
}

function rollupAndCount(attribute, data){
	let thisData = d3.nest()
					.key(function(d){ return d[attribute]})
					.rollup(function(ids) {
						return ids.length; 
					})
					.entries(data);
	return thisData;

}

function formatMotifs(array){
	let newArray = [];
	for (var i = 0; i < array.length; i++){
		let matched = newArray.find(function(d){ return d.key === array[i]});
		if (matched) {
			matched["value"] ++;
		} else {
			let newObj = {"key": array[i], "value": 1};
			newArray.push(newObj);
		}
	}

	newArray = newArray.filter(function(d){
		return d.value > 1;
	})

	return newArray;
}

function formatFictionality(array){
	let fictional = 0;
	let nonfictional = 0;

	for (var i = 0; i < array.length; i++){
		if (array[i]["is_fiction"] === 1){
			fictional++;
		} else {
			nonfictional++;
		}
	}

	return [{"key": "fiction", "value": fictional}, {"key": "nonfiction", "value": nonfictional}]
}

function initControls(data, filteredData){
	//bar charts
	genreTable.init(d3.select("#genreChart").select("svg"));
	motifTable.init(d3.select("#motifsChart").select("svg"));	
	genderTable.init(d3.select("#genderChart").select("svg"));

	//circle charts
	fictionalityTable.init(d3.select("#ficOrNotChart").select("svg"));

	//area charts
	textPercentGraph.init(d3.select("#coverText").select("svg"));

	drawCharts();
}

function drawCharts(){
	//bar charts
	let genresFiltered = rollupAndCount("main_genre", filteredData);
	let genresTotal = rollupAndCount("main_genre", data);
	genreTable.setData(genresTotal, genresFiltered, selections["genres"]);
	genreTable.draw((newVal) => clickCallback("genres", newVal));

	let flatMotifsTotal = data.map(function(d){ return d.labels}).flat();
	flatMotifsTotal = formatMotifs(flatMotifsTotal);	
	let flatMotifsFiltered = filteredData.map(function(d){ return d.labels}).flat();
	flatMotifsFiltered = formatMotifs(flatMotifsFiltered);
	motifTable.setData(flatMotifsTotal, flatMotifsFiltered, selections["motifs"]);
	motifTable.draw((newVal) => clickCallback("motifs", newVal));

	let genderTotal = rollupAndCount("gender", data);
	let genderFiltered = rollupAndCount("gender", filteredData);
	genderTable.setData(genderTotal, genderFiltered, selections["gender"]);
	genderTable.draw((newVal) => clickCallback("gender", newVal));

	//circle charts
	let fictionalityTotal = formatFictionality(data);
	let fictionalityFiltered = formatFictionality(filteredData);
	fictionalityTable.setData(fictionalityTotal, fictionalityFiltered, selections["fictionality"]);
	fictionalityTable.draw((newVal) => clickCallback("fictionality", newVal));

	//area charts
	let textCoverTotal = rollupAndCount("text", data);
	let textCoverFiltered = rollupAndCount("text", filteredData);
	textPercentGraph.setData(textCoverTotal, textCoverFiltered, selections["textCover"]);
	textPercentGraph.draw((newVal) => clickCallback("textCover", newVal));
	
}


function draw(){

	let rectWidth = width/gridColumns;
	let rectHeight = height/gridRows;
  	ctx.save();
  	ctx.clearRect(0,0,width,height);

  	
  	for (var i = 0; i < filteredData.length; i++){
  		const point = filteredData[i];
	    ctx.fillStyle = d3.hsl(point.hue/2, point.saturation/255, point.value/255);
	    if (point.grid_point){
	    	if (point["index"] < 2500){
	    		ctx.drawImage(spriteSheets["one"], (point["index"]) * 20, 0, 20, 30, point.grid_point[0] * rectWidth, point.grid_point[1] * rectHeight, rectWidth, rectHeight); //
	    	} else {
	    		ctx.drawImage(spriteSheets["two"], ((point["index"]) - 2500) * 20, 0, 20, 30, point.grid_point[0] * rectWidth, point.grid_point[1] * rectHeight, rectWidth, rectHeight); //
	    	}
	    	
	    }
  	}

	ctx.restore();
}

