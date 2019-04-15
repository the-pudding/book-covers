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
			.html(data.author);
	}

	return elt;
}

export default makeOverlay;