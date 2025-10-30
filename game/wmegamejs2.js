
////// Code to move the character

//character + container
const character = document.getElementById("test-character");
const gameContainer = document.getElementById("game-container");
//move distance (may have modifiers so I made it a variable)

var slowMoveSpeed = "8"
var fastMoveSpeed = "16"


//these numbers need to be the width minus the respective height/width of the character
var gameWidth = parseInt(795)
var gameHeight = parseInt(510)

//run through all the functions of the controller whenever someone presses a button
document.addEventListener("keydown", buttonPress);

//run through all the functions of the controller whenever someone lifts a button
document.addEventListener("keyup", buttonRelease);

function buttonPress() {

  //remove directions whenever starting to move in a new one
  if (character.classList.contains("stopped")) {
    character.classList.remove("up","down","left","right","stopped");
  }

  //on spacebar click, call item check. if it returns true, modify the clicked item
  if (event.key === ' ') {

    var found = itemCheck();

    if (found != undefined) {
      //if an item is found, unposition it and add the collected class to the item and it's match in the inventory
      var foundInventory = document.getElementById(found.title);

      found.style.left = "";
      found.style.top = "";
      found.classList.add("collected");
      foundInventory.classList.add("collected");
    }
  }

  if (event.key === 'ArrowLeft' || character.classList.contains("left")) {;

    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (event.shiftKey) {
      var moveDistance = +fastMoveSpeed
    }

    var direction = "left"

    if (document.querySelectorAll(".test-obstacle") != null) {

      if (obstacleCheck(direction,moveDistance) == false) {
        //if no obstacles, then pass to the move function
        moveLeft(moveDistance)
      }

      if (obstacleCheck(direction,moveDistance) == true && !character.classList.contains("face-left")) {
        //if obstacles, but moving the other way, then pass to the move function;
        var moveDistance = parseInt(moveDistance) + parseInt("8");
        moveLeft(moveDistance);
      }
    }
  }

  if (event.key === 'ArrowRight' || character.classList.contains("right")) {
    
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (event.shiftKey) {
      var moveDistance = +fastMoveSpeed
    }

    var direction = "right"

    if (document.querySelectorAll(".test-obstacle") != null) {

      if (obstacleCheck(direction,moveDistance) == false) {
        //if no obstacles, then pass to the move function
        moveRight(moveDistance)
      }

      if (obstacleCheck(direction,moveDistance) == true && !character.classList.contains("face-right")) {
        //if obstacles, but moving the other way, then pass to the move function;
        var moveDistance = parseInt(moveDistance) + parseInt("8");
        moveRight(moveDistance);
      }
    }
  }

  if (event.key === 'ArrowUp' || character.classList.contains("up")) {
    
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (event.shiftKey) {
      var moveDistance = +fastMoveSpeed
    }

    var direction = "up"

    if (document.querySelectorAll(".test-obstacle") != null) {

      if (obstacleCheck(direction,moveDistance) == false) {
        //if no obstacles, then pass to the move function
        moveUp(moveDistance);
      }

      if (obstacleCheck(direction,moveDistance) == true && !character.classList.contains("face-up")) {
        //if obstacles, but moving the other way, then pass to the move function;
        var moveDistance = parseInt(moveDistance) + parseInt("8");
        moveUp(moveDistance);
      }
    }
  }

  if (event.key === 'ArrowDown' || character.classList.contains("down")) {
    
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (event.shiftKey) {
      var moveDistance = +fastMoveSpeed
    }

    var direction = "down"

    if (document.querySelectorAll(".test-obstacle") != null) {

      if (obstacleCheck(direction,moveDistance) == false) {
        //if no obstacles, then pass to the move function
        moveDown(moveDistance);
      }

      if (obstacleCheck(direction,moveDistance) == true && !character.classList.contains("face-down")) {
        //if obstacles, but moving the other way, then pass to the move function;
        var moveDistance = parseInt(moveDistance) + parseInt("8");
        moveDown(moveDistance);
      }
    }
  }
}

function buttonRelease() {
  if (event.key === 'ArrowLeft') {
    stopLeft()
    zIndexSort()
  }

  if (event.key === 'ArrowRight') {
    stopRight()
    zIndexSort()
  }

  if (event.key === 'ArrowUp') {
    stopUp()
    zIndexSort()
  }

  if (event.key === 'ArrowDown') {
    stopDown()
    zIndexSort()
  }
}

//check for obstacles
function obstacleCheck(direction,moveDistance) {
  var obstacle = document.querySelectorAll(".test-obstacle");
  var characterBounds = character.getBoundingClientRect();

  //check for obstacles
  for (i = 0; i < obstacle.length; i++) {
    //for general obstacles
    if (!obstacle[i].classList.contains("fence")) {
      var obstacleBounds = obstacle[i].getBoundingClientRect();

      var overlap = !(obstacleBounds.right <= characterBounds.left || obstacleBounds.left >= characterBounds.right ||
                    obstacleBounds.bottom <= characterBounds.top || obstacleBounds.top >= characterBounds.bottom);

      if (overlap === true) {
        
        if (direction == "right" && character.classList.contains("face-right")) {
          //if we're moving right or facing right

            console.log(obstacleBounds.left + " obstacleBounds");
            console.log(characterBounds.right + " characterBounds");

          //see if we just moved up or down
          if (character.classList.contains("face-up") || character.classList.contains("face-down")) {
            //move down if up, up if down
            if (character.classList.contains("face-up")) {
              character.style.top = parseInt(character.style.top) + parseInt(moveDistance*"0.5") + "px";
            }
            if (character.classList.contains("face-down")) {
              character.style.top = parseInt(character.style.top) - parseInt(moveDistance*"0.5") + "px";
            }
          } else if (obstacleBounds.left <= characterBounds.right && obstacleBounds.right <= characterBounds.right ) {
            //if we've turned around, move right
            character.style.left = parseInt(character.style.left) + parseInt(moveDistance) + "px";
            return true;
          }

          else {
            //if not, move left
            character.style.left = parseInt(character.style.left) - parseInt(moveDistance) + "px";
            return true;
          }
        }

        if (direction == "left" && character.classList.contains("face-left")) {
          //if we're moving left or facing left

          //see if we just moved up or down
          if (character.classList.contains("face-up") || character.classList.contains("face-down")) {
            //move down if up, up if down
            if (character.classList.contains("face-up")) {
              character.style.top = parseInt(character.style.top) + parseInt(moveDistance*"0.5") + "px";
            }
            if (character.classList.contains("face-down")) {
              character.style.top = parseInt(character.style.top) - parseInt(moveDistance*"0.5") + "px";
            }
          } else if (obstacleBounds.right >= characterBounds.left && obstacleBounds.left >= characterBounds.left ) {
            //if we've turned around, move left
            character.style.left = parseInt(character.style.left) - parseInt(moveDistance) + "px";
            return true;
          } else {
            //if not, move right
            character.style.left = parseInt(character.style.left) + parseInt(moveDistance) + "px";
            return true;
          }

        }

        if (direction == "up" && character.classList.contains("face-up")) {
          //if we're facing up or have just moved up, move down
          character.style.top = parseInt(character.style.top) + parseInt(moveDistance) + "px";
          return true;
        }

        if (direction == "down" && character.classList.contains("face-down")) {
          //if we're facing down or have just moved down, move up
          character.style.top = parseInt(character.style.top) - parseInt(moveDistance) + "px";
          return true;
        }
      }
    }

    //for "fences" (elements you can pass behind/in front of but not through)
    if (obstacle[i].classList.contains("fence")) {
      var obstacleBounds = obstacle[i].getBoundingClientRect();

      var overlap = !(obstacleBounds.right <= characterBounds.left || obstacleBounds.left >= characterBounds.right ||
                    obstacleBounds.bottom <= characterBounds.top || obstacleBounds.top >= characterBounds.bottom);

      if (overlap === true) {
        //see if it's in front or behind
        var inFront = parseInt(obstacle[i].style.zIndex) < parseInt(character.style.zIndex);

        if (inFront === true) {
          //if it's in front, see if it's moving up
          if (direction == "up") {
            //check if the *bottoms* are intersecting
            if (obstacleBounds.bottom > characterBounds.bottom) {
              //if they are, fix it
              character.style.top = parseInt(character.style.top) + parseInt(moveDistance) + "px";
              //& stop
              return true;
            }
          }
        }

        if (inFront === false) {
          //if it's in behind, see if it's moving down
          if (direction == "down") {
            //check if the bottom and top are intersecting,
            if (obstacleBounds.top < characterBounds.bottom) {
              //if they are, fix it
              character.style.top = parseInt(character.style.top) - parseInt(moveDistance) + "px";
              //& stop
              return true;
            }
          }
        }

      }
    }
  }
  //otherwise we're good
  return false;
}

//check for interactable items 
function itemCheck() {
  var objective = document.querySelectorAll(".objective");
  var characterBounds = character.getBoundingClientRect();

  for (i = 0; i < objective.length; i++) {
    var objectiveBounds = objective[i].getBoundingClientRect();

    //check all objectives for intersection
    var overlap = !(objectiveBounds.right <= characterBounds.left || objectiveBounds.left >= characterBounds.right ||
                  objectiveBounds.bottom <= characterBounds.top || objectiveBounds.top >= characterBounds.bottom);

    if (overlap === true && !objective[i].classList.contains("collected")) {
      //if player is touching one (and it hasn't been found), return which one
      var found = objective[i];
      return found
    }
    //otherwise, button does nothing
  }
}


//move left
  function moveLeft(moveDistance) {
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
      character.classList.add("moving","left","face-left");
      character.classList.remove("right","stopped","face-right","face-up","face-down");

      //and when we move we check zindex
      zIndexSort();
  }

  //move right
  function moveRight(moveDistance) {
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
      character.classList.add("moving","right","face-right");
      character.classList.remove("left","stopped","face-left","face-up","face-down");

      //and when we move we check zindex
      zIndexSort();
  }

  //move up
  function moveUp(moveDistance) {
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

      //indicate the character is moving and going up
      character.classList.add("moving","up","face-up");
      character.classList.remove("down","stopped","face-down");

      //and when we move we check zindex
      zIndexSort();
  }

  //move down
  function moveDown(moveDistance) {
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

      //indicate the character is moving and going down
      character.classList.add("moving","down","face-down");
      character.classList.remove("up","stopped","face-up");

      //and when we move we check zindex
      zIndexSort();
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

    //idk why but it works better with these down here

    if(direction == "left") {
        //jump character to the right spot on the new screen
        character.style.left = gameWidth + "px";
    }

    if(direction == "up") {
        //jump character to the right spot on the new screen
        character.style.top = gameHeight + "px";
    }

    if(direction == "down") {
      //jump character to the right spot on the new screen
        character.style.top = "0";
      }

    if(direction == "right") {
      //jump character to the right spot on the new screen
        character.style.left = "0";
    }

    if(direction == "left") {
        //get the classlist, split into individuals
        let list = gameContainer.classList.value.split(' ');
        //check for matches to right
        let matchesRight = list.filter(cls => cls.toLowerCase().includes("right"));
        let matchesLeft = list.filter(cls => cls.toLowerCase().includes(direction));

        if(matchesRight.length == 0) {
          console.log("nothing to the right");
          //if there's no screens to the right,
          if (list.filter(cls => cls.toLowerCase().includes("up")) || list.filter(cls => cls.toLowerCase().includes("down"))) {
            //if there's screens above or below, re-add the initial class
            console.log("nothing above");
            gameContainer.classList.add("intial-screen");
            return
          }
        }

      if(matchesRight.length != 0) {
        
        //after all that, if there's multiple screens to the right, remove the last one
        gameContainer.classList.remove(matchesRight.slice(-1));

      } else if (matchesLeft.length != 0) {
        //otherwise, check if there's screens to the left, and add one with a number above the current (0 if none)
        gameContainer.classList.add(direction + "-" + matches.length);
      } else if (matchesLeft.length == 0) {
        gameContainer.classList.remove("intial-screen");
        gameContainer.classList.add(direction + "-" + 0);
      }
    }

    if(direction == "right") {
        //get the classlist, split into individuals
        let list = gameContainer.classList.value.split(' ');
        //check for matches to Left
        let matchesLeft = list.filter(cls => cls.toLowerCase().includes("Left"));
        let matchesRight = list.filter(cls => cls.toLowerCase().includes(direction));

        if(matchesLeft.length == 0) {
          //if there's no screens to the Left,
          if (list.filter(cls => cls.toLowerCase().includes("up")) || list.filter(cls => cls.toLowerCase().includes("down"))) {
            //if there's screens above or below, re-add the initial class
            gameContainer.classList.add("intial-screen");
            return
          }
        }

      if(matchesLeft.length != 0) {
        //if there's multiple screens to the Left, remove the last one
        gameContainer.classList.remove(matchesLeft.slice(-1));
      } else if (matchesRight.length != 0) {
        //otherwise, check if there's screens to the Right, and add one with a number above the current (0 if none)
        gameContainer.classList.add(direction + "-" + matches.length);
      } else if (matchesRight.length == 0) {
        gameContainer.classList.remove("intial-screen");
        gameContainer.classList.add(direction + "-" + 0);
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

//z-index shenanigans for layering 
function zIndexSort() {

  //get all givs in the game screen
  var screenElements = gameContainer.querySelectorAll("div");

  //go down the list, and set their z-index to their top position
  for (i = 0; i < screenElements.length; i++) {
    var screenElementBounds = parseInt(screenElements[i].style.top);
      
    screenElements[i].style.zIndex = screenElementBounds;
  }
}

