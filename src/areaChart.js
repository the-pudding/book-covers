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

        let brush = this.holder.append("g").attr("class", "brush");
            

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
                            .range([0, this.holderWidth])
                            .clamp(true);
        

    }


    draw(callback){
        let holderWidth = this.holderWidth;
        let holderHeight = this.holderHeight;
        let totalScale = this.totalScale;
        let filteredScale = this.filteredScale;
        let filteredData = this.filteredData;
        let selection = this.selection;
        let xScale = this.xScale;

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

        this.holder.select(".brush")
            .call(d3.brushX()
                .extent([[0, 0], [holderWidth, holderHeight * 0.7]])
                .on("end", brushed));

        function brushed() {
            let value = [];
            if (d3.event.selection) {
                let minSelection = xScale.invert(d3.event.selection[0]);
                let maxSelection = xScale.invert(d3.event.selection[1]);
                callback([minSelection, maxSelection]);
            } else {
                callback([]);
            }
        }
    }

}

export default AreaChart;