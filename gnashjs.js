//////////////////////////////Gnash JS

//////////After short delay, add smooth scroll to the body to prevent links w ids from jumping on load
setTimeout(() => {
	document.documentElement.style.scrollBehavior = "smooth";
}, "200");



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


//////////Main image parallax

//get main image, set it at the top
var mainImage = document.getElementById("eyesimage");
mainImage.style.top = 0;

//scroll listener
window.addEventListener("scroll", imageParallax);

//using the scroll Y (divided by 5 for smaller movements) and a negative number, slide the image up/down on scroll
function imageParallax() {
	  mainImage.style.top = "-" + parseInt(window.scrollY)/parseInt("5") + "px";
}