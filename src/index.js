import * as d3 from 'd3';
import countby from 'lodash.countby';

import OSD from "./openSeaDragon.js";

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
	"textCover": [],
	"faceCover": [],
	"numFaces": [],
	"colour": []
}

let rectangleRatio = 0.6666667; //the width to height ratio or rectangles is generally around 1.5
let gridColumns;
let gridRows;

let width, height;

let spriteSheets = {}
let smallImages = {};

let holder;
let ctx;

let indexLocations = [];

let mag = new Magnifier();
let genreTable = new SortableTable();
let motifTable = new SortableTable();
let fictionalityTable = new CircleGraph();
let genderTable = new SortableTable();
let textPercentGraph = new AreaChart();
let facePercentGraph = new AreaChart();
let numFaceGraph = new SortableTable();
let colourGraph = new SortableTable();

let osd = new OSD();

window.onload =function(e){
	osd.init();
	// setup();
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
	//we handle the area chart data slightly differently
	if (selectionName === "textCover" || selectionName === "faceCover"){
		selections[selectionName] = selection;
	} else {
		if (!selections[selectionName].find(function(d){ return d === selection})){
			selections[selectionName].push(selection);
		} else {
			let spliceIndex = selections[selectionName].findIndex(function(d){ return d === selection});
			selections[selectionName].splice(spliceIndex, 1);
		}
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

	if (selections["textCover"].length > 1){
		filteredData = filteredData.filter(function(d){
			if (d["text"] && d["text"] >= selections["textCover"][0] && d["text"] <= selections["textCover"][1]){
				return true;
			} else {
				return false;
			}
		})
	}

	if (selections["faceCover"].length > 1){
		filteredData = filteredData.filter(function(d){
			if (d["faces"] && d["faces"]["percentage"] 
				&& d["faces"]["percentage"] >= selections["faceCover"][0] && d["faces"]["percentage"] <= selections["faceCover"][1]){
				return true;
			} else {
				return false;
			}
		})
	}

	if (selections["numFaces"].length > 0){
		filteredData = filteredData.filter(function(d){
			if (d["faces"] && d["faces"]["totalFaces"] 
				&& selections["numFaces"].find(function(e) {
					if (e !== "5+"){
						return parseInt(e) === parseInt(d["faces"]["totalFaces"]);
					} else {
						return d["faces"]["totalFaces"] > 4;
					}
				})) {
				return true;
			} else {
				return false;
			}
		})
	}



	if (selections["colour"].length > 0){
		filteredData = filteredData.filter(function(d){
			if (d["hue"]) {
				if (d["value"] < 50){
					return selections["colour"].find(function(e){
						return e === "<span style='color: black'>black</span>";
					})
				} else if (d["saturation"] < 15 || (d["saturation"] < 25 && d["value"] > 225) ){
					return selections["colour"].find(function(e){
						return e === "<span style='color: white'>white</span>";
					})
				} else if (d["saturation"] < 25){
					return selections["colour"].find(function(e){
						return e === "<span style='color: #222'>grey</span>";
					})
				} else if (d["hue"] < 7.5 || d["hue"] > 165){
					return selections["colour"].find(function(e){
						return e === "<span style='color: red'>red</span>";
					})
				} else if (d["hue"] < 15){
					return selections["colour"].find(function(e){
						return e === "<span style='color: orange'>orange</span>";
					})
				} else if (d["hue"] < 37.5){
					return selections["colour"].find(function(e){
						return e === "<span style='color: yellow'>yellow</span>";
					})
				} else if (d["hue"] < 80){
					return selections["colour"].find(function(e){
						return e === "<span style='color: green'>green</span>";
					})
				} else if (d["hue"] < 120){
					return selections["colour"].find(function(e){
						return e === "<span style='color: blue'>blue</span>";
					})
				} else if (d["hue"] >= 120 && d["hue"] <= 165){
					return selections["colour"].find(function(e){
						return e === "<span style='color: magenta'>magenta</span>";
					})
				} else {
					return false;
				}
			} else {
				return false;
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
    data = loaded_data.filter(function(e){ return e["cluster_point"] !== undefined});
    filteredData = data;
    mag.setData(data);
    mag.setDimensions(width, height, gridRows, gridColumns);
    draw();
    initControls(data, filteredData);
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

function rollupAndCountNested(attribute1, attribute2, data){
	let thisData = d3.nest()
					.key(function(d){ return d[attribute1][attribute2]})
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
	numFaceGraph.init(d3.select("#numFaces").select("svg"));
	colourGraph.init(d3.select("#bgColour").select("svg"));

	//circle chart
	fictionalityTable.init(d3.select("#ficOrNotChart").select("svg"));

	//area charts
	textPercentGraph.init(d3.select("#coverText").select("svg"));
	facePercentGraph.init(d3.select("#faceCover").select("svg"));

	drawCharts();
}

function formatDataForNumFaces(whichData, cutOff){
	let arr = rollupAndCountNested("faces", "totalFaces", whichData)
			.filter(function(d){ return d.key !== "undefined"});
	let restrictedArray = [];
	let cutOffTotal = 0;
	for (var i = 0; i < arr.length; i++){
		if (parseInt(arr[i].key) <= 4){
			restrictedArray.push(arr[i]);
		} else {
			cutOffTotal++;
		}
	}
	restrictedArray.push({"key": "5+", "value": cutOffTotal});
	return restrictedArray;
}

function formatColour(whichData){

	let thisData = d3.nest()
					.key(function(d){ 
						if (d["value"] < 50){
							return "<span style='color: black'>black</span>";
						} else if (d["saturation"] < 15 || (d["saturation"] < 25 && d["value"] > 225)){
							return "<span style='color: white'>white</span>";
						} else if (d["saturation"] < 25){
							return "<span style='color: #222'>grey</span>";
						} else if (d["hue"] > 165 || d["hue"] < 7.5){
							return "<span style='color: red'>red</span>";
						} else if (d["hue"] < 15) {
							return "<span style='color: orange'>orange</span>";
						} else if (d["hue"] < 37.5) {
							return "<span style='color: yellow'>yellow</span>";
						} else if (d["hue"] < 80) {
							return "<span style='color: green'>green</span>";
						} else if (d["hue"] < 120){
							return "<span style='color: blue'>blue</span>";
						} else {
							return "<span style='color: magenta'>magenta</span>";
						}
					})
					.rollup(function(ids) {
						return ids.length; 
					})
					.entries(whichData);
	return thisData;
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

	let numFacesTotal = formatDataForNumFaces(data, 5);
	let numFacesFiltered = formatDataForNumFaces(filteredData, 5);
	numFaceGraph.setData(numFacesTotal, numFacesFiltered, selections["numFaces"]);
	numFaceGraph.draw((newVal) => clickCallback("numFaces", newVal));

	let colourBgTotal = formatColour(data);
	let colourFiltered = formatColour(filteredData);
	colourGraph.setData(colourBgTotal, colourFiltered, selections["colour"]);
	colourGraph.draw((newVal) => clickCallback("colour", newVal));

	//circle chart
	let fictionalityTotal = formatFictionality(data);
	let fictionalityFiltered = formatFictionality(filteredData);
	fictionalityTable.setData(fictionalityTotal, fictionalityFiltered, selections["fictionality"]);
	fictionalityTable.draw((newVal) => clickCallback("fictionality", newVal));

	//area charts
	let textCoverTotal = rollupAndCount("text", data);
	let textCoverFiltered = rollupAndCount("text", filteredData);
	textPercentGraph.setData(textCoverTotal, textCoverFiltered, selections["textCover"]);
	textPercentGraph.draw((newVal) => clickCallback("textCover", newVal));

	//we also filter out 0 values here since there's so many of them they skew the graph
	let faceCoverTotal = rollupAndCountNested("faces", "percentage", data)
		.filter(function(d){ return parseInt(d.key) > 0});
	let faceCoverFiltered = rollupAndCountNested("faces", "percentage", filteredData)
		.filter(function(d){ return parseInt(d.key) > 0});
	facePercentGraph.setData(faceCoverTotal, faceCoverFiltered, selections["faceCover"]);
	facePercentGraph.draw((newVal) => clickCallback("faceCover", newVal));

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
	    		ctx.drawImage(spriteSheets["one"], (point["index"]) * 20, 0, 20, 30, filteredData[i]["grid_point"][0] * rectWidth, filteredData[i]["grid_point"][1] * rectHeight, rectWidth, rectHeight); 
	    	} else {
	    		ctx.drawImage(spriteSheets["two"], ((point["index"]) - 2500) * 20, 0, 20, 30, filteredData[i]["grid_point"][0] * rectWidth, filteredData[i]["grid_point"][1] * rectHeight, rectWidth, rectHeight); 
	    	}
	    	
	    }
  	}

	ctx.restore();
}

