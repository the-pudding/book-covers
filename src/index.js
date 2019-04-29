import * as d3 from 'd3';
import countby from 'lodash.countby';

import OSD from "./openSeaDragon.js";

import SortableTable from "./sortableTable.js";
import CircleGraph from "./circleGraph.js";
import Searcher from "./search.js";
import ActiveFilters from "./activeFilters.js";

import css from './../css/main.css';
import loaded_data from "./../data/full_json_output.json";

let data = [];
let filteredData = [];

//selections
let selections = 
{
	"motifs": [],
	"genre": [],
	"fictionality": [],
	"gender": []
}

let genreTable = new SortableTable();
let motifTable = new SortableTable();
let fictionalityTable = new CircleGraph();
let genderTable = new SortableTable();

let searcher = new Searcher();
let activeFilters = new ActiveFilters();

let osd = new OSD();

window.onload =function(e){
	osd.init(loaded_data, [], selections, clickCallback);
	setup();
}

function clickCallback(selectionName, selection){
	//if the value is empty, clear that selection
	if (!selection){
		selections[selectionName] = [];
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
	activeFilters.updateFilters(selections);

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

	doSelectionFilter("genre", "main_genre");
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



	let unfilteredData = data.filter(x => !filteredData.includes(x));

	osd.updateData(filteredData, unfilteredData, selections);
	drawCharts();
}

function setup(){

	data = loaded_data.filter(function(e){ return e["cluster_point"] !== undefined});
    filteredData = data;
    initControls(data, filteredData);
    searcher.init(
    	d3.select("#bookSearch").node(), 
    	d3.select("#mainSearch .searchResults").node(), 
    	loaded_data,
    	data_point => osd.goToBook(data_point));

    activeFilters.init(d3.select("#activeFilters").node(), 
    		selections, 
    		clickCallback);
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

	//circle chart
	fictionalityTable.init(d3.select("#ficOrNotChart").select("svg"));

	drawCharts();
}



function drawCharts(){
	//bar charts
	let genresFiltered = rollupAndCount("main_genre", filteredData);
	let genresTotal = rollupAndCount("main_genre", data);
	genreTable.setData(genresTotal, genresFiltered, selections["genre"]);
	genreTable.draw((newVal) => clickCallback("genre", newVal));

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

	//circle chart
	let fictionalityTotal = formatFictionality(data);
	let fictionalityFiltered = formatFictionality(filteredData);
	fictionalityTable.setData(fictionalityTotal, fictionalityFiltered, selections["fictionality"]);
	fictionalityTable.draw((newVal) => clickCallback("fictionality", newVal));

}



