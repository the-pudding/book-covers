import OpenSeadragon from 'openseadragon';

class OSD{
	constructor() {
		this.viewer;
	}

	init(){

		this.viewer  = OpenSeadragon({
		    id:                 'openseadragon1',
		    prefixUrl:          'TileGroup/',
		    showNavigator:      false,
		    wrapHorizontal:     true,
		    zoomPerScroll:      1.2,
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
	}
}

export default OSD;
