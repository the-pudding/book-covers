import * as d3 from 'd3';

class SortableTable {
    constructor() {
    	this.holder;
        this.holderHeight;
        this.holderWidth = 315;
    	this.totalData;
    	this.filteredData;
    	this.totalScale;
    	this.filteredScale;
        this.barHeight = 20;
        this.sortScale = d3.scaleBand();

    	this.init = this.init.bind(this);
    	this.setData = this.setData.bind(this);
    	this.draw = this.draw.bind(this);
        this.sortData = this.sortData.bind(this);

    	this.selection = [];
    }

    init(holder){
    	this.holder = holder;

    }

    sortData(arg){
        let filteredData = this.filteredData;
        if (arg == "filter"){
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
        }
    }

    setData(totalData, filteredData, selection){
    	this.totalData = totalData;
    	this.filteredData = filteredData;
        this.holderHeight = this.totalData.length * this.barHeight;

        this.holder.style("height", this.holderHeight + "px"); 

    	this.totalScale = d3.scaleLinear()
    						.domain([0, d3.max(this.totalData, function(e){ return e.value})])
    						.range([0,this.holderWidth * 0.6]);



    	this.filteredScale = d3.scaleLinear()
    						.domain([0, d3.max(this.filteredData, function(e){ return e.value})])
    						.range([0,this.holderWidth * 0.6]);


        this.sortData("filter");

        this.sortScale = this.sortScale.domain(this.totalData.map(d => d.key))
                        .range([0, this.holderHeight])
                        .padding(0.15);

    	this.selection = selection;

    }

    draw(callback){
        let holderWidth = this.holderWidth
    	let totalScale = this.totalScale;
    	let filteredScale = this.filteredScale;
        let sortScale = this.sortScale;
    	let filteredData = this.filteredData;
    	let selection = this.selection;

        let rows = this.holder.selectAll(".bar")
            .data(this.totalData, function(d){ return d.key});

        rows.exit();

        //create elements
        rows.enter()
            .append("g")
            .attr("class", "bar")
            .attr("transform", function(d){
                return "translate(" + (holderWidth * 0.25) + ", " + sortScale(d.key) + ")";
            })
            .each(function(e){

                let thisFilteredValue = filteredData.find(function(f){
                    return f.key === e.key;
                });
                if (thisFilteredValue === undefined){
                    thisFilteredValue = {"value": 0}
                }

                d3.select(this).append("foreignObject")
                    .attr("class", "barName")
                    .attr("x", -(holderWidth * 0.25))
                    .attr("y", 0)
                    .attr("width", (holderWidth * 0.25))
                    .attr("height", 15)
                        .append('xhtml:div')
                        .append("p")
                        .html(e.key)

                d3.select(this).append("foreignObject")
                    .attr("class", "barFilteredNum")
                    .attr("x", (holderWidth * 0.6))
                    .attr("y", 0)
                    .attr("width", (holderWidth * 0.1))
                    .attr("height", 15)
                        .append('xhtml:div')
                        .append("p")
                        .html(thisFilteredValue.value)

                d3.select(this).append("foreignObject")
                    .attr("class", "barTotalNum")
                    .attr("x", (holderWidth * 0.71))
                    .attr("y", 0)
                    .attr("width", (holderWidth * 0.1))
                    .attr("height", 15)
                        .append('xhtml:div')
                        .append("p")
                        .html(e.value)



                d3.select(this).append("rect")
                    .attr("class", "totalBar")
                    .attr("height", 15)
                    .attr("width", d => totalScale(d.value));

                d3.select(this).append("rect")
                    .attr("class", "filterBar")
                    .style("fill" , "url(#stripe)")
                    .attr("height", 15)
                    .attr("width", function(d){
                        return filteredScale(thisFilteredValue.value) ? filteredScale(thisFilteredValue.value) : 0;
                    });
            })
            .on("click", function(d){
                callback(d.key);
            })

        //update positions and widths
        rows.transition()
            .attr("transform", function(d){
                return "translate(" + (holderWidth * 0.25) + ", " + sortScale(d.key) + ")";
            });

        rows
            .attr("class", function(d){
                if (selection.find(function(f){ return f === d.key})){
                    return "selected bar";
                } else {
                    return "bar";
                }
            })
            .each(function(e){
                
                let thisFilteredValue = filteredData.find(function(f){
                    return f.key === e.key;
                });
                if (thisFilteredValue === undefined){
                    thisFilteredValue = {"value": 0}
                }

                d3.select(this).select(".barFilteredNum")
                    .select("p")
                    .html(thisFilteredValue.value)

                d3.select(this).select(".totalBar")
                    .attr("width", d => totalScale(d.value));


                d3.select(this).select(".filterBar")
                    .attr("width", function(d){
                        return filteredScale(thisFilteredValue.value) ? filteredScale(thisFilteredValue.value) : 0;
                });
            })
    }

}

export default SortableTable;