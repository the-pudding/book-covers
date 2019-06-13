import * as d3 from "d3-selection";
import Fuse from "fuse.js";


class Dropdown {
	constructor() {
		this.holder;
		this.selectedHolder;
		this.unselectedHolder;
		this.input;
		this.fuse;
		this.searchEmpty = true;
		this.hasSearch = true;

		this.name;

		this.totalData;
        this.filteredData;
        this.selection = [];
        this.compiledData;
        this.selectedValues = [];
        this.unselectedValues = [];
        this.results = [];

        this.callback;

        this.sort = "total";

        this.init = this.init.bind(this);
       	this.handleKeypress = this.handleKeypress.bind(this);
        this.setData = this.setData.bind(this);
        this.draw = this.draw.bind(this);
        this.drawOnePanel = this.drawOnePanel.bind(this);
        this.changeSort = this.changeSort.bind(this);
        this.doSort = this.doSort.bind(this);


	}

	init(name, hasSearch){
		this.holder = d3.select("#" + name);
		this.name = name;
		this.holder.append("h3").html(name);

		if (hasSearch !== undefined){
			this.hasSearch = hasSearch;
		}

		let theSelect = this.holder.append("select");
		theSelect.attr("id", name + "select");

		theSelect.append("option").attr("value", "alphabetic")
			.html("Sort Alphabetically");

		theSelect.append("option").attr("value", "total")
			.attr("selected", "true")
			.html("Sort by Total Count");

		theSelect.append("option").attr("value", "filtered")
			.html("Sort by Filtered Count");
		
		let changeSort = this.changeSort;
		theSelect.on("change", function(d, e){
			changeSort(this.value);
		});

		let holder = this.holder;
		let handleKeypress = this.handleKeypress;

		let results = this.holder.append("div").attr("class", "results");
		
		if (this.hasSearch){
			let searchHolder = results.append("div").attr("class", "searchHolder iconBefore");

			this.input = searchHolder.append("div")
				.attr("style", "position: relative");
		
			this.input.append("input")
				.attr("class", "searchBar")
				.attr("placeholder", function(){
					if (window.innerWidth > 450){
						if (name === "fictionality"){
							return "Search fictionalities";
						} else if (name === "selected"){
							return "Search selected";
						} else {
							return "Search " + name + "s";
						}
					} else {
						return "Search...";
					}
					
				});
			
			this.input.append("div")
				.attr("class", "searchClearer iconAfter")
				.on("click", function(d){
					holder.select("input.searchBar").node().value = "";
					let artificialEvent = new Object();
					artificialEvent.target = new Object();
					artificialEvent.target.value = "";
					handleKeypress(artificialEvent);
				});
		}

		let resultHolder = results.append("div")
			.attr("class", "resultHolder");
		this.selectedHolder = resultHolder.append("div")
			.attr("class", "selectedHolder");
	
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

	}

	changeSort(name){
		this.sort = name;
		this.doSort();
		
	}

	doSort(){
		//are we searching by the compiledData or filtered data
		let theSortByData = this.searchEmpty ? this.compiledData : this.results;
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


	setData(total, filtered, selection, callback){

		if (selection.length === 0){
			this.holder.select("h3").html(this.name);
		} else {
			this.holder.select("h3").html(this.name + " (" + selection.length + ")");
		}
		this.totalData = total;
		this.filteredData = filtered;
		this.selection = selection;
		this.callback = callback;

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

		if (this.hasSearch){
			this.fuse = new Fuse(this.compiledData, 
				{keys: ["key"],
				threshold: 0.3
				}
			);

			let handleKeypress = this.handleKeypress;

			this.input.node().addEventListener('keyup', function (evt) {
			    handleKeypress(evt);
			});
		}

		let cb = this.callback;

		this.holder.select("button")
			.on("click", function(){
				cb([]);
			});

		this.doSort();

	}

	draw(){
		this.drawOnePanel(this.selectedHolder, this.selectedValues, this.callback);
	}

	drawOnePanel(holder, values, callback){
		let theSelected = this.selection;

		let panel = holder
			.selectAll(".result")
			.data(values, function(d){ return d.key});

		panel.exit().remove();

		panel
		.style("top", function(d, i){ return i * 2 + "em"})
		.each(function(d){
				let theThis = d3.select(this);
				theThis.select(".valName").select("p").html(d.key);
				theThis.select(".count").select("p").html(d.filteredValue + "/" + d.value);
				
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
				theThis.append("div").attr("class", "count").append("p").html(d.filteredValue + "/" + d.value);
			}).on("click", function(d){
				callback(d.key);
			})
	}


	handleKeypress(event){
		if (event.target.value.length > 2){
			this.results = this.fuse.search(event.target.value);
			this.searchEmpty = false;
		} else {
			this.results = [];
			if (event.target.value.length === 0){
				this.searchEmpty = true;
			}
		}
		this.doSort();

		if (event.keycode || event.which){
			var code = (event.keyCode ? event.keyCode : event.which);
			if(code == 13) { 
			   //Enter keycode
			}
		}
	}


}

export default Dropdown;