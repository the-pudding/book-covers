import OpenSeadragon from 'openseadragon';
require("./openseadragon-canvas-overlay.js");
import makeOverlay from "./overlay";

class OSD{
	constructor() {
		this.viewer;
		this.holder;
		this.currentPos = [];
		this.data;
		this.canvas;

		this.handleClick = this.handleClick.bind(this);
		this.findBook = this.findBook.bind(this);
		this.updateFilterOverlays = this.updateFilterOverlays.bind(this);
	}

	init(data){
		this.data = data;
		this.holder = document.getElementById("openseadragon");
		this.viewer  = OpenSeadragon({
		    id:                 'openseadragon',
		    prefixUrl:          'TileGroup/',
		    showNavigator:      false,
		    wrapHorizontal:     false,
		    zoomPerScroll:      1.2,
		    zoomPerClick: 1,
		    animationTime: 1,
		    tileSources:   [{
		        type:       'tiledmapservice',
		        maxLevel: 7,
		        width: 28050,
		        height: 31680,
		        tilesUrl: "./../images/all_tiles/",
		        tileWidth: 256,
		        tileHeight: 256,
		        getTileUrl: function( level, x, y) {
			        return this.tilesUrl + (level) + "-" + (x) + "-" + (y) + ".jpg";
			    }
		    }]
		});

		let viewer = this.viewer;

		this.viewer.addOnceHandler('open', function(event) {
		    // MouseTracker is required for links to function in overlays
		    new OpenSeadragon.MouseTracker({
		        element: 'openseadragon',
		        scrollHandler: function(event) {
		        	let openHandler = document.querySelector(".overlay");
		        	if (openHandler){
		        		viewer.removeOverlay("currentOverlay");
		        	}
		        }
		    });
		});

		// //gonna manually write a click (as opposed to drag) event
		this.viewer.addHandler('canvas-press', (e) => this.currentPos = [e.position.x, e.position.y]);
		this.viewer.addHandler('canvas-release', (e) => this.handleClick(e));
		this.canvas = this.viewer.canvasOverlay({
		    clearBeforeRedraw:true
		});
		
		this.updateFilterOverlays();

	}

	updateData(data){
		this.data = data;
		this.updateFilterOverlays();
	}

	updateFilterOverlays(){
		let canvas = this.canvas;

		let data = this.data;

		this.canvas.onRedraw = function(){
		    canvas.context2d().fillStyle = "#444";
		    for (var i = 0; i < data.length; i++){
		    	let x = data[i]["grid_point"][0]/85 * 28050;
		    	let y = data[i]["grid_point"][1]/64 * 31680;
		    	canvas.context2d().fillRect(x, y, 28050/85, 31680/64);            
		    }
		    clearBeforeRedraw:true
		};
		this.canvas.redraw();


	}

	handleClick(event){
		let viewport = this.viewer.viewport;
		let viewer = this.viewer;

		let position = [event.position.x, event.position.y];
		if ((Math.abs(position[0] - this.currentPos[0]) < 2) && (Math.abs(position[1] - this.currentPos[1]) < 2)){
			let pointPos = this.viewer.viewport.pointFromPixel(event.position);
			let percentPos = [pointPos.x/1, pointPos.y/1.13];
			//we know from our python file that our grid has 85 columns and 64 rows
			let gridPos = [Math.floor(percentPos[0] * 85), Math.floor(percentPos[1] * 64)];
			let clickedBook = this.findBook(gridPos);
			
			

			this.viewer.viewport.zoomTo(30, new OpenSeadragon.Point(gridPos[0]/85 + (1/85/2), gridPos[1] * (1.13/64) + 1.13/64/2));
			setTimeout( function() {
				//pan to the location after a bit. fitbounds isn't working as expected, so work in stages
			    viewport.panTo(new OpenSeadragon.Point(gridPos[0]/85 + (1/85/1.05), gridPos[1] * (1.13/64) + 1.13/64/2));
				//after another delay, create an overlay
			    setTimeout( function() {

			    	//delete open overlay if it exists
					let openHandler = document.querySelector(".overlay");
				    if (openHandler){
				    	viewer.removeOverlay("currentOverlay");
				    }

			    	viewer.addOverlay({
		                element: makeOverlay(clickedBook),
		                location: new OpenSeadragon.Point(gridPos[0]/85 + (1/85/1.05) + 0.001, gridPos[1] * (1.13/64) + 1.13/64/2),
		                placement: OpenSeadragon.Placement.TOP_LEFT,
		                rotationMode: OpenSeadragon.OverlayRotationMode.NO_ROTATION,
		                width: 0.0125,
        				height: 0.01
		            });
			    }, 1000);
			}, 1000 );
		} 

	}

	findBook(pos){
		let theBook = this.data.find(function(d){
			return d["grid_point"][0] === pos[0] && d["grid_point"][1] === pos[1];
		});
		return theBook;
	}

}

export default OSD;
