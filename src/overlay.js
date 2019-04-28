import * as d3 from "d3-selection";

function makeOverlay(data)
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

	let genderDiv = element.append("div").attr("class", "overlayInfoDiv");
	let genderP = genderDiv.append("p");
	genderP.append("span").html("Author's Gender: ");
	genderP.append("span").html(data["gender"]);

	let fictionalityDiv = element.append("div").attr("class", "overlayInfoDiv");
	let fictionalityP = fictionalityDiv.append("p");
	fictionalityP.append("span").html("Fictionality: ");
	fictionalityP.append("span").html(data["is_fiction"] === 1 ? "fiction" : "non-fiction");

	let genreDiv = element.append("div").attr("class", "overlayInfoDiv");
	let genreP = genreDiv.append("p");
	genreP.append("span").html("Genre: ");
	genreP.append("span").html(data["main_genre"]);

	if (data["labels"].length > 0){
		let motifsDiv = element.append("div").attr("class", "overlayInfoDiv");
		let motifsP = motifsDiv.append("p");
		motifsP.append("span").html("Motifs: ");
		motifsP.append("span").html(data["labels"].join(", "));
	}

	return elt;
}

export default makeOverlay;