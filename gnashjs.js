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

//////////Animation for each section

//scroll listener
window.addEventListener("scroll", animateIn);

var sectionWraps = document.querySelectorAll(".section-wrap")

function animateIn() {
	for (var i = sectionWraps.length - 1; i >= 0; i--) {
		var middleScreen = parseInt(window.innerHeight / "2");

		if(parseInt(sectionWraps[i].getBoundingClientRect().top) <= middleScreen && parseInt(sectionWraps[i].getBoundingClientRect().bottom) >= middleScreen) {
			sectionWraps[i].style.opacity = "1"
		} else {
			sectionWraps[i].style.opacity = "0.1"
		}
	}
}

//////////Gallery 

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Event listeners for all keypress functions

document.addEventListener("keydown", keyPress);

function keyPress (e) {
  if(e.key === "Escape") {
    escapeClose();
  }

  if(e.key === "ArrowLeft") {
    tabLeft();
  }

  if(e.key === "ArrowRight") {
    tabRight();
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//This lets all display images open to a modal view
var image = document.querySelectorAll(".image-wrapper");
//add listeners to all of the icons
for (i = 0; i < image.length; i++) {
  image[i].addEventListener('click', modalOpen);
}

function modalOpen() {

	if(event.target.parentElement.classList.contains("image-wrapper")) {
		return;
	}

	if(!this.classList.contains("open")) {
    	this.classList.add("open");
    	document.querySelector("body").classList.add("locked");
  	} else {
    	this.classList.remove("open");
    	document.querySelector("body").classList.remove("locked");
    	document.getElementById("gallery").scrollIntoView({ behavior: "instant"});
  	}
}

//This lets you close them with escape

function escapeClose (e) {
    var openModal = document.querySelectorAll(".image-wrapper.open");
    if(openModal.length !== 0) {
        openModal[0].classList.remove("open");
        document.querySelector("body").classList.remove("locked");
        document.getElementById("gallery").scrollIntoView({ behavior: "instant"});
    }
}

//And THIS lets you close them with an x button inside
var closeButtons = document.querySelectorAll(".close-button");

for (i = 0; i < closeButtons.length; i++) {
  closeButtons[i].addEventListener("click", buttonClose);
}

function buttonClose() {
  var openModal = this.closest(".open");
  openModal.classList.remove("open");
  document.querySelector("body").classList.remove("locked");
  document.getElementById("gallery").scrollIntoView({ behavior: "instant"});
}

//This lets you tab left & right

//This lets all display images open to a modal view
var leftArrow = document.querySelectorAll(".left-arrow");
//add listeners to all of the icons
for (i = 0; i < leftArrow.length; i++) {
  leftArrow[i].addEventListener('click', tabLeft);
}

//This lets all display images open to a modal view
var rightArrow = document.querySelectorAll(".right-arrow");
//add listeners to all of the icons
for (i = 0; i < rightArrow.length; i++) {
  rightArrow[i].addEventListener('click', tabRight);
}

function tabLeft() {
  var openModal = document.querySelectorAll(".image-wrapper.open");
  if(openModal.length > 0) {

  	openModal[0].classList.remove("open");
    
    if(openModal[0].previousElementSibling !== null && openModal[0].previousElementSibling.classList.contains("image-wrapper")) {
      	openModal[0].previousElementSibling.classList.add("open");
      	document.querySelector("body").classList.add("locked");
    } else {
    	if(document.querySelectorAll(".image-wrapper.open").length == 0) {
    		document.querySelector("body").classList.remove("locked");
    	}
    	document.getElementById("gallery").scrollIntoView({ behavior: "instant"});
    }
  }
}

function tabRight() {
  var openModal = document.querySelectorAll(".image-wrapper.open");
  if(openModal.length > 0) {

  	openModal[0].classList.remove("open");

    if(openModal[0].nextElementSibling !== null && openModal[0].nextElementSibling.classList.contains("image-wrapper")) {
      	openModal[0].nextElementSibling.classList.add("open");
      	document.querySelector("body").classList.add("locked");
    } else {
      	if(document.querySelectorAll(".image-wrapper.open").length == 0) {
    		document.querySelector("body").classList.remove("locked");
    	}
    	document.getElementById("gallery").scrollIntoView({ behavior: "instant"});
    }
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
