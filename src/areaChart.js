import * as d3 from 'd3';

class AreaChart {
    constructor() {
        this.holder;
        this.holderHeight = 115;
        this.holderWidth = 315/2;
        this.totalData;
        this.filteredData;
        this.totalScale;
        this.filteredScale;
        this.xScale = d3.scaleLinear();

        this.init = this.init.bind(this);
        this.setData = this.setData.bind(this);
        this.draw = this.draw.bind(this);

        this.selection = [];
    }

    init(holder){
        this.holder = holder;

        let theGroup = this.holder.append("g");

        let fullPath = 
            theGroup.append("path")
            .attr("class", "totalBar");

        let filteredPath = 
            theGroup.append("path")
            .attr("class", "filterBar");

    }

    setData(totalData, filteredData, selection){
        this.totalData = totalData;
        this.filteredData = filteredData;

        this.totalData = this.totalData.sort(function(a, b){
            if (a.key === "") { a.key = 0 }
            if (b.key === "") { b.key = 0 }
            return a.key - b.key;
        });

        this.filteredData = this.filteredData.sort(function(a, b){
            if (a.key === "") { a.key = 0 }
            if (b.key === "") { b.key = 0 }
            return a.key - b.key;
        });

        this.holder.style("height", this.holderHeight + "px"); 

        this.totalScale = d3.scaleLinear()
                            .domain([0, d3.max(this.totalData, function(e){ return e.value})])
                            .range([this.holderHeight * 0.7, 0]);



        this.filteredScale = d3.scaleLinear()
                            .domain([0, d3.max(this.filteredData, function(e){ return e.value})])
                            .range([this.holderHeight * 0.7, 0]);

        this.selection = selection;

        this.xScale.domain([0, 100])
                            .range([0,this.holderWidth])
                            .clamp(true);
        

    }


    draw(callback){
        let holderWidth = this.holderWidth;
        let holderHeight = this.holderHeight;
        let totalScale = this.totalScale;
        let filteredScale = this.filteredScale;
        let filteredData = this.filteredData;
        let selection = this.selection;

        let area = d3.area()
            .x(d => this.xScale(d.key))
            .y0(this.totalScale(0))
            .y1(d => this.totalScale(d.value));

        let fullPath = 
            this.holder.select(".totalBar")
            .datum(this.totalData)
            .attr("d", area);

        let filteredPath = 
            this.holder.select(".filterBar")
            .style("fill" , "url(#stripe)")
            .datum(this.filteredData)
            .attr("d", area);

        // let rows = this.holder.selectAll(".circle")
        //     .data(this.totalData, function(d){ return d.key});

        // rows.exit();

        // //create elements
        // rows.enter()
        //     .append("g")
        //     .attr("class", "circle")
        //     .attr("transform", function(d){
        //         return "translate(" + sortScale(d.key) + ", " + (holderHeight/2 - holderHeight*0.08) + ")";
        //     })
        //     .each(function(e){

        //         let thisFilteredValue = filteredData.find(function(f){
        //             return f.key === e.key;
        //         });
        //         if (thisFilteredValue === undefined){
        //             thisFilteredValue = {"value": 0}
        //         }

        //         d3.select(this).append("circle")
        //             .attr("class", "totalBar")
        //             .attr("r", d => totalScale(d.value));

        //         d3.select(this).append("circle")
        //             .attr("class", "filterBar")
        //             .style("fill" , "url(#stripe)")
        //             .attr("r", function(d){
        //                 return filteredScale(thisFilteredValue.value) ? filteredScale(thisFilteredValue.value) : 0;
        //             });
                
        //         d3.select(this).append("text")
        //             .attr("class", "circleName")
        //             .style("fill", "#fff")
        //             .attr("text-anchor", "middle")
        //             .attr("x", 0)
        //             .attr("y", 3)
        //             .text(e.key);

        //         d3.select(this).append("foreignObject")
        //             .attr("class", "barFilteredNum")
        //             .attr("x",  0 - (holderWidth * 0.1))
        //             .attr("y", holderHeight* 0.45)
        //             .attr("width", (holderWidth * 0.1))
        //             .attr("height", 15)
        //                 .append('xhtml:div')
        //                 .append("p")
        //                 .html(thisFilteredValue.value)

        //         d3.select(this).append("foreignObject")
        //             .attr("class", "barTotalNum")
        //             .attr("x", 0)
        //             .attr("y", holderHeight* 0.45)
        //             .attr("width", (holderWidth * 0.1))
        //             .attr("height", 15)
        //                 .append('xhtml:div')
        //                 .append("p")
        //                 .html(e.value)
        //     })
        //     .on("click", function(d){
        //         callback(d.key);
        //     })

        // //update positions and widths
        // rows.transition()
        //     .attr("transform", function(d){
        //         return "translate(" + sortScale(d.key) + ", " + (holderHeight/2 - holderHeight*0.08) + ")";
        //     })

        // rows
        //     .attr("class", function(d){
        //         if (selection.find(function(f){ return f === d.key})){
        //             return "selected circle";
        //         } else {
        //             return "circle";
        //         }
        //     })
        //     .each(function(e){
                
        //         let thisFilteredValue = filteredData.find(function(f){
        //             return f.key === e.key;
        //         });
        //         if (thisFilteredValue === undefined){
        //             thisFilteredValue = {"value": 0}
        //         }

        //         d3.select(this).select(".totalBar")
        //             .attr("r", d => totalScale(d.value));


        //         d3.select(this).select(".filterBar")
        //             .attr("r", function(d){
        //                 return filteredScale(thisFilteredValue.value) ? filteredScale(thisFilteredValue.value) : 0;
        //         });

        //         d3.select(this).select(".barFilteredNum")
        //             .select("p")
        //             .html(thisFilteredValue.value)

        //     })
    }

}

export default AreaChart;