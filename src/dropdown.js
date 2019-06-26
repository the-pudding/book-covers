import * as d3 from "d3-selection";
import Fuse from "fuse.js";


class Dropdown {
	constructor() {
		this.holder;//top-level holder
		this.selectedHolder;//where the options in the list go

		this.name;//i.e. gender, genre etc.

		this.totalData;//unfiltered
	    this.filteredData;
	    this.selection = [];//values selected in index.js
	    this.compiledData;//data we've formatted/operated on
	    this.selectedValues = [];//formatted values representing what is currently selected

	    this.callback;

	    this.sort = "total";

	    this.init = this.init.bind(this);
	    this.setData = this.setData.bind(this);
	    this.draw = this.draw.bind(this);
	    this.drawOnePanel = this.drawOnePanel.bind(this);//draw our selections
	    this.doSort = this.doSort.bind(this);
	}

	init(name){
		this.holder = d3.select("#" + name);
		this.name = name;
		this.holder.append("h3").html(name);

		let holder = this.holder;
		let handleKeypress = this.handleKeypress;

		let results = this.holder.append("div").attr("class", "results");

		let resultHolder = results.append("div")
			.attr("class", "resultHolder");
		this.selectedHolder = resultHolder.append("div")
			.attr("class", "selectedHolder");

		//buttons at the bottom of each column to clear selections
		//functionality added in setData
		let clearButton = results.append("button")
			.text(function(){
				if (name === "fictionality"){
					return "Clear selected fictionalities";
				} else if (name === "selected"){
					return "Clear all selected";
				} else {
					return "Clear selected " + name + "s";
				}
			});

		results.append("div")
			.attr("class","bottom-gradient");

	}

	doSort(){
		//are we searching by the total data or filtered data or alphabetically?
		let theSortByData = this.compiledData;
		if (this.sort === "total"){
			theSortByData = theSortByData.sort(function(a, b){
				return b.value - a.value;
			})
		} else if (this.sort === "filtered"){
			theSortByData = theSortByData.sort(function(a, b){
					return b.filteredValue - a.filteredValue;
			})
		} else {
			theSortByData = theSortByData.sort(function(a, b){
				var textA = a.key.toUpperCase();
			    var textB = b.key.toUpperCase();
			    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
			})
		}

		this.selectedValues = theSortByData;

		this.draw();
	}

	//called from index on load, and when selection filters have changed
	setData(total, filtered, selection, callback){

		if (selection.length === 0){
			this.holder.select("h3").html(this.name);

		} else {
			this.holder.select("h3").html(this.name + " (" + selection.length + ")");
		}

		if(selection.length > 0){
			if(this.holder.attr("id") == "selected"){
				this.holder.style("visibility","visible");
			}
			d3.select("#clearAll").style("display","block");
			this.holder.select("button").style("display","block");
		}
		else{
			if(this.holder.attr("id") == "selected"){
				this.holder.style("visibility",null);
			}
			d3.select("#clearAll").style("display",null);
			this.holder.select("button").style("display",null);
		}

		this.totalData = total;
		this.filteredData = filtered;
		this.selection = selection;
		this.callback = callback;

		//format the data
		this.compiledData = this.totalData.map(function(d){
			let filteredValue = filtered.find(function(e){
				if (e && d && e.key && d.key){
					return e.key === d.key;
				}
			});
			let returnedObject = new Object();
			returnedObject = d;

			if (filteredValue){
				returnedObject["filteredValue"] = filteredValue.value;
				return returnedObject;
			} else {
				returnedObject["filteredValue"] = 0;
				return returnedObject;
			}
		});


		let cb = this.callback;

		//when we hit the clear button at the bottom, set selection to []
		this.holder.select("button")
			.on("click", function(){
				cb([]);
			});

		//resort
		this.doSort();

	}

	draw(){
		this.drawOnePanel(this.selectedHolder, this.selectedValues, this.callback);
	}

	//draw out options :)
	drawOnePanel(holder, values, callback){
		let theSelected = this.selection;

		let panel = holder
			.selectAll(".result")
			.data(values, function(d){ return d.key});

		panel.exit().remove();

		//doing this as absolutely positioned so we can update the vals rather than
		//redrawing everything
		panel
		.style("top", function(d, i){ return i * 2 + "em"})
		.each(function(d){
				let theThis = d3.select(this);
				theThis.select(".valName").select("p").html(d.key);
				theThis.select(".count").select("p").html(d.filteredValue + " of " + d.value);

				if (theSelected.includes(d.key)) {
					theThis.select(".checker").classed("checked", true);
				} else {
					theThis.select(".checker").classed("checked", false);
				}
			})

		panel.enter()
			.append("div")
			.attr("class", "result")
			.style("top", function(d, i){ return i * 2 + "em"})
			.each(function(d){
				let theThis = d3.select(this);
				if (theSelected.includes(d.key)) {
					theThis.append("div").append("p").attr("class", "checker checked iconAfter");
				} else {
					theThis.append("div").append("p").attr("class", "checker iconAfter");
				}

				theThis.append("div").attr("class", "valName").append("p").html(d.key);
				theThis.append("div").attr("class", "count").append("p").html(d.filteredValue + " of " + d.value);
			}).on("click", function(d){
				callback(d.key);
			})
	}



}

export default Dropdown;
