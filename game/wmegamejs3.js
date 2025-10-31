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

///////////////////////Tutorial, titles, & other things over top

//load the game title in when the page loads
window.addEventListener("load", screenTitle);

//(and it's also called when someone changes screens)
function screenTitle() {
  //I strung this all together: basically, get the classlist, make it a string, replace spaces w spaceholder text, replace hyphens with spaces, then spaceholder w a hyphen and a comma (if two) 

  //display it nicely on the game screen
  document.getElementById("screen-display").innerHTML = gameContainer.classList.toString().replace(/\s/g, ' SPACEHOLDER ').replace(/-/g, ' ').replace(' SPACEHOLDER ', ' - ').replace(' SPACEHOLDER ', ', ');
}

//I NEED TO ADD A SPACEBAR LISTENER TOO

//quick listener to hide the tutorial with a key press as well
window.addEventListener("keydown", hideTutorial);

function hideTutorial() {
  //if you pressed the space key, or clicked the button
  if (event.key === ' ' || event.target.id == "tutorial-button") {
    setTimeout(() => {
    document.getElementById("tutorial").style.display = "none";
    }, 200);
    document.getElementById("tutorial").style.opacity = "0";
    //run through all the functions of the controller whenever someone presses a button
    document.addEventListener("keydown", buttonPress);
    //run through all the functions of the controller whenever someone lifts a button
    document.addEventListener("keyup", buttonRelease);
    window.removeEventListener("keydown", hideTutorial);
    return
  }
}

///////////////////////Controlling the Character & Other Inputs

function buttonPress() {
  //remove directions whenever starting to move in a new one
  if (character.classList.contains("stopped")) {
    character.classList.remove("up","down","left","right","stopped");
  }

  //on spacebar click, call item check. if it returns true, modify the clicked item
  if (event.key === ' ' || event.target.id == "dialogue-arrow") {

    var found = itemCheck();

    if (found != undefined) {
      //if an item is found, unposition it and add the collected class to the item and it's match in the inventory
      var foundInventory = document.getElementById(found.title);

      found.style.left = "";
      found.style.top = "";
      found.classList.add("collected");
      found.style.display = "none"
      foundInventory.classList.add("collected");
      //and exit
      return
    }

    //and check if you're talking to an NPC as well
    var npcFound = npcCheck(words);

    if (npcFound != undefined) {

      //if you are, set needed general variables
      var dialoguePopUp = document.querySelector(".dialogue-popup")
      var dialogueLoader = document.getElementById("dialogue-loader")

      //check if we're on the last line of dialogue, and if so, do something different
      if (dialoguePopUp.classList.contains("last-line")) {
        //hide the popup
        dialoguePopUp.style.display = "none";
        //remove the talking ID
        dialoguePopUp.id = "";
        //remove last line,
        dialoguePopUp.classList.remove("last-line")
        //add repeat to the character so we know they're done their main dialogue
        npcFound.classList.add("repeat");
        //and gtfo
        return
      }

      if (npcFound.classList.contains("repeat")) {
        var npcName = document.getElementById(npcFound.id).id;

        //if we've talked to this NPC already, they say their extra line.

        dialoguePopUp.style.display = "flex";

        //get the name of the NPC
        var npcName = document.getElementById(npcFound.id).id;

        //add the who's talking to the textbox
        var dialoguePopUp = document.querySelector(".dialogue-popup");
        dialoguePopUp.id = npcName + "-talking"

        //set their name to show up in the textbox h3
        document.getElementById("character-name").innerHTML = npcName;

        var repeatDialogue = getRepeatDialogue()

        function getRepeatDialogue() {
          //iterate through the list to find a name match,
          for (i = 0; i < npcList.length; i++) {
            if (npcName = npcList[i].name) {
              //then grab their dialogue
              return npcList[i].repeatLine;
            }
          }
        }

        //split dialogue by spaces,
        var words = repeatDialogue.split(' ');

        //repeat dialogue will be kept short -- simply add it, and re-add last line to allow the closing of the modal
        dialogueLoader.innerHTML = repeatDialogue.toString().replaceAll(",", " ").replaceAll("  ", ", ");
        document.querySelector(".dialogue-popup").classList.add("last-line");

        //and exit to prevent doing anything else
        return
      }

      //check if we're in a dialogue box already, and if so do something different
      if (dialoguePopUp.id != "") {
        //get dialogue
        var dialogue = getCharacterDialogue().toString();

        //split dialogue by spaces,
        var words = dialogue.split(' ');

        //get a 20 word chunk, add it to the textbox
        dialogueSplit()

        function dialogueSplit() {
          var dialogueChunk = words.slice(0,39);
          //and clean it up (remove excess commas and put desired ones back in)
          dialogueLoader.innerHTML = dialogueChunk.toString().replaceAll(",", " ").replaceAll("  ", ", ");

          //shift the first 39 elements off of the array,
          for (i = 0; i < 39; i++) {
            words.shift(); 
          }

          //if there's words left after the splice
          if (words.length != 0) {
            //and set the global dialogue var to the remaning dialogue
            for (i = 0; i < npcList.length; i++) {
              if (npcName = npcList[i].name) {
                //then grab their dialogue
               npcList[i].dialogue = words;
              }
            }
          } else {
            //otherwise, indicate we're on the last bit of text
            document.querySelector(".dialogue-popup").classList.add("last-line");
          }
        }

        //return for now BUT I'll need to do something different here to progress the dialogue instead
        return
      }

      //make the textbox visible
      dialoguePopUp.style.display = "flex";

      //get the name of the NPC
      var npcName = document.getElementById(npcFound.id).id;

      //add the who's talking to the textbox
      var dialoguePopUp = document.querySelector(".dialogue-popup");
      dialoguePopUp.id = npcName + "-talking"

      //set their name to show up in the textbox h3
      document.getElementById("character-name").innerHTML = npcName;

      //dialogue is set earlier in global, so we need to go find it
      var dialogue = getCharacterDialogue();

      function getCharacterDialogue() {
        //iterate through the list to find a name match,
        for (i = 0; i < npcList.length; i++) {
          if (npcName = npcList[i].name) {
            //then grab their dialogue
            return npcList[i].dialogue;
          }
        }
      }

      //split dialogue by spaces,
      var words = dialogue.split(' ');

      //get a 20 word chunk, add it to the textbox

      dialogueSplit()

      function dialogueSplit() {
        var dialogueChunk = words.slice(0,39);
        //and clean it up (remove excess commas and put desired ones back in)
        dialogueLoader.innerHTML = dialogueChunk.toString().replaceAll(",", " ").replaceAll("  ", ", ");

        //shift the first 39 elements off of the array,
        for (i = 0; i < 39; i++) {
          words.shift(); 
        }

        //if there's words left after the splice
        if (words.length != 0) {
          //set the global dialogue var to the new remaining text
          for (i = 0; i < npcList.length; i++) {
            if (npcName = npcList[i].name) {
              //then grab their dialogue
             npcList[i].dialogue = words;
            }
          }
        }
      }

    }
  }

  if (!document.querySelector(".dialogue-popup").id == "") {
    //end this if dialogue is open
    return
  }

  if (event.key === 'ArrowLeft' || event.key === 'a' || character.classList.contains("left")) {

    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (event.shiftKey) {
      var moveDistance = +fastMoveSpeed
      character.classList.add("sprint");
    }

    var direction = "left"

    if (document.querySelectorAll(".obstacle") != null) {

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

  if (event.key === 'ArrowRight' || event.key === 'd' || character.classList.contains("right")) {
    
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (event.shiftKey) {
      var moveDistance = +fastMoveSpeed;
      character.classList.add("sprint");
    }

    var direction = "right"

    if (document.querySelectorAll(".obstacle") != null) {

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

  if (event.key === 'ArrowUp' || event.key === 'w' ||character.classList.contains("up")) {
    
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (event.shiftKey) {
      var moveDistance = +fastMoveSpeed;
      character.classList.add("sprint");
    }

    var direction = "up"

    if (document.querySelectorAll(".obstacle") != null) {

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

  if (event.key === 'ArrowDown' || event.key === 's' || character.classList.contains("down")) {
    
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (event.shiftKey) {
      var moveDistance = +fastMoveSpeed;
      character.classList.add("sprint");
    }

    var direction = "down"

    if (document.querySelectorAll(".obstacle") != null) {

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
  if (event.key === 'ArrowLeft' || event.key === 'a') {
    stopLeft()
    zIndexSort()
  }

  if (event.key === 'ArrowRight' || event.key === 'd') {
    stopRight()
    zIndexSort()
  }

  if (event.key === 'ArrowUp' || event.key === 'w') {
    stopUp()
    zIndexSort()
  }

  if (event.key === 'ArrowDown' || event.key === 's') {
    stopDown()
    zIndexSort()
  }

  //this prevents any weird lingering of the move animation (and it's readded immediately if a direction is held)
  if (event.key === 'Shift') {
    character.classList.remove("moving");
    character.classList.remove("sprint");
  }
}

//check for obstacles
function obstacleCheck(direction,moveDistance) {
  var obstacle = document.querySelectorAll(".obstacle");
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

//check for interactable NPC 
function npcCheck() {
  var npc = document.querySelectorAll(".npc");
  var characterBounds = character.getBoundingClientRect();

  for (i = 0; i < npc.length; i++) {
    var npcBounds = npc[i].getBoundingClientRect();

    //check all objectives for intersection
    var overlap = !(npcBounds.right <= characterBounds.left || npcBounds.left >= characterBounds.right ||
                  npcBounds.bottom <= characterBounds.top || npcBounds.top >= characterBounds.bottom);

    if (overlap === true) {
      //if player is touching one, return which one
      var characterTalking = npc[i];

      return characterTalking
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
      if (character.classList.contains("sprint")){
        character.classList.remove("sprint");
      }
      character.classList.add("stopped");
    }, 100);
  }

  function stopRight() {
    setTimeout(() => {
      character.classList.remove("moving");
      if (character.classList.contains("sprint")){
        character.classList.remove("sprint");
      }
      character.classList.add("stopped");
    }, 100);
  }

  function stopUp() {
    setTimeout(() => {
      character.classList.remove("moving");
      if (character.classList.contains("sprint")){
        character.classList.remove("sprint");
      }
      character.classList.add("stopped");
    }, 100);
  }

  function stopDown() {
    setTimeout(() => {
      character.classList.remove("moving");
      if (character.classList.contains("sprint")){
        character.classList.remove("sprint");
      }
      character.classList.add("stopped");
    }, 100);
  }


//Move screen

  function moveScreen(direction) {

    //define the variables based on move direction
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

    //this generates the screen title (delay to be sure that the classes are all updated before generating)
    setTimeout(() => {
      screenTitle();
    }, 100);

    //get the classlist, split into individuals
      let list = gameContainer.classList.value.split(' ');
      //check for matches to each direction
      let matchesRight = list.filter(cls => cls.toLowerCase().includes("right"));
      let matchesLeft = list.filter(cls => cls.toLowerCase().includes("left"));
      let matchesUp = list.filter(cls => cls.toLowerCase().includes("up"));
      let matchesDown = list.filter(cls => cls.toLowerCase().includes("down"));

    //define our variables based on the current direction (current, opposite, and the two perpendicular)
    if(direction == "left") {
      var opposite = "right"; var perp1 = "up"; var perp2 = "down";
      var matchesDirection = matchesLeft; var matchesOpposite = matchesRight; var matchesPerp1 = matchesUp; var matchesPerp2 = matchesDown;
    }

    if(direction == "right") {
      var opposite = "left"; var perp1 = "up"; var perp2 = "down";
      var matchesDirection = matchesRight; var matchesOpposite = matchesLeft; var matchesPerp1 = matchesUp; var matchesPerp2 = matchesDown;
    }

    if(direction == "up") {
      var opposite = "down"; var perp1 = "left"; var perp2 = "right";
      var matchesDirection = matchesUp; var matchesOpposite = matchesDown; var matchesPerp1 = matchesLeft; var matchesPerp2 = matchesRight;
    }

    if(direction == "down") {
      var opposite = "up"; var perp1 = "left"; var perp2 = "right";
      var matchesDirection = matchesDown; var matchesOpposite = matchesUp; var matchesPerp1 = matchesLeft; var matchesPerp2 = matchesRight;
    }

    //if there's NO OTHER SCREENS, we add one to the direction, and remove initial class and exit
      if (matchesDirection.length + matchesOpposite.length + matchesPerp1.length + matchesPerp2.length == "0") {
        gameContainer.classList.remove("initial-screen");
        gameContainer.classList.add(direction + "-" + "1");
        return
      }

      //if there's other screens, check what they are 
      if (matchesOpposite.length || matchesDirection.length || matchesPerp1.length || matchesPerp2.length != "0") {
        
        //if there's no screens in the opposite direction
        if (matchesOpposite.length == "0") {

          //get the number of screens in the current direction
          var screenNumber = matchesDirection.toString().replace(/^\D+/g, '');

          //if there are screens in the current direction
          if (screenNumber != 0) {
            //remove the previous class and exit
            gameContainer.classList.remove(matchesDirection);
            gameContainer.classList.add(direction + "-" + (parseInt(screenNumber) + parseInt("1")));
            return
          } else {
            //otherwise, and add a new one that's 1 higher and exit
            gameContainer.classList.add(direction + "-" + "1");
            return
          }
        }

        //if there ARE screens to the opposite direction
        if (matchesOpposite.length != "0") {
          //figure out the level
          var screenNumber = matchesOpposite.toString().replace(/^\D+/g, '');

          //check if there's matches above/below
          if (matchesPerp1.length != "0" || matchesPerp2.length != "0") {
            //if there are, 
            if(screenNumber == "1") {
              //if there's only one, remove it totally
              gameContainer.classList.remove(matchesOpposite);

              //check if there's perpendicular screens
              var perpendicularScreens = (matchesPerp1.length != 0 || matchesPerp2.length != 0)

              if (perpendicularScreens == true) {
                //if there are, just exit
                return
              } else {
                //otherwise, re-add the initial class
                gameContainer.classList.add("initial-screen");
              }
            } else {
              //otherwise, subtract 1 from it
              gameContainer.classList.remove(matchesOpposite);
              gameContainer.classList.add(opposite + "-" + (parseInt(screenNumber) - parseInt("1")));
            }
          }

          if(matchesPerp1.length == "0" || matchesPerp2.length == "0") {
            //if there aren't,
            if(screenNumber == 1) {
              //if there's only one, remove it totally and re-add initial
              gameContainer.classList.remove(matchesOpposite);
              gameContainer.classList.add("initial-screen");
            } else {
              //otherwise, subtract 1 from it
              gameContainer.classList.remove(matchesOpposite);
              gameContainer.classList.add(opposite + "-" + (parseInt(screenNumber) - parseInt("1")));
            }
          }
        }
      }
  }

///////////////////////NPCs

function npcPopUp(characterName) {

}


///////////////////////

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

