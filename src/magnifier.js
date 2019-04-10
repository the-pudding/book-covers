import * as d3 from 'd3';

class Magnifier {
    constructor() {
    	this.holder;
        this.magnifier;
        this.ctx;
        this.largeImages = {};
        this.data;
        this.width;
        this.height;
        this.gridRows;
        this.gridColumns;
        this.spriteSheets;

        this.init = this.init.bind(this);
        this.setData = this.setData.bind(this);
        this.setSpriteSheets = this.setSpriteSheets.bind(this);
        this.setDimensions = this.setDimensions.bind(this);
        this.preloadLargeImages = this.preloadLargeImages.bind(this);
        this.getMousePos = this.getMousePos.bind(this);
        this.moveMagnifier = this.moveMagnifier.bind(this);
    }

    init(){
    	this.holder = d3.select(".main").select("#mainCanvas");
  		this.magnifier = d3.select(".main").select("#magnifier");
		this.magnifier.attr("width", 300);
		this.magnifier.attr("height", 300);
		this.ctx = this.magnifier.node().getContext('2d');
  		this.ctx.save();
    }

    setData(data) {
    	this.data = data;
    }

    setSpriteSheets(spriteSheets, tempData){
		this.spriteSheets = spriteSheets;
    	this.preloadLargeImages(tempData);
    }

    setDimensions(width, height, gridRows, gridColumns){
    	this.width = width;
    	this.height = height;
    	this.gridRows = gridRows;
    	this.gridColumns = gridColumns;
    }

    preloadLargeImages(tempData){
		for (var i = 0; i < tempData.length; i++){
			let point = tempData[i];
				if (point["grid_point"]){
					if (!this.largeImages[point["isbn13"]]){
						let base_image = new Image();
					    let url = point.book_image;
					    base_image.src = url;
					    let largeImages = this.largeImages;
					    base_image.onload = function(){
					    	largeImages[point["isbn13"]] = base_image;
						};
				}

			}
		}
	}

	getMousePos(evt) {
	    var rect = this.holder.node().getBoundingClientRect();

	    return {
	        x: (evt.clientX - rect.left) / (rect.right - rect.left) * this.holder.node().width,
	        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * this.holder.node().height
	    };
	}

	moveMagnifier(e){
	  	this.ctx.save();
	  	this.ctx.clearRect(0,0,this.width,this.height);

	  	let rectWidth = this.width/this.gridColumns;
		let rectHeight = this.height/this.gridRows;

		let scale = 8;

		let pos = this.getMousePos(e);
		let colWeAreOn = pos["x"]/this.width * this.gridColumns;
		let rowWeAreOn = pos["y"]/this.height * this.gridRows;

		this.magnifier.style("left", pos["x"] - 150 + "px");
		this.magnifier.style("top", pos["y"] - 150 + "px");

	if (this.data){
		let imagesToLoad = this.data.filter(function(d){
			if (!d["index"]){
				return false;
			}
			if ((d["grid_point"][0] > (colWeAreOn - 5) && d["grid_point"][0] < (colWeAreOn + 5))
			&&	(d["grid_point"][1] > (rowWeAreOn - 5) && d["grid_point"][1] < (rowWeAreOn + 5))){
				return true;
			} else {
				return false;
			}
		});

		let offsetX = colWeAreOn%1 * rectWidth * scale;
		let offsetY = rowWeAreOn%1 * rectHeight * scale;

		for (var i = 0; i < imagesToLoad.length; i++){
			let point = imagesToLoad[i];
			if (this.largeImages[point["isbn13"]]){
				this.ctx.drawImage(this.largeImages[point["isbn13"]],
					150 - rectWidth * 4 - ((colWeAreOn - imagesToLoad[i]["grid_point"][0]) * rectWidth * scale),
					150 - rectHeight * 4 - ((rowWeAreOn - imagesToLoad[i]["grid_point"][1]) * rectHeight * scale), 
					rectWidth * scale, rectHeight * scale); // Or at whatever offset you like

		    } else {
				let base_image = new Image();
			    let url = point.book_image;
			    base_image.src = url;
			    let largeImages = this.largeImages;
			    base_image.onload = function(){
			    	largeImages[point["isbn13"]] = base_image;
				};
				if (point["index"] < 2500){
					this.ctx.drawImage(this.spriteSheets["one"], 
						(point["index"]) * 20, 0, 20, 30,
						150 - rectWidth * 4 - ((colWeAreOn - imagesToLoad[i]["grid_point"][0]) * rectWidth * scale),
						150 - rectHeight * 4 - ((rowWeAreOn - imagesToLoad[i]["grid_point"][1]) * rectHeight * scale),
						rectWidth * scale, rectHeight * scale); 
				} else {
					this.ctx.drawImage(this.spriteSheets["two"], 
						((point["index"]) - 2500) * 20, 0, 20, 30,
						150 - rectWidth * 4 - ((colWeAreOn - imagesToLoad[i]["grid_point"][0]) * rectWidth * scale),
						150 - rectHeight * 4 - ((rowWeAreOn - imagesToLoad[i]["grid_point"][1]) * rectHeight * scale),
						rectWidth * scale, rectHeight * scale);
				}
			}

		}

	}
		this.ctx.restore();


	}


};
 
export default Magnifier;