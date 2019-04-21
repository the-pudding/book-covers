import Fuse from "fuse.js";

class Searcher{
	constructor() {
		this.holder;
		this.data;
		this.fuse;
		this.results = [];

		this.init = this.init.bind(this);
		this.handleKeypress = this.handleKeypress.bind(this);

	}

	init(holder, data){
		this.holder = holder;
		this.data = data.map(obj =>{ 
		   var newObj = {};
		   newObj["author"] = obj.author;
		   newObj["title"] = obj.title;
		   newObj["grid_point"] = obj.grid_point;
		   return newObj;
		});
		this.fuse = new Fuse(this.data, 
				{keys: ["author", "title"],
				threshold: 0.3
				}
				);

		let handleKeypress = this.handleKeypress;

		this.holder.addEventListener('keyup', function (evt) {
		    handleKeypress(evt);
		});



	}

	handleKeypress(event){
		if (event.target.value.length > 3){
			this.results = this.fuse.search(event.target.value);
		} else {
			this.results = [];
		}

		var code = (event.keyCode ? event.keyCode : event.which);
		if(code == 13) { 
		   //Enter keycode
		}
	}

}
export default Searcher;