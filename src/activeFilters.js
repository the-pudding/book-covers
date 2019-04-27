import * as d3 from "d3-selection";

class ActiveFilters {
	constructor() {

		this.holder;
		this.selectedFilters;

		this.init = this.init.bind(this);
		this.updateFilters = this.updateFilters.bind(this);
		this.draw = this.draw.bind(this);
	}

	init(holder, filters) {
		this.holder = holder;
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
			.data(allSelected);

		chips.exit().remove();

		chips.enter()
			.append("div")
			.attr("class", "chipHolder")
			.each(function(e){
				let thisHolder = d3.select(this);
				let thisDiv = thisHolder.append("div")
								.attr("class", "chip");

				thisDiv.append("p").html(e[0] + " is " + e[1]);
			})

	}

}

export default ActiveFilters;