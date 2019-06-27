import OpenSeadragon from 'openseadragon';
require("./openseadragon-canvas-overlay.js");
import {makeOverlay, updateOverlay} from "./overlay";
import * as d3 from "d3-selection";


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
		this.zoomLevel; //variable to keep track of zoom level;
		this.clickedBookData = null;

		this.handleClick = this.handleClick.bind(this);
		this.findBook = this.findBook.bind(this);
		this.updateFilterOverlays = this.updateFilterOverlays.bind(this);
		this.goToBook = this.goToBook.bind(this);
		this.handleZoom = this.handleZoom.bind(this);
		this.handlePan = this.handlePan.bind(this);
		this.closeOpenThings = this.closeOpenThings.bind(this);
		this.calcMaxZoom = this.calcMaxZoom.bind(this);
	}

	init(unfilteredData, filteredData, selections, cb){
		this.allData = unfilteredData; //we don't update this
		this.filteredData = filteredData;
		this.unfilteredData = unfilteredData;
		this.selections = selections;
		this.cb = cb;
		this.holder = document.getElementById("openseadragon");
		let calcMaxZoom = this.calcMaxZoom;

		//see https://github.com/openseadragon/openseadragon/issues/678
		OpenSeadragon.pixelDensityRatio = 1;
		this.viewer  = OpenSeadragon({
		    id:                 'openseadragon',
		    prefixUrl:          'TileGroup/',
		    wrapHorizontal:     false,
		    zoomPerScroll:      1.2,
		    zoomPerClick: 1,
		    animationTime: 1,
		    minZoomLevel: 0.6,
		    maxZoomLevel: calcMaxZoom(window.innerWidth),
		    defaultZoomLevel: window.innerWidth < 450 ? 0.85 : 0.6,
		    showNavigator: false,
		    showHomeControl: false,
		    showFullPageControl: false,
		    showZoomControl: false,
		    tileSources:   [{
		        type:       'tiledmapservice',
		        maxLevel: 8,
		        width: 27060,
		        height: 34155,
		        tilesUrl: "./images/all_tiles/",
		        tileWidth: 256,
		        tileHeight: 256,
		        getTileUrl: function( level, x, y) {
			        return this.tilesUrl + (level) + "-" + (x) + "-" + (y) + ".jpg";
			    }
		    }]
		});

		let viewer = this.viewer;
		let closeOpenThings = this.closeOpenThings;

		this.viewer.addOnceHandler('open', function(event) {
		    new OpenSeadragon.MouseTracker({
		        element: 'openseadragon',
		        scrollHandler: function(event) {
		        	//if we scroll while a popup is open, hide it
		        	let openHandler = document.querySelector(".overlay");
		        	if (openHandler){
		        		closeOpenThings();
		        	}
		        	d3.select("#bottomBar").classed("readMore", false);
		        	d3.select("#bottomBar").classed("collapsed", true);

		        }
		    });
		});

		//gonna manually write a click (as opposed to drag) event
		this.viewer.addHandler('canvas-press', (e) => this.currentPos = [e.position.x, e.position.y]);
		this.viewer.addHandler('canvas-release', (e) => this.handleClick(e));
		this.viewer.addHandler("zoom", (e) => this.handleZoom(e));
		this.viewer.addHandler("pan", (e) => this.handlePan(e));

		this.canvas = this.viewer.canvasOverlay({
		    clearBeforeRedraw:true
		});
		
		this.updateFilterOverlays();

		d3.select("#zoomIn").on("click", function(d){
			let prevZoom = viewer.viewport.getZoom();
			let newZoom = prevZoom * 2;
			let maxZoom = calcMaxZoom(window.innerWidth);
			if (newZoom > maxZoom){
				newZoom = maxZoom;
			}
			viewer.viewport.zoomTo(newZoom);
		})

		d3.select("#zoomOut").on("click", function(d){
			let prevZoom = viewer.viewport.getZoom();
			let newZoom = prevZoom / 2;
			if (newZoom < 0.6){
				newZoom = 0.6;
			}
			viewer.viewport.zoomTo(newZoom);
			let openHandler = document.querySelector(".overlay");
			if (openHandler){
				closeOpenThings();
			}
		})
	}

	//called from index.js when things are filtered
	updateData(unfilteredData, filteredData, selections){
		this.filteredData = filteredData;
		this.unfilteredData = unfilteredData;
		this.selections = selections;
		if (this.clickedBookData){
			updateOverlay(this.clickedBookData, this.selections);
		}
		this.updateFilterOverlays();
	}

	//update the little squares that go over filtered out books
	updateFilterOverlays(){
		let canvas = this.canvas;
		let viewer = this.viewer;

		let filteredData = this.filteredData;

		this.canvas.onRedraw = function(){
			//we need to add some padding for farther distance zooms or else we get outlines of each cover
			let padding = viewer.viewport.getZoom() <= 2.5 ? 5 : 2;

		    canvas.context2d().fillStyle =  "rgba(0, 0, 0, 0.8)";
		    //draw rectangles over filtered out books
		    for (var i = 0; i < filteredData.length; i++){
		    	let x = filteredData[i]["grid_point"][0]/82 * 27060;
		    	let y = filteredData[i]["grid_point"][1]/69 * 34155;
		    	canvas.context2d().fillRect(x - padding, y - padding, 27060/82 + padding * 2, 34155/69 + padding * 2);            
		    }
		    //draw a rect around the grid so we don't get a bright outline
		    if (viewer.viewport.getZoom() < 10) {
		    	canvas.context2d().strokeStyle =  "rgba(0, 0, 0, 1)";
			    canvas.context2d().lineWidth = 100;
			    canvas.context2d().strokeRect(0, 0, 27080, 34215);
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
		let closeOpenThings = this.closeOpenThings;
			
		if (clickedBook){
			//delete open overlay if it exists (we do this twice because w/ timeouts it isn't always predictable)
			let openHandler = document.querySelector(".overlay");
			if (openHandler){
				closeOpenThings();
			}
			
			//we'll pass the data to the overlay inside the timeout so "closeOpenThings" doesn't nullify it inadvertently
			let setClickedBookData = (val) => this.clickedBookData = val;

			//handle mobile-like screens a bit differently
			//note!! 1.262 comes from dividing the height of the image by the width
			this.viewer.viewport.zoomTo(this.calcMaxZoom(window.innerWidth), new OpenSeadragon.Point(gridPos[0]/82 + (1/82/2), gridPos[1] * (1.262/69) + 1.262/69/2));

			setTimeout( function() {
				//pan to the location after a bit. fitbounds isn't working as expected, so work in stages
			    if (window.innerWidth > 900){
			    	viewport.panTo(new OpenSeadragon.Point(gridPos[0]/82 + (1/82/1.25), gridPos[1] * (1.262/69) + 1.262/69/2));
				} else if(window.innerWidth > 450) {
			    	viewport.panTo(new OpenSeadragon.Point(gridPos[0]/82 + (1/82/1.05) + 0.005, gridPos[1] * (1.262/69) + 1.262/69/2 - 0.001));
				} else {
					viewport.panTo(new OpenSeadragon.Point(gridPos[0]/82 + (1/82/2), gridPos[1] * (1.262/69) + 1.262/69/1.5));
				}

				//after another delay, create an overlay
			    setTimeout( function() {

					//delete open overlay if it exists
					let openHandler = document.querySelector(".overlay");
					if (openHandler){
						closeOpenThings();
					}

					setClickedBookData(clickedBook);
					//we compute the overlay position and width using osd
					//it can be a pain compared to using css, but trying
					//to get around it is more difficult
					let overlayLocation;
					//display the overlay in diff positions based on screen dimensions
					if (window.innerWidth > 900){
						overlayLocation = new OpenSeadragon.Point(gridPos[0]/82 + (1/82/1.05) + 0.002, gridPos[1] * (1.262/69) + (1.262/69/3));
					} else if (window.innerWidth > 450){
						overlayLocation = new OpenSeadragon.Point(gridPos[0]/82 + (1/82/1.05) + 0.001, gridPos[1] * (1.262/69) + (1.262/69/4));
					} else {
						let bounds = viewer.viewport.getBounds();
						overlayLocation = new OpenSeadragon.Point(gridPos[0]/82 - 0.0021, bounds.y + bounds.height/2);
					}

					//overlay width
					let theWidth;
					if (window.innerWidth > 900){
						theWidth = 0.0145;
					} else if (window.innerWidth > 450){
						theWidth = 0.0165;
					} else {
						theWidth = 0.01485;
					}

					viewer.addOverlay({
				        element: makeOverlay(clickedBook, selections, cb, closeOpenThings),
				        location: overlayLocation,
				        placement: OpenSeadragon.Placement.TOP_LEFT,
				        rotationMode: OpenSeadragon.OverlayRotationMode.NO_ROTATION,
				        width: theWidth
				    });
				}, 1000);
			}, 1000 );
		}
	}

	//if we click on the canvas, try to find what book we're on
	handleClick(event){
		if (event.originalEvent.target.tagName === "CANVAS"){

			d3.select("#bottomBar").classed("readMore", false);
			d3.select("#bottomBar").classed("collapsed", true);

			let position = [event.position.x, event.position.y];
			if ((Math.abs(position[0] - this.currentPos[0]) < 15) && (Math.abs(position[1] - this.currentPos[1]) < 15)){
				let pointPos = this.viewer.viewport.pointFromPixel(event.position);
				let percentPos = [pointPos.x/1, pointPos.y/1.262];
				//we know from our python file that our grid has 82 columns and 69 rows
				let gridPos = [Math.floor(percentPos[0] * 82), Math.floor(percentPos[1] * 69)];
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

	//remove overlay if we zoom out, need it for mobile :/	
	handleZoom(event){	
		if (this.zoomLevel && event.zoom < this.zoomLevel){	
			let openHandler = document.querySelector(".overlay");	
			if (openHandler){
				this.closeOpenThings();	
			}	
		}	
		this.zoomLevel = event.zoom;	
	}	

	//hide search results if we start panning around
	handlePan(event){
		if (d3.select("#mainSearch .searchResults").classed("hidden") === false) {
			d3.select("#mainSearch .searchResults").classed("hidden", true);
		}
	}

	//close the search and remove existing overlay
	closeOpenThings(){
		this.viewer.removeOverlay("currentOverlay");
		d3.select("#mainSearch .searchResults").classed("hidden", true);
		this.clickedBookData = null;
	}

	calcMaxZoom(screenWidth){
		if (screenWidth > 900){
			return 22;
		} else if (screenWidth > 450){
			return 30;
		} else {
			return 60;
		}
	}


}

export default OSD;
