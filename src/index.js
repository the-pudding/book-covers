import 'array-flat-polyfill';
import {select, selectAll} from "d3-selection";
import {nest} from "d3-collection";
const d3 = {select, selectAll, nest}; //to simplify how we call these funcs
import countby from 'lodash.countby';
import OSD from "./openSeaDragon.js";

//our classes
import Dropdown from "./dropdown.js";
import Searcher from "./search.js";

import css from './../css/main.scss';
import loaded_data from "./../data/json_output.json";

let data = []; //unfiltered
let filteredData = [];

//selections
let selections =
{
	"motifs": [],
	"genre": [],
	"fictionality": [],
	"gender": []
}

//our filters... haven't updated the nomanclature despite change in appearance
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
			//we can also clear just one type of selection
			selections[selectionName] = [];
		}

	} else {
		if (selection.length === 0){
			if (selectionName === "all"){
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
		} else if (selectionName === "all"){
			let selectionArray = ["gender", "genre", "fictionality", "motifs"];
			//thankfully, all our options have unique names,
			//so when we're deselecting from "all" selection menu, we
			//can just search by name... worth keeping an eye on though
			for (var i = 0; i < selectionArray.length; i++){
				let selectName = selectionArray[i];
				if (selections[selectName].find(function(d){ return d === selection})){
					let spliceIndex = selections[selectName].findIndex(function(d){ return d === selection});
					selections[selectName].splice(spliceIndex, 1);
				}
			}
		} else {
			//add or remove selections
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

//a simplified function to filter out values when a gender or genre is
//selected as an input value
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

//upper level function to filter data when selections are changed
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
    initControls(data, filteredData); //draw our filters
    //initialize our main searcher at the top of the page
    searcher.init(
    	d3.select("#bookSearch").node(),
    	d3.select("#mainSearch .searchResults .searchResultHolder").node(),
    	loaded_data,
    	data_point => osd.goToBook(data_point));

    //clear all filters when we click this
	d3.select("#clearAll").on("click", function(d){
		clickCallback();
	});

	d3.select("#filter").on("click", function(d){
		//toggle the button's class so as to switch the caret direction
		d3.select(this).classed("closed", d3.select(this).classed("closed") ? false : true);
		//collapse/expand the filter div
		let filters = d3.select("#filters");
		filters.classed("collapsed", filters.classed("collapsed") ? false : true);
	});

	//clear all selections when the big clearAll button is clicked
	//(note > only visible on smaller screens)
	d3.select("#clearAll").on("click", clickCallback);

	//expand our bottom bar so we see our little description
	d3.select("#title").on("click", function(){
		if (!d3.select("#bottomBar").classed("readMore") && !d3.select("#bottomBar").classed("fullyExpanded")){
			d3.select("#bottomBar").classed("readMore", true);
			d3.select("#bottomBar").classed("collapsed",false);
		} else {
			d3.select("#bottomBar").classed("readMore", false);
			d3.select("#bottomBar").classed("fullyExpanded", false);
			d3.select("#bottomBar").classed("collapsed",true);
		}
	});

	//expand our bottom bar so it fills the whole screen

	d3.select(".method").on("click", function(){
		d3.select("#bottomBar").classed("fullyExpanded", true);
		d3.select("#bottomBar").classed("collapsed",false);
	});

	//close the method stuff when we click the "method" heading
	d3.select(".methodTitle").on("click", function(){
		d3.select("#bottomBar").classed("fullyExpanded", false);
	});
}

function initControls(data, filteredData){

	genderDropdown.init("gender");
	genreDropdown.init("genre");
	motifDropdown.init("motif");
	fictionalityDropdown.init("fictionality");
	selectedDropdown.init("selected");
	drawFilters();
}

/*start of helper functions for finding how many books
match given filter*/

//helper function to see how many books fit the selection's criteria
function rollupAndCount(attribute, data){
	let thisData = d3.nest()
					.key(function(d){ return d[attribute]})
					.rollup(function(ids) {
						return ids.length;
					})
					.entries(data);
	return thisData;

}

//another helper for when data is nested
function rollupAndCountNested(attribute1, attribute2, data){
	let thisData = d3.nest()
					.key(function(d){ return d[attribute1][attribute2]})
					.rollup(function(ids) {
						return ids.length;
					})
					.entries(data);
	return thisData;

}

//sees how many books fit a given selected motif filter
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

//helper for the "selected" coumn -- looks at all selections
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

/*end of helper functions*/


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
