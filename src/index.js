import 'array-flat-polyfill';
import {select, selectAll} from "d3-selection";
import {nest} from "d3-collection";
const d3 = {select, selectAll, nest};

import countby from 'lodash.countby';
import OSD from "./openSeaDragon.js";

import Dropdown from "./dropdown.js";
import Searcher from "./search.js";

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

let genderDropdown = new Dropdown();
let genreDropdown = new Dropdown();
let fictionalityDropdown = new Dropdown();
let motifDropdown = new Dropdown();
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
	drawFilters();
}

function setup(){

	data = loaded_data.filter(function(e){ return e["cluster_point"] !== undefined});
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

	genderDropdown.init("gender");
	genreDropdown.init("genre");
	motifDropdown.init("motif");
	fictionalityDropdown.init("fictionality");
	drawFilters();
}



function drawFilters(){
	let genresFiltered = rollupAndCount("main_genre", filteredData);
	let genresTotal = rollupAndCount("main_genre", data);
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

}



