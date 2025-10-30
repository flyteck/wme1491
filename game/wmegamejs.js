
////// Code to move the character

//character + container
const character = document.getElementById("test-character");
const gameContainer = document.getElementById("game-container");
//move distance (may have modifiers so I made it a variable)
var moveDistance = +"16"

//these numbers need to be the width minus the respective height/width of the character
var gameWidth = parseInt(795)
var gameHeight = parseInt(510)

//run through all the functions of the controller whenever someone presses a button
document.addEventListener("keydown", buttonPress);

//run through all the functions of the controller whenever someone lifts a button
document.addEventListener("keyup", buttonRelease);

function buttonPress() {

  if (character.classList.contains("stopped")) {
    character.classList.remove("up","down","left","right","stopped");
  }

  if (event.key === 'ArrowLeft' || character.classList.contains("left")) {
    moveLeft()
  }

  if (event.key === 'ArrowRight' || character.classList.contains("right")) {
    moveRight()
  }

  if (event.key === 'ArrowUp' || character.classList.contains("up")) {
    moveUp()
  }

  if (event.key === 'ArrowDown' || character.classList.contains("down")) {
    moveDown()
  }
}

function buttonRelease() {
  if (event.key === 'ArrowLeft') {
    stopLeft()
  }

  if (event.key === 'ArrowRight') {
    stopRight()
  }

  if (event.key === 'ArrowUp') {
    stopUp()
  }

  if (event.key === 'ArrowDown') {
    stopDown()
  }
}

  //move left
  function moveLeft() {
      //get the element's left position
      var leftPosition = parseInt(character.style.left);

      //only move if there's room to move
      if (leftPosition > 0) {
        //subtract a value from it (for now we have it at 2), and pixels to set it right
        character.style.left = leftPosition - moveDistance + "px";
      } else {
        //fire move screen event
        moveScreen("left");
      }

      //indicate the character is moving and going left
      character.classList.add("moving","left");
      character.classList.remove("right","stopped");
  }

  //move right
  function moveRight() {
      //get the element's left position
      var leftPosition = parseInt(character.style.left);

      //only move if there's room to move
      if (leftPosition < gameWidth) {
        //add a value to it (for now we have it at 2), and pixels to set it right
        character.style.left = leftPosition + moveDistance + "px";
      } else {
        //fire move screen event
        moveScreen("right");
      }

      //indicate the character is moving and going right
      character.classList.add("moving","right");
      character.classList.remove("left","stopped");
  }

  //move up
  function moveUp() {
      //get the element's top position
      var topPosition = parseInt(character.style.top);

      //only move if there's room to move
      if (topPosition > 0) {
        //subtract a value from it (for now we have it at 2), and pixels to set it right
        character.style.top = topPosition - moveDistance + "px";
      } else {
        //fire move screen event
        moveScreen("up");
      }

      //indicate the character is moving and going right
      character.classList.add("moving","up");
      character.classList.remove("down","stopped");
  }

  //move down
  function moveDown() {
      //get the element's top position
      var topPosition = parseInt(character.style.top);

      //only move if there's room to move
      if (topPosition < gameHeight) {
        //add a value to it (for now we have it at 2), and pixels to set it right
        character.style.top = topPosition + moveDistance + "px";
      } else {
        //fire move screen event
        moveScreen("down");
      }

      //indicate the character is moving and going right
      character.classList.add("moving","down");
      character.classList.remove("up","stopped");
  }

  //Stop moving 
  function stopLeft() {
    setTimeout(() => {
      character.classList.remove("moving");
      character.classList.add("stopped");
    }, 100);
  }

  function stopRight() {
    setTimeout(() => {
      character.classList.remove("moving");
      character.classList.add("stopped");
    }, 100);
  }

  function stopUp() {
    setTimeout(() => {
      character.classList.remove("moving");
      character.classList.add("stopped");
    }, 100);
  }

  function stopDown() {
    setTimeout(() => {
      character.classList.remove("moving");
      character.classList.add("stopped");
    }, 100);
  }

//Move screen

  function moveScreen(direction) {
    console.log(direction)

    if(direction == "left") {
        //get the classlist, split into individuals
        let list = gameContainer.classList.value.split(' ');
        //check for matches to right
        let matchesRight = list.filter(cls => cls.toLowerCase().includes("right"));

      if(matchesRight.length != 0) {
        //if there's screens to the right, remove the last one
        gameContainer.classList.remove(matchesRight.slice(-1));
      } else {
        //otherwise, check if there's screens to the left, and add one with a number above the current (0 if none)
        let matches = list.filter(cls => cls.toLowerCase().includes(direction));

        gameContainer.classList.add(direction + "-" + matches.length);
      }
    }

    if(direction == "right") {
        //get the classlist, split into individuals
        let list = gameContainer.classList.value.split(' ');
        //check for matches to left
        let matchesLeft = list.filter(cls => cls.toLowerCase().includes("left"));

      if(matchesLeft.length != 0) {
        //if there's screens to the left, remove the last one
        gameContainer.classList.remove(matchesLeft.slice(-1));
      } else {
        //otherwise, check if there's screens to the right, and add one with a number above the current (0 if none)
        let matches = list.filter(cls => cls.toLowerCase().includes(direction));

        gameContainer.classList.add(direction + "-" + matches.length);
      }
    }

    if(direction == "up") {
        //get the classlist, split into individuals
        let list = gameContainer.classList.value.split(' ');
        //check for matches to down
        let matchesDown = list.filter(cls => cls.toLowerCase().includes("down"));

      if(matchesDown.length != 0) {
        //if there's screens to the down, remove the last one
        gameContainer.classList.remove(matchesDown.slice(-1));
      } else {
        //otherwise, check if there's screens up, and add one with a number above the current (0 if none)
        let matches = list.filter(cls => cls.toLowerCase().includes(direction));

        gameContainer.classList.add(direction + "-" + matches.length);
      }
    }

    if(direction == "down") {
        //get the classlist, split into individuals
        let list = gameContainer.classList.value.split(' ');
        //check for matches to up
        let matchesUp = list.filter(cls => cls.toLowerCase().includes("up"));

      if(matchesUp.length != 0) {
        //if there's screens to the down, remove the last one
        gameContainer.classList.remove(matchesUp.slice(-1));
      } else {
        //otherwise, check if there's screens down, and add one with a number above the current (0 if none)
        let matches = list.filter(cls => cls.toLowerCase().includes(direction));

        gameContainer.classList.add(direction + "-" + matches.length);
      }
    }

  }