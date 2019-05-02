import * as d3 from "d3-selection";

class Dropdown {
	constructor() {
		this.holder;
		this.selectedHolder;
		this.unselectedHolder;

		this.name;

		this.totalData;
        this.filteredData;
        this.selection = [];
        this.compiledData;
        this.selectedValues = [];
        this.unselectedValues = [];

        this.callback;

        this.sort = "total";

        this.init = this.init.bind(this);
        this.setData = this.setData.bind(this);
        this.draw = this.draw.bind(this);
        this.drawOnePanel = this.drawOnePanel.bind(this);
        this.changeSort = this.changeSort.bind(this);
        this.doSort = this.doSort.bind(this);


	}

	init(name){
		this.holder = d3.select("#" + name);
		this.name = name;
		this.holder.append("h3").html(name);
		this.holder.append("div").attr("class", "chipToggler");
		let holder = this.holder;

		this.holder.on("click", function(d, e){
			if (d3.event.target.classList.contains("chipToggler")
				|| d3.event.target.classList.contains("barItem")
				|| d3.event.target.tagName === "H3"){

				d3.selectAll(".dropDown:not(#" + name + ")").classed("closed", true);
				holder.classed("closed", !holder.classed("closed"));
			}
		});

		let results = this.holder.append("div").attr("class", "results");

		let searchHolder = results.append("div").attr("class", "searchHolder");
		searchHolder.append("input").attr("class", "searchBar");
		searchHolder.append("div").attr("class", "sortHolder")
			.on("click", function(d){
				searchHolder.select(".sortType").classed("collapsed", !searchHolder.select(".sortType").classed("collapsed"));
			});

		let form = searchHolder.append("form").attr("class", "sortType collapsed");
		form.append("h4").html("Sort by");
		let div1 = form.append("div");
		div1.append("input")
			.attr("type", "radio")
			.attr("name", "sortType " + name)
			.attr("checked", true)
			.attr("id", "total" + name)
			.on("click", () => this.changeSort("total"));
		div1.append("label").attr("for", "total" + name).html("total");

		let div2 = form.append("div");
		div2.append("input")
			.attr("type", "radio")
			.attr("name", "sortType " + name)
			.attr("id", "filtered" + name)
			.on("click", () => this.changeSort("filtered"));
		div2.append("label").attr("for", "filtered" + name).html("filtered");

		let div3 = form.append("div");
		div3.append("input")
			.attr("type", "radio")
			.attr("name", "sortType " + name)
			.attr("id", "alphabetic" + name)
			.on("click", () => this.changeSort("alphabetic"));
		div3.append("label").attr("for", "alphabetic" + name).html("alphabetic");

		let resultHolder = results.append("div").attr("class", "resultHolder");
		this.selectedHolder = resultHolder.append("div").attr("class", "selectedHolder");
		this.unselectedHolder = resultHolder.append("div").attr("class", "unselectedHolder");

	}

	changeSort(name){
		this.sort = name;
		this.doSort();
		
	}

	doSort(){
		if (this.sort === "total"){
			this.compiledData = this.compiledData.sort(function(a, b){
				return b.value - a.value;
			})
		} else if (this.sort === "filtered"){
			this.compiledData = this.compiledData.sort(function(a, b){
					return b.filteredValue - a.filteredValue;
			})
		} else {
			this.compiledData = this.compiledData.sort(function(a, b){
				var textA = a.key.toUpperCase();
			    var textB = b.key.toUpperCase();
			    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
			})
		}

		this.selectedValues = [];
		this.unselectedValues = [];

		for (var i = 0; i < this.compiledData.length; i++){
			if (this.selection.includes(this.compiledData[i]["key"])){
				this.selectedValues.push(this.compiledData[i]);
			} else {
				this.unselectedValues.push(this.compiledData[i]);
			}
		}

		this.draw();
	}


	setData(total, filtered, selection, callback){
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
				theThis.select(".valName").html(d.key);
				theThis.select(".count").html(d.filteredValue + "/" + d.value);
			})

		panel.enter()
			.append("div")
			.attr("class", "result")
			.each(function(d){
				let theThis = d3.select(this).append("p");
				theThis.append("span").attr("class", "checker");
				theThis.append("span").attr("class", "valName").html(d.key);
				theThis.append("span").attr("class", "count").html(d.filteredValue + "/" + d.value);
			}).on("click", function(d){
				callback(d.key);
			})
	}





}

export default Dropdown;