import * as d3 from 'd3';

class SortableTable {
    constructor() {
        this.holder;
        this.holderHeight;
        this.holderWidth;
        this.totalData;
        this.filteredData;
        this.totalScale;
        this.filteredScale;
        this.barHeight = 18;
        this.sortScale = d3.scaleBand();

        this.init = this.init.bind(this);
        this.setData = this.setData.bind(this);
        this.draw = this.draw.bind(this);
        this.sortData = this.sortData.bind(this);

        this.selection = [];
    }

    init(holder){
        this.holder = holder;
        this.holderWidth = this.holder.node().width.animVal.value;

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
        this.holder.attr("viewBox", "0 0 " + this.holderWidth + " " + this.holderHeight);

        this.totalScale = d3.scaleLinear()
                            .domain([0, d3.max(this.totalData, function(e){ return e.value})])
                            .range([0, ((-this.holderWidth * 0.2) + this.holderWidth - 70)]);



        this.filteredScale = d3.scaleLinear()
                            .domain([0, d3.max(this.filteredData, function(e){ return e.value})])
                            .range([0, ((-this.holderWidth * 0.2) + this.holderWidth - 70)]);


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
                return "translate(" + (holderWidth * 0.2) + ", " + sortScale(d.key) + ")";
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
                    .attr("x", -(holderWidth * 0.2))
                    .attr("y", 0)
                    .attr("width", (holderWidth * 0.2))
                    .attr("height", 11)
                        .append('xhtml:div')
                        .append("p")
                        .html(e.key)

                d3.select(this).append("foreignObject")
                    .attr("class", "barFilteredNum")
                    .attr("x", ((-holderWidth * 0.2) + holderWidth - 65))
                    .attr("y", 0)
                    .attr("width", 30)
                    .attr("height", 11)
                        .append('xhtml:div')
                        .append("p")
                        .html(thisFilteredValue.value)

                d3.select(this).append("foreignObject")
                    .attr("class", "barTotalNum")
                    .attr("x", ((-holderWidth * 0.2) + holderWidth - 30))
                    .attr("y", 0)
                    .attr("width", 30)
                    .attr("height", 11)
                        .append('xhtml:div')
                        .append("p")
                        .html(e.value)

                d3.select(this).append("rect")
                    .attr("class", "totalBar")
                    .attr("height", 11)
                    .attr("width", d => totalScale(d.value));

                d3.select(this).append("rect")
                    .attr("class", "filterBar")
                    .style("fill" , "url(#stripe)")
                    .attr("height", 11)
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
                return "translate(" + (holderWidth * 0.2) + ", " + sortScale(d.key) + ")";
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