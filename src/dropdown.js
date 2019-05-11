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

	init(name){
		this.holder = d3.select("#" + name);
		this.name = name;
		this.holder.append("h3").attr("class", "iconAfter").html(name);
		let holder = this.holder;

		this.holder.on("click", function(d, e){
			if (d3.event.target.classList.contains("barItem")
				|| d3.event.target.tagName === "H3"){

				d3.selectAll(".dropDown:not(#" + name + ")").classed("closed", true);
				holder.classed("closed", !holder.classed("closed"));
			}
		});

		let results = this.holder.append("div").attr("class", "results");

		let searchHolder = results.append("div").attr("class", "searchHolder");
		this.input = searchHolder.append("input")
			.attr("class", "searchBar")
			.attr("placeholder", name === "fictionality" ? "Search fictionalities" : "Search " + name + "s");

		let form = searchHolder.append("form");
		form.append("h4").html("Sort by");
		let sortType = form.append("div").attr("class", "sortType");
		let div1 = sortType.append("input")
			.attr("type", "radio")
			.attr("name", "sortType " + name)
			.attr("checked", true)
			.attr("id", "total" + name)
			.on("click", () => this.changeSort("total"));
		sortType.append("label").attr("for", "total" + name).html("total");

		let div2 = sortType.append("input")
			.attr("type", "radio")
			.attr("name", "sortType " + name)
			.attr("id", "filtered" + name)
			.on("click", () => this.changeSort("filtered"));
		sortType.append("label").attr("for", "filtered" + name).html("filtered");

		let div3 = sortType.append("input")
			.attr("type", "radio")
			.attr("name", "sortType " + name)
			.attr("id", "alphabetic" + name)
			.on("click", () => this.changeSort("alphabetic"));
		sortType.append("label").attr("for", "alphabetic" + name).html("alphabetic");

		let resultHolder = results.append("div").attr("class", "resultHolder");
		this.selectedHolder = resultHolder.append("div").attr("class", "selectedHolder");
		this.unselectedHolder = resultHolder.append("div").attr("class", "unselectedHolder");

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

		this.selectedValues = [];
		this.unselectedValues = [];

		for (var i = 0; i < theSortByData.length; i++){
			if (this.selection.includes(theSortByData[i]["key"])){
				this.selectedValues.push(theSortByData[i]);
			} else {
				this.unselectedValues.push(theSortByData[i]);
			}
		}

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
				return e.key === d.key;
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

		this.fuse = new Fuse(this.compiledData, 
			{keys: ["key"],
			threshold: 0.3
			}
		);

		let handleKeypress = this.handleKeypress;

		this.input.node().addEventListener('keyup', function (evt) {
		    handleKeypress(evt);
		});

		this.doSort();

	}

	draw(){
		this.drawOnePanel(this.selectedHolder, this.selectedValues, this.callback);
		this.drawOnePanel(this.unselectedHolder, this.unselectedValues, this.callback);
	}

	drawOnePanel(holder, values, callback){
		let panel = holder
			.selectAll(".result")
			.data(values, function(d){ return d});

		panel.exit().remove();

		panel.each(function(d){
				let theThis = d3.select(this);
				theThis.select(".valName").select("p").html(d.key);
				theThis.select(".count").select("p").html(d.filteredValue + "/" + d.value);
			})

		panel.enter()
			.append("div")
			.attr("class", "result")
			.each(function(d){
				let theThis = d3.select(this);
				theThis.append("div").append("p").attr("class", "checker iconAfter");
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


		var code = (event.keyCode ? event.keyCode : event.which);
		if(code == 13) { 
		   //Enter keycode
		}
	}


}

export default Dropdown;