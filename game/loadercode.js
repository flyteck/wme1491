var loadContainer = document.getElementById("hidden-load");
var loadElements = loadContainer.children;
var loadCount = document.getElementById("load-count");
var loadBar = document.getElementById("load-bar");

var percentage = parseInt("100") / parseInt(loadElements.length);
var currentPercent = parseInt(0);

console.log(percentage);

for (i = 0; i < loadElements.length; i++) {
  loadElements[i].addEventListener("load", addLoad);
}

function addLoad() {
	currentPercent = percentage + currentPercent;
	loadCount.innerHTML = Math.round(currentPercent) + "%";
	loadBar.style.width = Math.round(currentPercent) + "%";
}