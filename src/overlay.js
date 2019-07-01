import * as d3 from "d3-selection";

//draw the little pop-up that appears when we click on a book
function makeOverlay(data, selections, callback, closeCallback)
{
	console.log("making overlay");
	let isFilteredOut = checkIfFilteredOut(data, selections);
	let elt = document.createElement("div");
	let element = d3.select(elt)
				.attr("class", "overlay")
				.attr("id", "currentOverlay")
				.append("div")
				.attr("class","overlay-wrapper")
				;

	//like /one/ book doesn't have an author associated
	if (data["author"]){
		let byline = element.append("div")
			.attr("class", "overlayHeader");

		byline
			.append("h2")
			.html(data.title+" by " + data.author + " ");

		makeChip(byline, data["gender"], selections["gender"],
					 (val) => callback("gender", val));
	} else {
		//if there's no author, display gender like the other chips
		let genderDiv = element.append("div")
		.attr("class", "overlayInfoDiv")
		.attr("id", "genderOverlayDiv");

		let genderP = genderDiv.append("p");
		genderP.append("span").html("Author's Gender: ");
		makeChip(genderDiv, data["gender"], selections["gender"],
					 (val) => callback("gender", val));

	}

	//close the popup
	let closer = element.append("div")
		.attr("class", "closer iconAfter")
		.on("click", closeCallback);

	//make a little message we show if it's filtered out
	let filteredOut = element.append("p")
		.attr("class", isFilteredOut ? "filteredOutMessage" : "filteredOutMessage hidden")
		.html("(Currently hidden based on current filter selections.)");

	//make some lists of chips that can be clicked to filter data
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

//check if the book is filtered out
function checkIfFilteredOut(data, selections){
	if (selections["genre"].length === 0 && selections["gender"].length === 0 &&
		selections["fictionality"].length === 0 && selections["motifs"].length === 0){
		return false;
	} else {
		//if we're filtering out by fiction/non-fiction, go by that
		if (selections["fictionality"].length === 1){
			if (selections["fictionality"][0] === "fiction"){
				if (data["is_fiction"] === 0){
					return true;
				}
			} else {
				if (data["is_fiction"] === 1){
					return true;
				}
			}
		};

		if (selections["gender"].length > 0){
			if (!selections["gender"].includes(data["gender"])){
				return true;
			}
		}

		if (selections["genre"].length > 0){
			if (!selections["genre"].includes(data["genre"])){
				return true;
			}
		}

		if (selections["motifs"].length > 0){
			if (selections["motifs"].filter(value => data["labels"].includes(value)).length === 0){
				return true;
			}
		}

		return false;
	}
}

//update the chips
function updateOverlay(data, selections){
	let isFilteredOut = checkIfFilteredOut(data, selections);

	if (isFilteredOut){
		d3.select(".filteredOutMessage").classed("hidden", false);
	} else {
		d3.select(".filteredOutMessage").classed("hidden", true);
	}

	if (d3.select("#currentOverlay").node()){
		updateChipClass("genderOverlayDiv", selections["gender"]);

		updateChipClass("fictionalityOverlayDiv", selections["fictionality"]);

		updateChipClass("genreOverlayDiv", selections["genre"]);

		updateChipClass("motifsOverlayDiv", selections["motifs"]);
	}
}

//did we just toggle this value from unselected > selected or vise versa?
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
