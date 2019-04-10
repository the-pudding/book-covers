import * as d3 from 'd3';

class FaceChart {
    constructor() {
        this.holder;
        this.holderHeight = 115;
        this.holderWidth = 315;
        this.totalData;
        this.filteredData;
        this.totalScale;
        this.filteredScale;
        this.sortScale = d3.scalePoint();

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

        this.holder.style("height", this.holderHeight + "px"); 

        this.totalScale = d3.scaleLinear()
                            .domain([0, d3.max(this.totalData, function(e){ return e.value})])
                            .range([0,this.holderHeight * 0.4]);



        this.filteredScale = d3.scaleLinear()
                            .domain([0, d3.max(this.filteredData, function(e){ return e.value})])
                            .range([0,this.holderHeight * 0.4]);


        this.sortData("filter");

        this.sortScale = this.sortScale.domain(this.totalData.map(d => d.key))
                        .range([0, this.holderWidth])
                        .padding(0.5);

        this.selection = selection;

    }

    draw(callback){
        let holderWidth = this.holderWidth;
        let holderHeight = this.holderHeight;
        let totalScale = this.totalScale;
        let filteredScale = this.filteredScale;
        let sortScale = this.sortScale;
        let filteredData = this.filteredData;
        let selection = this.selection;

        let rows = this.holder.selectAll(".circle")
            .data(this.totalData, function(d){ return d.key});

        rows.exit();

        //create elements
        rows.enter()
            .append("g")
            .attr("class", "circle")
            .attr("transform", function(d){
                return "translate(" + sortScale(d.key) + ", " + (holderHeight/2 - holderHeight*0.08) + ")";
            })
            .each(function(e){

                let thisFilteredValue = filteredData.find(function(f){
                    return f.key === e.key;
                });
                if (thisFilteredValue === undefined){
                    thisFilteredValue = {"value": 0}
                }

                d3.select(this).append("circle")
                    .attr("class", "totalBar")
                    .attr("r", d => totalScale(d.value));

                d3.select(this).append("circle")
                    .attr("class", "filterBar")
                    .style("fill" , "url(#stripe)")
                    .attr("r", function(d){
                        return filteredScale(thisFilteredValue.value) ? filteredScale(thisFilteredValue.value) : 0;
                    });
                
                d3.select(this).append("text")
                    .attr("class", "circleName")
                    .style("fill", "#fff")
                    .attr("text-anchor", "middle")
                    .attr("x", 0)
                    .attr("y", 3)
                    .text(e.key);

                d3.select(this).append("foreignObject")
                    .attr("class", "barFilteredNum")
                    .attr("x",  0 - (holderWidth * 0.1))
                    .attr("y", holderHeight* 0.45)
                    .attr("width", (holderWidth * 0.1))
                    .attr("height", 15)
                        .append('xhtml:div')
                        .append("p")
                        .html(thisFilteredValue.value)

                d3.select(this).append("foreignObject")
                    .attr("class", "barTotalNum")
                    .attr("x", 0)
                    .attr("y", holderHeight* 0.45)
                    .attr("width", (holderWidth * 0.1))
                    .attr("height", 15)
                        .append('xhtml:div')
                        .append("p")
                        .html(e.value)
            })
            .on("click", function(d){
                callback(d.key);
            })

        //update positions and widths
        rows.transition()
            .attr("transform", function(d){
                return "translate(" + sortScale(d.key) + ", " + (holderHeight/2 - holderHeight*0.08) + ")";
            })

        rows
            .attr("class", function(d){
                if (selection.find(function(f){ return f === d.key})){
                    return "selected circle";
                } else {
                    return "circle";
                }
            })
            .each(function(e){
                
                let thisFilteredValue = filteredData.find(function(f){
                    return f.key === e.key;
                });
                if (thisFilteredValue === undefined){
                    thisFilteredValue = {"value": 0}
                }

                d3.select(this).select(".totalBar")
                    .attr("r", d => totalScale(d.value));


                d3.select(this).select(".filterBar")
                    .attr("r", function(d){
                        return filteredScale(thisFilteredValue.value) ? filteredScale(thisFilteredValue.value) : 0;
                });

                d3.select(this).select(".barFilteredNum")
                    .select("p")
                    .html(thisFilteredValue.value)

            })
    }

}

export default FaceChart;