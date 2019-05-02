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

        this.sort = "total";

        this.init = this.init.bind(this);
        this.setData = this.setData.bind(this);
        this.draw = this.draw.bind(this);
        this.drawOnePanel = this.drawOnePanel.bind(this);

	}

	init(name){
		this.holder = d3.select("#" + name);
		this.name = name;
		this.holder.append("h3").html(name);
		this.holder.append("div").attr("class", "chipToggler");
		let results = this.holder.append("div").attr("class", "results");

		let searchHolder = results.append("div").attr("class", "searchHolder");
		searchHolder.append("input");
		searchHolder.append("div").attr("class", "sortHolder");

		let resultHolder = results.append("div").attr("class", "resultHolder");
		this.selectedHolder = resultHolder.append("div").attr("class", "selectedHolder");
		this.unselectedHolder = resultHolder.append("div").attr("class", "unselectedHolder");

	}

	setData(total, filtered, selection){
		this.totalData = total;
		this.filteredData = filtered;
		this.selection = selection;

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

		if (this.sort === "total"){
			this.compiledData = this.compiledData.sort(function(a, b){
				return b.value - a.value;
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


	}

	draw(callback){

		this.drawOnePanel(this.selectedHolder, this.selectedValues, callback);
		this.drawOnePanel(this.unselectedHolder, this.unselectedValues, callback);
	}

	drawOnePanel(holder, values, callback){
		let panel = holder
			.selectAll(".result")
			.data(values, function(d){ return d.key});

		panel.exit().remove();

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