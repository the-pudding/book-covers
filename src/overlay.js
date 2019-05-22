import * as d3 from "d3-selection";

function makeOverlay(data, selections, callback, closeCallback)
{
	let elt = document.createElement("div");
	let element = d3.select(elt)
				.attr("class", "overlay")
				.attr("id", "currentOverlay");

	let header = element.append("div")
		.attr("class", "overlayHeader")
		.append("h1")
		.html(data.title);

	if (data["author"]){
		let byline = element.append("div")
			.attr("class", "overlayHeader")
			.append("h2")
			.html("by " + data.author);
	}

	let closer = element.append("div")
		.attr("class", "closer iconAfter")
		.on("click", closeCallback)

	let genderDiv = element.append("div")
		.attr("class", "overlayInfoDiv")
		.attr("id", "genderOverlayDiv");
	let genderP = genderDiv.append("p");
	genderP.append("span").html("Author's Gender: ");
	makeChip(genderDiv, data["gender"], selections["gender"],
				 (val) => callback("gender", val));

	let fictionalityDiv = element.append("div")
		.attr("class", "overlayInfoDiv")
		.attr("id", "fictionalityOverlayDiv");
	let fictionalityP = fictionalityDiv.append("p");
	fictionalityP.append("span").html("Fictionality: ");
	makeChip(fictionalityDiv, data["is_fiction"] === 1 ? "fiction" : "nonfiction", selections["fictionality"], 
				(val) => callback("fictionality", val));
	
	let genreDiv = element.append("div")
		.attr("class", "overlayInfoDiv")
		.attr("id", "genreOverlayDiv");
	let genreP = genreDiv.append("p");
	genreP.append("span").html("Genre: ");
	makeChip(genreDiv, data["genre"], selections["genre"],
		(val) => callback("genre", val));

	if (data["labels"].length > 0){
		let motifsDiv = element.append("div")
			.attr("class", "overlayInfoDiv")
			.attr("id", "motifsOverlayDiv");
		let motifsP = motifsDiv.append("p");
		motifsP.append("span").html("Motifs: ");
		for (var i = 0; i < data["labels"].length; i++){
			makeChip(motifsDiv, data["labels"][i], selections["motifs"],
					(val) => callback("motifs", val));
		}
	}

	return elt;
}

function updateOverlay(selections){
	if (d3.select("#currentOverlay").node()){
		updateChipClass("genderOverlayDiv", selections["gender"]);

		updateChipClass("fictionalityOverlayDiv", selections["fictionality"]);

		updateChipClass("genreOverlayDiv", selections["genre"]);

		updateChipClass("motifsOverlayDiv", selections["motifs"]);

	}
}

function updateChipClass(holder, selectionArray){
	d3.select("#" + holder)
		.selectAll(".chip")
		.attr("class", function(e){
			let inSelection = selectionArray.indexOf(e);
			let isSelected = inSelection > -1;
			return "chip " + (isSelected ? "" : "unselectedFilter");
		});
}

function makeChip(holder, value, selections, callback){
	let inSelection = selections.indexOf(value);
	let isSelected = inSelection > -1;
	//in case doesn't exist
	if (value){
		let theDiv = holder.append("div")
			.attr("class", "chipHolder")
			.append("div")
			.datum(value)
			.style("cursor", "pointer")
			.style("pointer-events", "all")
			.attr("class", "chip " + (isSelected ? "" : "unselectedFilter"))
			.on("click", function(d){
				//toggle selection on click
				d3.select(this).classed("unselectedFilter", !d3.select(this).classed("unselectedFilter"));
				callback(value);
			});
		let theP = theDiv.append("p");
		theP.append("span").attr("class", "funnelIcon iconAfter");
		theP.append("span").html(value);
	}

}

export {makeOverlay, updateOverlay};