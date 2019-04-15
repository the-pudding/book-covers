import OpenSeadragon from 'openseadragon';

class OSD{
	constructor() {
		this.viewer;
		this.holder;
		this.handleClick = this.handleClick.bind(this);
		this.currentPos = [];
	}

	init(){
		this.holder = document.getElementById("openseadragon1");
		this.viewer  = OpenSeadragon({
		    id:                 'openseadragon1',
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

		// //gonna manually write a click (as opposed to drag) event
		this.viewer.addHandler('canvas-press', (e) => this.currentPos = [e.position.x, e.position.y]);
		this.viewer.addHandler('canvas-release', (e) => this.handleClick(e));


	}

	handleClick(event){
		let viewport = this.viewer.viewport;

		let position = [event.position.x, event.position.y];
		if ((Math.abs(position[0] - this.currentPos[0]) < 2) && (Math.abs(position[1] - this.currentPos[1]) < 2)){
			let pointPos = this.viewer.viewport.pointFromPixel(event.position);
			let percentPos = [pointPos.x/1, pointPos.y/1.13];
			//we know from our python file that our grid has 85 columns and 64 rows
			let gridPos = [Math.floor(percentPos[0] * 85), Math.floor(percentPos[1] * 64)];
			this.viewer.viewport.zoomTo(30, new OpenSeadragon.Point(gridPos[0]/85 + (1/85/2), gridPos[1] * (1.13/64) + 1.13/64/2));
			setTimeout( function() {
			    viewport.panTo(new OpenSeadragon.Point(gridPos[0]/85 + (1/85/1.05), gridPos[1] * (1.13/64) + 1.13/64/2));
			}, 1000 );
		} 

	}

}

export default OSD;
