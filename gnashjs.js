//////////Little snip that ensures the current section is highlighted

//get all the sections
var sections = document.querySelectorAll(".section")

//for each section, get the section ID and the next element
for (var i = sections.length - 1; i >= 0; i--) {
	var nextElement = sections[i].nextElementSibling
	var sectionID = sections[i].id
	
	//and see if the next element is a nav
	if(nextElement.classList.contains("nav")) {
		//if it is, grab the corresponding nav title and make it look selected
		var link = nextElement.querySelector("a[href='#" + sectionID + "']");
		link.classList.add("focused");
	}
}