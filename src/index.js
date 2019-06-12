import 'array-flat-polyfill';
import {select, selectAll} from "d3-selection";
import {nest} from "d3-collection";
const d3 = {select, selectAll, nest};

import countby from 'lodash.countby';
import OSD from "./openSeaDragon.js";

import Dropdown from "./dropdown.js";
import Searcher from "./search.js";

import css from './../css/main.scss';
import loaded_data from "./../data/json_output.json";

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

let genderDropdown = new Dropdown();
let genreDropdown = new Dropdown();
let fictionalityDropdown = new Dropdown();
let motifDropdown = new Dropdown();
let selectedDropdown = new Dropdown();
let searcher = new Searcher();

let osd = new OSD();

window.onload =function(e){
	osd.init(loaded_data, [], selections, clickCallback);
	setup();
}

function clickCallback(selectionName, selection){

	//if the value is empty, clear that selection
	if (!selection){
		if (!selectionName){
			selections = 
			{
				"motifs": [],
				"genre": [],
				"fictionality": [],
				"gender": []
			};
		} else {
			selections[selectionName] = [];
		}

	} else {
		if (selectionName === "all"){
			let selectionArray = ["gender", "genre", "fictionality", "motifs"];
			for (var i = 0; i < selectionArray.length; i++){
				let selectName = selectionArray[i];
				if (selections[selectName].find(function(d){ return d === selection})){
					let spliceIndex = selections[selectName].findIndex(function(d){ return d === selection});
					selections[selectName].splice(spliceIndex, 1);
				}
			}
		} else {
			if (!selections[selectionName].find(function(d){ return d === selection})){
				selections[selectionName].push(selection);
			} else {
				let spliceIndex = selections[selectionName].findIndex(function(d){ return d === selection});
				selections[selectionName].splice(spliceIndex, 1);
			}
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

	doSelectionFilter("genre", "genre");
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
	drawFilters();
}

function setup(){

	data = loaded_data.filter(function(e){ return e["grid_point"] !== undefined});
    filteredData = data;
    initControls(data, filteredData);
    searcher.init(
    	d3.select("#bookSearch").node(), 
    	d3.select("#mainSearch .searchResults .resultHolder").node(), 
    	loaded_data,
    	data_point => osd.goToBook(data_point));

    //clear all filters when we click this
	d3.select("#clearAll").on("click", function(d){
		clickCallback();
	});

	d3.select("#filter").on("click", function(d){
		let filters = d3.select("#filters");
		filters.classed("collapsed", filters.classed("collapsed") ? false : true);
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

	genderDropdown.init("gender", false);
	genreDropdown.init("genre");
	motifDropdown.init("motif");
	fictionalityDropdown.init("fictionality", false);
	selectedDropdown.init("selected");
	drawFilters();
}


function drawFilters(){
	let genresFiltered = rollupAndCount("genre", filteredData);
	let genresTotal = rollupAndCount("genre", data);
	genreDropdown.setData(genresTotal, genresFiltered, selections["genre"], (newVal) => clickCallback("genre", newVal));

	let flatMotifsTotal = data.map(function(d){ return d.labels}).flat();
	flatMotifsTotal = formatMotifs(flatMotifsTotal);	
	let flatMotifsFiltered = filteredData.map(function(d){ return d.labels}).flat();
	flatMotifsFiltered = formatMotifs(flatMotifsFiltered);
	motifDropdown.setData(flatMotifsTotal, flatMotifsFiltered, selections["motifs"],(newVal) => clickCallback("motifs", newVal));

	let genderTotal = rollupAndCount("gender", data);
	let genderFiltered = rollupAndCount("gender", filteredData);
	genderDropdown.setData(genderTotal, genderFiltered, selections["gender"], (newVal) => clickCallback("gender", newVal));

	let fictionalityTotal = formatFictionality(data);
	let fictionalityFiltered = formatFictionality(filteredData);
	fictionalityDropdown.setData(fictionalityTotal, fictionalityFiltered, selections["fictionality"], (newVal) => clickCallback("fictionality", newVal));

	let selectedFiltered = countSelected(genresFiltered, genderFiltered, fictionalityFiltered, flatMotifsFiltered);
	let selectedTotal = countSelected(genresTotal, genderTotal, fictionalityTotal, flatMotifsTotal);
	selectedDropdown.setData(selectedTotal, selectedFiltered, 
		selections["fictionality"].concat(selections["genre"].concat(selections["gender"].concat(selections["motifs"]))),
		(newVal) => clickCallback("all", newVal));
}

function countSelected(genreArray, genderArray, fictArray, motifArray){
	let totalArray = [];

	totalArray = totalArray.concat(simpleFilter(genreArray, "genre"));
	totalArray = totalArray.concat(simpleFilter(genderArray, "gender"));
	totalArray = totalArray.concat(simpleFilter(fictArray, "fictionality"));
	totalArray = totalArray.concat(simpleFilter(motifArray, "motifs"));

	function simpleFilter(array, selectionVal){
		let innerArray = []
		for (var i = 0; i < selections[selectionVal].length; i++){
			let matchingVal = array.find(function(d){
				return d.key === selections[selectionVal][i];
			})
			innerArray.push(matchingVal);
		}
		return innerArray;
	}
	return totalArray;
}


