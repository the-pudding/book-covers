import * as d3 from "d3-selection";

class ActiveFilters {
	constructor() {

		this.holder;
		this.selectedFilters;
		this.callback;

		this.init = this.init.bind(this);
		this.updateFilters = this.updateFilters.bind(this);
		this.draw = this.draw.bind(this);
	}

	init(holder, filters, callback) {
		this.holder = holder;
		this.callback = callback;
		this.selectedFilters = Object.keys(filters).map(function(key) {
  			return [key, filters[key]];
		});
		this.draw();
	}

	updateFilters(filters){
		this.selectedFilters = Object.keys(filters).map(function(key) {
  			return [key, filters[key]];
		});
		this.draw();
	}

	draw(){
		let allSelected = this.selectedFilters
							.filter(function(d){ return d[1].length > 0});
		let callback = this.callback;

		if (!allSelected.length > 0){
			d3.select(this.holder)
				.append("p")
				.attr("class", "noFiltersMessage")
				.style("font-size", "1.2em")
				.html("No active selections!");
		} else {
			d3.select(".noFiltersMessage").remove();
		}

		let chips = d3.select(this.holder)
			.selectAll(".chipHolder")
			.data(allSelected, function(d){ return d[0]});

		chips.exit().remove();

		chips.enter()
			.append("div")
			.attr("class", "chipHolder")
			.each(function(e){
				let thisHolder = d3.select(this);
				let thisDiv = thisHolder.append("div")
								.attr("class", "chip closed");

				let theP = thisDiv.append("p");
				theP.append("span").attr("class", "chipCloser")
							.on("click", function(f){
								callback(e[0]);
							});

				if (e[0] !== "motifs"){
					theP.append("span")
						.attr("class", "chipInnerText")
						.html(e[0] + " is " + e[1]);
				} else {
					theP.append("span")
						.attr("class", "chipInnerText")
						.html(e[0] + " include " + e[1]);
				}

				//toggle dropdown on click
				thisDiv.select("p")
					.append("span")
					.attr("class", "chipToggler")
					.on("click", function(f){
						thisDiv.classed("closed", !thisDiv.classed("closed"));
					})


				thisDiv.append("div").attr("class", "chipSelectionHolder");

			});

		//different appearance if multiple things selected
		chips.each(function(e){
			let thisHolder = d3.select(this);
			let thisDiv = thisHolder.select("div");

			if (e[1].length === 1){
				thisDiv.classed("dropDown", false);

				if (e[0] !== "motifs"){
					thisDiv.select(".chipInnerText")
						.html(e[0] + " is " + e[1]);
				} else {
					thisDiv.select(".chipInnerText")
						.html(e[0] + " include " + e[1]);
				}

				thisDiv.select(".chipSelectionHolder").selectAll("*").remove();
			} else {
				thisDiv.classed("dropDown", true);

				thisDiv.select(".chipInnerText").html(e[0] + " (" + e.length + ")");
				
				let dropdown = thisDiv.select(".chipSelectionHolder")
				.selectAll(".chipSelection")
				.data(e[1], function(f){ return f});

				dropdown.exit().remove();

				dropdown.enter()
					.append("div")
					.attr("class", "chipSelection")
					.append("p")
					.each(function(f){
						let thisHolder = d3.select(this);
						//remove just one filtered value from filter list
						thisHolder.append("span")
							.attr("class", "chipCloser")
							.on("click", function(f){
								callback(e[0], f);
							});

						thisHolder.append("span")
							.html(function(f){ return f});
					});
			}

			

		})

	}

}

export default ActiveFilters;