import OpenSeadragon from 'openseadragon';
require("./openseadragon-canvas-overlay.js");
import {makeOverlay, updateOverlay} from "./overlay";

class OSD{
	constructor() {
		this.viewer;
		this.holder;
		this.currentPos = [];
		this.allData;
		this.filteredData; //data that has been filtered out
		this.unfilteredData; //data that is visible
		this.canvas;
		this.selections;
		this.cb; //on click callback to passed to overlay

		this.handleClick = this.handleClick.bind(this);
		this.findBook = this.findBook.bind(this);
		this.updateFilterOverlays = this.updateFilterOverlays.bind(this);
		this.goToBook = this.goToBook.bind(this);
	}

	init(unfilteredData, filteredData, selections, cb){
		this.allData = unfilteredData; //we don't update this
		this.filteredData = filteredData;
		this.unfilteredData = unfilteredData;
		this.selections = selections;
		this.cb = cb;
		this.holder = document.getElementById("openseadragon");
		this.viewer  = OpenSeadragon({
		    id:                 'openseadragon',
		    prefixUrl:          'TileGroup/',
		    showNavigator:      false,
		    wrapHorizontal:     false,
		    zoomPerScroll:      1.2,
		    animationTime: 1,
		    showNavigator: true,
		    navigatorPosition:   "BOTTOM_LEFT",
			zoomInButton : "zoomIn",
			zoomOutButton : "zoomOut",
		    showHomeControl: false,
		    showFullPageControl: false,
		    tileSources:   [{
		        type:       'tiledmapservice',
		        maxLevel: 7,
		        width: 28050,
		        height: 31680,
		        tilesUrl: "./images/all_tiles/",
		        tileWidth: 256,
		        tileHeight: 256,
		        getTileUrl: function( level, x, y) {
			        return this.tilesUrl + (level) + "-" + (x) + "-" + (y) + ".jpg";
			    }
		    }]
		});

		let viewer = this.viewer;

		this.viewer.addOnceHandler('open', function(event) {
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

		//gonna manually write a click (as opposed to drag) event
		this.viewer.addHandler('canvas-press', (e) => this.currentPos = [e.position.x, e.position.y]);
		this.viewer.addHandler('canvas-release', (e) => this.handleClick(e));
		this.canvas = this.viewer.canvasOverlay({
		    clearBeforeRedraw:true
		});
		
		this.updateFilterOverlays();

	}

	updateData(unfilteredData, filteredData, selections){
		this.filteredData = filteredData;
		this.unfilteredData = unfilteredData;
		this.selections = selections;
		updateOverlay(this.selections);
		this.updateFilterOverlays();
	}

	updateFilterOverlays(){
		let canvas = this.canvas;
		let viewer = this.viewer;

		let filteredData = this.filteredData;

		this.canvas.onRedraw = function(){
			//we need to add some padding for farther distance zooms or else we get outlines of each cover
			let padding = viewer.viewport.getZoom() <= 2.5 ? 5 : 2;

		    canvas.context2d().fillStyle =  "rgba(0, 0, 0, 0.8)";
		    for (var i = 0; i < filteredData.length; i++){
		    	let x = filteredData[i]["grid_point"][0]/85 * 28050;
		    	let y = filteredData[i]["grid_point"][1]/64 * 31680;
		    	canvas.context2d().fillRect(x - padding, y - padding, 28050/85 + padding * 2, 31680/64 + padding * 2);            
		    }
		    if (viewer.viewport.getZoom() < 10) {
		    	canvas.context2d().strokeStyle =  "rgba(0, 0, 0, 1)";
			    canvas.context2d().lineWidth = 100;
			    canvas.context2d().strokeRect(0, 0, 28100, 31750);
			}

		    clearBeforeRedraw:true
		};
		this.canvas.redraw();


	}

	goToBook(gridPos){
		let viewport = this.viewer.viewport;
		let viewer = this.viewer;
		let clickedBook = this.findBook(gridPos);
		let selections = this.selections;
		let cb = this.cb;
			
		if (clickedBook){
			//delete open overlay if it exists (we do this twice because w/ timeouts it isn't always predictable)
			let openHandler = document.querySelector(".overlay");
			if (openHandler){
				viewer.removeOverlay("currentOverlay");
			}
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
				        element: makeOverlay(clickedBook, selections, cb),
				        location: new OpenSeadragon.Point(gridPos[0]/85 + (1/85/1.05) + 0.001, gridPos[1] * (1.13/64) + 1.13/64/2),
				        placement: OpenSeadragon.Placement.TOP_LEFT,
				        rotationMode: OpenSeadragon.OverlayRotationMode.NO_ROTATION,
				        width: 0.0125
				    });
				}, 1000);
			}, 1000 );
		}
	}

	handleClick(event){
		if (event.originalEvent.target.tagName === "CANVAS"){
			let position = [event.position.x, event.position.y];
			if ((Math.abs(position[0] - this.currentPos[0]) < 2) && (Math.abs(position[1] - this.currentPos[1]) < 2)){
				let pointPos = this.viewer.viewport.pointFromPixel(event.position);
				let percentPos = [pointPos.x/1, pointPos.y/1.13];
				//we know from our python file that our grid has 85 columns and 64 rows
				let gridPos = [Math.floor(percentPos[0] * 85), Math.floor(percentPos[1] * 64)];
				
				this.goToBook(gridPos);
			} 
		}

	}

	findBook(pos){
		let theBook = this.allData.find(function(d){
			return d["grid_point"][0] === pos[0] && d["grid_point"][1] === pos[1];
		});
		return theBook;
	}

}

export default OSD;
