import * as d3 from 'd3';

class SortableTable {
    constructor() {
    	this.holder;
    	this.totalData;
    	this.filteredData;
    	this.totalScale;
    	this.filteredScale;

    	this.init = this.init.bind(this);
    	this.setData = this.setData.bind(this);
    	this.draw = this.draw.bind(this);

    	this.selection = [];
    }

    init(holder){
    	this.holder = holder;
    }

    setData(totalData, filteredData, selection){
    	this.totalData = totalData;
    	this.filteredData = filteredData;

    	this.totalData = this.totalData.sort(function(a, b){
    		let thisFilteredValueA = filteredData.find(function(fa){
    			return fa.key === a.key
    		});

    		let thisFilteredValueB = filteredData.find(function(fb){
    			return fb.key === b.key
    		});
    		if (thisFilteredValueA === undefined){
    			thisFilteredValueA = {"value": 0};
    		}
    		if (thisFilteredValueB === undefined){
    			thisFilteredValueB = {"value": 0};
    		}
    		return thisFilteredValueB.value - thisFilteredValueA.value;
    	})

    	this.totalScale = d3.scaleLinear()
    						.domain([0, d3.max(this.totalData, function(e){ return e.value})])
    						.range([0,100])

    	this.filteredScale = d3.scaleLinear()
    						.domain([0, d3.max(this.filteredData, function(e){ return e.value})])
    						.range([0,100])

    	this.selection = selection;
    }

    draw(callback){
    	let totalScale = this.totalScale;
    	let filteredScale = this.filteredScale;
    	let filteredData = this.filteredData;
    	let selection = this.selection;

    	let rows = this.holder.selectAll("tr")
    		.data(this.totalData, function(d){ return d.key});

    	rows.exit();

    	rows.each(function(e){
    			d3.select(this).select(".value").style("font-weight", function(d){
    				if (selection.find(function(f){ return f === e.key})){
    					return "bold";
    				} else {
    					return "normal";
    				}
    			});
    			let miniSvg = d3.select(this).select(".miniBar");
    			miniSvg.select(".totalBar").transition()
    				.attr("width", totalScale(e.value));

    			let thisFilteredValue = filteredData.filter(function(f){
    				return f.key === e.key;
    			})[0];

    			if (thisFilteredValue === undefined){
    				thisFilteredValue = {"value": 0}
    			}

    			miniSvg.select(".filterBar").transition()
    				.attr("width", filteredScale(thisFilteredValue.value) ? filteredScale(thisFilteredValue.value): 0);
    		})

    	rows.enter()
    		.append("tr")
    		.each(function(e){
    			d3.select(this).append("td").attr("class", "value").html(e.key).style("font-weight", function(d){
    				if (selection.find(function(f){ return f === e.key})){
    					return "bold";
    				} else {
    					return "normal";
    				}
    			});
    			let miniSvg = d3.select(this).append("td").attr("class", "miniBar").append("svg").attr("viewBox", "0 0 100 10");
    			miniSvg.append("rect")
    				.attr("x", 0)
    				.attr("y", 0)
    				.attr("class", "totalBar")
    				.attr("height", 10)
    				.attr("fill", "#ccc")
    				.attr("width", totalScale(e.value));

    			let thisFilteredValue = filteredData.find(function(f){
    				return f.key === e.key;
    			});

    			if (thisFilteredValue === undefined){
    				thisFilteredValue = {"value": 0}
    			}


    			miniSvg.append("rect")
    				.attr("x", 0)
    				.attr("y", 0)
    				.attr("class", "filterBar")
    				.attr("height", 10)
    				.attr("fill", "blue")
    				.style("opacity", 0.5)
    				.attr("width", filteredScale(thisFilteredValue.value) ? filteredScale(thisFilteredValue.value): 0);
    		})
    		.on("click", function(d){
    			callback(d.key);
    		})
    }

}

export default SortableTable;