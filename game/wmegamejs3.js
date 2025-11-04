////// Code to move the character

////KNOWN BUGS
//Clipping through fence objects possible -- I think bc of how I have the *bottom* intersects coded unfortunately

// I think the solution here, is to like... use the object height & character height to get a specific
//value for how far the character can overlap, vs having the bottom/bottom


//POSSIBLE FIX: Instead of the normal overlap, check for overlap of x direction, then check z index -- do not allow movement up if it's overlapping
//I think I wrote this wrong but I was cooking for a sec augh

//check for overlap bottom/bottom + moving up when z index is higher, check for overlap bottom/top + moving down when z index is lower?


//the church flickers on entrance -- code thinks you're in the old location still (can be fixed by only firing the code on select screens)


////PLANS
//Fullscreen: needs to use zoom or else pixel alignments break. Would need to dynamically find the right zoom number and use that with JS

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

//quick listener to hide the tutorial with a key press as well
window.addEventListener("keydown", hideTutorial);

function hideTutorial() {
  //if you pressed the space key, or clicked the button
  if (event.key === ' ' || event.target.id == "tutorial-button") {
    setTimeout(() => {
    document.getElementById("tutorial").style.display = "none";
    }, 200);
    document.getElementById("tutorial").style.opacity = "0";
    document.getElementById("mobile-controls").classList.add("open");

    //run through all the functions of the controller whenever someone presses a button
    document.addEventListener("keydown", buttonPress);

    //run through all the functions of the controller whenever someone lifts a button
    document.addEventListener("keyup", buttonRelease);

    //remove that once the tutorial is gone
    window.removeEventListener("keydown", hideTutorial);
    return
  }
}

//fill in inventory descriptions
var menu = document.getElementById("inventory");

var items = menu.getElementsByTagName("li")

//loop through the inventory
for (i = 0; i < items.length; i++) {
  //get the name of each item
  npcName = items[i].id.replace("Inventory", "");

  //loop through the interact list
  for (j = 0; j < npcList.length; j++) {
    if (npcName == npcList[j].name) {
      var description = items[i].querySelector(".description")
      //if they match, set the description text
      description.innerHTML = npcList[j].dialogue
    }
  }

}

///////////////////////Controlling the Character & Other Inputs

function buttonPress() {
  //remove directions whenever starting to move in a new one
  if (character.classList.contains("stopped")) {
    character.classList.remove("up","down","left","right","stopped");
  }

  if (event.key === 'q' || event.key === 'Tab') {
    //open/close menu

    //if it's open
    if (menu.classList.contains("open")) {
      menu.classList.remove("open");
      return
    }

    //if it's closed
    if (!menu.classList.contains("open")) {
      menu.classList.add("open");
      return
    }


  }

  //on spacebar click, call item check. if it returns true, modify the clicked item
  if (event.key === ' ' || event.target.id == "dialogue-arrow" || event.target.id == "interact-button") {

    var interactFound = interactCheck();

    if (interactFound != undefined || document.querySelector(".last-line") != null) {

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

        if (interactFound != null) {        
          //add repeat for characters so we know they're done their main dialogue (items dissapear after interact, so this excludes them)
          interactFound.classList.add("repeat");
        }

        if (interactFound.classList.contains("objective")) {
        //properly remove items from the map
        interactFound.style.left = "";
        interactFound.style.top = "";
        interactFound.classList.add("collected");
        interactFound.style.display = "none"

        //and make sure to remove the item-text class for items, for proper display of the next interact
        dialoguePopUp.classList.remove("item-text");

        }

        //and gtfo
        return
      }

      if (interactFound.classList.contains("repeat")) {
        var npcName = document.getElementById(interactFound.id).id;

        //if we've talked to this NPC already, they say their extra line.

        dialoguePopUp.style.display = "flex";

        //get the name of the NPC
        var npcName = document.getElementById(interactFound.id).id;

        //add the who's talking to the textbox
        var dialoguePopUp = document.querySelector(".dialogue-popup");
        dialoguePopUp.id = npcName + "-talking"

        //set their name to show up in the textbox h3
        document.getElementById("character-name").innerHTML = npcName;

        //set the viewable image with the right SRC
        var interactDisplay = document.getElementById("interact-display");
        interactDisplay.src = "objectives/" + interactFound.id.toLowerCase() + ".png";

        var repeatDialogue = getRepeatDialogue()

        function getRepeatDialogue() {
          //iterate through the list to find a name match,
          for (i = 0; i < npcList.length; i++) {
            if (npcName == npcList[i].name) {
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

      //for items only
      if (interactFound.classList.contains("objective")) {
        //if an item is found, unposition it and add the collected class to the item and it's match in the inventory
        var foundInventory = document.getElementById(interactFound.id + "Inventory");
        var dialoguePopUp = document.querySelector(".dialogue-popup");

        //add item class to dialogue box, and add collected to the item in the inventory
        dialoguePopUp.classList.add("item-text");
        foundInventory.classList.add("collected");

        //drop the opacity on the interact
        interactFound.style.opacity = "0"
      }

      //set the viewable image with the right SRC
      var interactDisplay = document.getElementById("interact-display");
      interactDisplay.src = "objectives/" + interactFound.id.toLowerCase() + ".png";

      //make the textbox visible
      dialoguePopUp.style.display = "flex";

      //get the name of the NPC
      var npcName = document.getElementById(interactFound.id).id;

      //add the who's talking to the textbox
      var dialoguePopUp = document.querySelector(".dialogue-popup");
      dialoguePopUp.id = npcName + "-talking"

      //set their name to show up in the textbox h3
      document.getElementById("character-name").innerHTML = npcName;

      //dialogue is set earlier in global, so we need to go find it
      var dialogue = getCharacterDialogue().toString();

      function getCharacterDialogue() {

        //iterate through the list to find a name match,
        for (i = 0; i < npcList.length; i++) {
          if (npcName == npcList[i].name) {
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

        if (words.length <= 39) {
          dialoguePopUp.classList.add("last-line");
        }

        //shift the first 39 elements off of the array,
        for (i = 0; i < 39; i++) {
          words.shift(); 
        }

        //if there's words left after the splice
        if (words.length != 0) {
          //set the global dialogue var to the new remaining text
          for (i = 0; i < npcList.length; i++) {
            if (npcName == npcList[i].name) {
              //then grab their dialogue
             npcList[i].dialogue = words;
            }
          }
        } else {
          dialoguePopUp.classList.add("last-line");
        }
      }

    }
  }

  if (!document.querySelector(".dialogue-popup").id == "") {
    //end this if dialogue is open
    return
  }

  if (event.key === 'ArrowLeft' || event.key === 'a' || character.classList.contains("left") || event.target.id == "left-arrow-button") {

    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (event.shiftKey) {
      var moveDistance = +fastMoveSpeed
      character.classList.add("sprint");
    }

    var direction = "left"

    //check for obstacles
    if (document.querySelectorAll(".obstacle") != null) {

      if (obstacleCheck(direction,moveDistance) == false || obstacleCheck(direction,moveDistance) == true && !character.classList.contains("left")) {
        //if no obstacles, then pass to the move function
        moveLeft(moveDistance)
      }
    }

    //check for buildings
    churchOverlap();

  }

  if (event.key === 'ArrowRight' || event.key === 'd' || character.classList.contains("right") || event.target.id == "right-arrow-button") {
    
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (event.shiftKey) {
      var moveDistance = +fastMoveSpeed;
      character.classList.add("sprint");
    }

    var direction = "right"

    //check for obstacles
    if (document.querySelectorAll(".obstacle") != null) {

      if (obstacleCheck(direction,moveDistance) == false || obstacleCheck(direction,moveDistance) == true && !character.classList.contains("right")) {
        //if no obstacles, or obstacles but moving the other way, then pass to the move function
        moveRight(moveDistance)
      }
    }

    //check for buildings
    churchOverlap();
  }

  if (event.key === 'ArrowUp' || event.key === 'w' ||character.classList.contains("up") || event.target.id == "up-arrow-button") {
    
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (event.shiftKey) {
      var moveDistance = +fastMoveSpeed;
      character.classList.add("sprint");
    }

    var direction = "up"

    //check for obstacles
    if (document.querySelectorAll(".obstacle") != null) {

      if (obstacleCheck(direction,moveDistance) == false || obstacleCheck(direction,moveDistance) == true && !character.classList.contains("up")) {
        //if no obstacles, or obstacles but moving the other way, then pass to the move function
        moveUp(moveDistance);
      }
    }

    //check for buildings
    churchOverlap();
  }

  if (event.key === 'ArrowDown' || event.key === 's' || character.classList.contains("down") || event.target.id == "down-arrow-button") {
    
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (event.shiftKey) {
      var moveDistance = +fastMoveSpeed;
      character.classList.add("sprint");
    }

    var direction = "down"

    //check for obstacles
    if (document.querySelectorAll(".obstacle") != null) {

      if (obstacleCheck(direction,moveDistance) == false || obstacleCheck(direction,moveDistance) == true && !character.classList.contains("down")) {
        //if no obstacles, or obstacles but moving the other way, then pass to the move function
        moveDown(moveDistance);
      }
    }

    //check for buildings
    churchOverlap();
  }
}

function buttonRelease() {
  if (event.key === 'ArrowLeft' || event.key === 'a') {
    moveDistance = "8"
    if(event.shiftKey) {
      moveDistance = "16"
    }
    stopLeft()
    //re-check for obstacles
    obstacleCheck("left",moveDistance)
    //check for buildings
    churchOverlap();
    //fix zindex
    zIndexSort()
  }

  if (event.key === 'ArrowRight' || event.key === 'd') {
    moveDistance = "8"
    if(event.shiftKey) {
      moveDistance = "16"
    }
    stopRight()
    //re-check for obstacles
    obstacleCheck("right",moveDistance)
    //check for buildings
    churchOverlap();
    //fix zindex
    zIndexSort()
  }

  if (event.key === 'ArrowUp' || event.key === 'w') {
    moveDistance = "8"
    if(event.shiftKey) {
      moveDistance = "16"
    }
    stopUp()
    //re-check for obstacles
    obstacleCheck("up",moveDistance)
    //check for buildings
    churchOverlap();
    //fix zindex
    zIndexSort()
  }

  if (event.key === 'ArrowDown' || event.key === 's') {
    moveDistance = "8"
    if(event.shiftKey) {
      moveDistance = "16"
    }
    stopDown()
    //re-check for obstacles
    obstacleCheck("down",moveDistance)
    //check for buildings
    churchOverlap();
    //fix zindex
    zIndexSort()
  }

  //this prevents any weird lingering of the move animation (and it's readded immediately if a direction is held)
  if (event.key === 'Shift') {
    character.classList.remove("moving");
    character.classList.remove("sprint");
  }
}

//check for the church overlap

function churchOverlap() {
  var church = document.querySelector(".churchtop");
  var characterBounds = character.getBoundingClientRect();

  var churchBounds = church.getBoundingClientRect();

      var overlap = !(churchBounds.right <= characterBounds.left || churchBounds.left >= characterBounds.right ||
                    churchBounds.bottom <= characterBounds.top || churchBounds.top >= characterBounds.bottom);

      if (overlap === true) {
        church.style.opacity = "0";
      }

      if (overlap === false) {
        church.style.opacity = "1";
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

      //if there's overlap
      if (overlap === true) {

        //check where the overlap is [overlap || character || object]

        var overlapLeftRight = characterBounds.left <= obstacleBounds.right
        var overlapRightLeft = characterBounds.right >= obstacleBounds.left
        var overlapTopBottom = characterBounds.top <= obstacleBounds.bottom
        var overlapBottomTop = characterBounds.bottom >= obstacleBounds.top

        if (overlapLeftRight == true && character.classList.contains("right")) {
          //if character left overlaps object right, increase left to push it over
          character.style.left = parseInt(character.style.left) - parseInt(moveDistance) + "px";
        }

        if (overlapRightLeft == true && character.classList.contains("left")) {
          //if character right overlaps object left, decrease left to push it over
          character.style.left = parseInt(character.style.left) + parseInt(moveDistance) + "px";
        }

        if (overlapTopBottom == true && character.classList.contains("up")) {
          //if character top overlaps object bottom, increase top to push it down
          character.style.top = parseInt(character.style.top) + parseInt(moveDistance) + "px";
        }

        if (overlapBottomTop == true && character.classList.contains("down")) {
          //if character bottom overlaps object top, decrease top to push it up
          character.style.top = parseInt(character.style.top) - parseInt(moveDistance) + "px";
        }

      }
    }

    //for "fences" (elements you can pass behind/in front of but not through)
    if (obstacle[i].classList.contains("fence")) {
      var obstacleBounds = obstacle[i].getBoundingClientRect();

      var overlap = !(obstacleBounds.right <= characterBounds.left || obstacleBounds.left >= characterBounds.right ||
                    obstacleBounds.bottom <= characterBounds.top || obstacleBounds.top >= characterBounds.bottom);

      //if there's overlap
      if (overlap === true) {

        //check where the overlap is [overlap || character || object]

        //allow to move up unless the character bottom is higher than the obstacle bottom

        var overlapTopBottom = characterBounds.top <= obstacleBounds.bottom
        var overlapBottomTop = characterBounds.bottom >= obstacleBounds.top

        var behind = (parseInt(obstacle[i].style.zIndex) + parseInt(moveDistance)) > parseInt(character.style.zIndex);
        var inFront = (parseInt(obstacle[i].style.zIndex) - parseInt(moveDistance)) < parseInt(character.style.zIndex);

        if (overlapBottomTop == true && character.classList.contains("down") && behind == true) {
          //if character bottom overlaps object top, decrease top to push it up
          character.style.top = parseInt(character.style.top) - parseInt(moveDistance) + "px";
        }

        if (overlapTopBottom == true && character.classList.contains("up")) {
          //if character top overlaps object bottom,
          var overlapBottomBottom = characterBounds.bottom <= obstacleBounds.bottom
          //see if the bottom is also higher, and if we're in front
          if (overlapBottomBottom == true && inFront === true) {
            //if it is, increase top to push it down
            character.style.top = parseInt(character.style.top) + parseInt(moveDistance) + "px";
          }
        }

      }
    }

  }
  //otherwise we're good
  return false;
}

//check for interactable object (NPC, Item) 
function interactCheck() {
  var npc = document.querySelectorAll(".npc");
  var characterBounds = character.getBoundingClientRect();

  var objective = document.querySelectorAll(".objective");
  var characterBounds = character.getBoundingClientRect();

  //for NPCs
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
  }

    //for items
    for (i = 0; i < objective.length; i++) {
    var objectiveBounds = objective[i].getBoundingClientRect();

    //check all objectives for intersection
    var overlap = !(objectiveBounds.right <= characterBounds.left || objectiveBounds.left >= characterBounds.right ||
                  objectiveBounds.bottom <= characterBounds.top || objectiveBounds.top >= characterBounds.bottom);

    if (overlap === true && !objective[i].classList.contains("collected")) {
      //if player is touching one (and it hasn't been found), return which one
      var foundItem = objective[i];
      return foundItem
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
      var newZIndex = "896"
    }

    if(direction == "down") {
      var opposite = "up"; var perp1 = "left"; var perp2 = "right";
      var matchesDirection = matchesDown; var matchesOpposite = matchesUp; var matchesPerp1 = matchesLeft; var matchesPerp2 = matchesRight;
      var newZIndex = "1"
    }

    //if there's NO OTHER SCREENS, we add one to the direction, and remove initial class
      if (matchesDirection.length + matchesOpposite.length + matchesPerp1.length + matchesPerp2.length == "0") {
        gameContainer.classList.remove("initial-screen");
        gameContainer.classList.add(direction + "-" + "1");

        //if moving up or down, fix the z-index
        if (direction == "up" || direction == "down") {
          character.style.zIndex = newZIndex;
        }

        //and exit
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
            //remove the previous class
            gameContainer.classList.remove(matchesDirection);
            gameContainer.classList.add(direction + "-" + (parseInt(screenNumber) + parseInt("1")));

            //if moving up or down, fix the z-index
            if (direction == "up" || direction == "down") {
              character.style.zIndex = newZIndex;
            }
            //and exit
            return
          } else {
            //otherwise, and add a new one that's 1 higher
            gameContainer.classList.add(direction + "-" + "1");

            //if moving up or down, fix the z-index
            if (direction == "up" || direction == "down") {
              character.style.zIndex = newZIndex;
            }
            //and exit
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
                //if moving up or down, fix the z-index
                if (direction == "up" || direction == "down") {
                  character.style.zIndex = newZIndex;
                }
                //and exit
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

      if (direction == "up" || direction == "down") {
        character.style.zIndex = newZIndex;
      }
  }

///////////////////////NPCs

///////////////////////

//z-index shenanigans for layering 
function zIndexSort() {

  //get all givs in the game screen
  var screenElements = gameContainer.querySelectorAll("div");

  //go down the list, and set their z-index to their top position
  for (i = 0; i < screenElements.length; i++) {
    var screenElementBounds = parseInt(screenElements[i].style.top);
      
    if (screenElementBounds > 0) {
      screenElements[i].style.zIndex = screenElementBounds;
    }
  }
}

