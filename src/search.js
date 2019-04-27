import Fuse from "fuse.js";
import * as d3 from "d3-selection";


class Searcher{
	constructor() {
		this.searchHolder;
		this.resultsHolder;
		this.data;
		this.fuse;
		this.results = [];

		this.callback; //unbound function

		this.init = this.init.bind(this);
		this.handleKeypress = this.handleKeypress.bind(this);
		this.populateSearchResults = this.populateSearchResults.bind(this);

	}

	init(searchHolder, resultsHolder, data, callback){
		this.searchHolder = searchHolder;
		this.resultsHolder = resultsHolder;
		this.callback = callback;
		this.data = data.map(obj =>{ 
		   var newObj = {};
		   newObj["author"] = obj.author;
		   newObj["title"] = obj.title;
		   newObj["grid_point"] = obj.grid_point;
		   return newObj;
		});
		this.fuse = new Fuse(this.data, 
				{keys: ["author", "title"],
				threshold: 0.3
				}
			);

		let handleKeypress = this.handleKeypress;

		this.searchHolder.addEventListener('keyup', function (evt) {
		    handleKeypress(evt);
		});

		window.addEventListener('click', function (evt) {
			//hide search results if we click outside of entries
			if (evt.target.classList.value !== "searchEntry"){
				d3.select(resultsHolder).classed("hidden", true);
			}
		});


	}

	populateSearchResults(){
		let callback = this.callback;

		d3.select(this.resultsHolder).classed("hidden", false);
		let holder = d3.select(this.resultsHolder).selectAll("div")
			.data(this.results, function(d){ return d["title"] + d["author"]});

		holder.enter().append("div").attr("class", "searchEntry")
			.each(function(d){
				d3.select(this).append("h4").text(d.title);
				d3.select(this).append("h5").text(d.author);
			}).on("click", function(d){
				callback(d.grid_point);
			})

		holder.exit().remove();
	}

	handleKeypress(event){
		if (event.target.value.length > 3){
			this.results = this.fuse.search(event.target.value);
			console.log(this.searchHolder, this.resultsHolder);
			this.populateSearchResults();

		} else {
			this.results = [];
			d3.select(this.resultsHolder).classed("hidden", true);
		}


		var code = (event.keyCode ? event.keyCode : event.which);
		if(code == 13) { 
		   //Enter keycode
		}
	}

}
export default Searcher;