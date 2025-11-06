////// Code to move the character

////KNOWN BUGS
//So. Groan. You can clip through normal obstacles if you manage to stagger right.
//The fix I'll have to use is resetting your position at the start of each move,
//Or, what I'd rather if I can get it to fucking behave, is have it set your position to the edge of the object

////PLANS
//Fullscreen: needs to use zoom or else pixel alignments break. Would need to dynamically find the right zoom number and use that with JS

//character + container
const character = document.getElementById("test-character");
const gameContainer = document.getElementById("game-container");

buttonPressed = "initial";

//move distance (may have modifiers so I made it a variable)
var slowMoveSpeed = "8"
var fastMoveSpeed = "16"

//these numbers need to be the width minus the respective height/width of the character
var gameWidth = parseInt(795)
var gameHeight = parseInt(510)

//only mobile stuff (if no mouse support)
if (!matchMedia('(pointer:fine)').matches) {
  //this makes the buttons work on mobile
  window.addEventListener("contextmenu", function(e) { e.preventDefault(); })

  //and for reasons unbeknownst to me, mobile moves faster still so we half
  var slowMoveSpeed = "4"
  var fastMoveSpeed = "8"
}

//this checks if the mouse is held down, to repeat click directions
var mouseDown = 0;

document.body.ontouchstart = function() { 
    mouseDown = 1;
    console.log(mouseDown + " being pressed");
}
document.body.ontouchend = function() {
    mouseDown = 0;
    buttonRelease;
    console.log(mouseDown + " let go");
}

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
  //on mobile, check if we're on a recall, and if so, repeat that event
  if (!matchMedia('(pointer:fine)').matches) {
    if (buttonPressed != "initial") {
      eventVar = buttonPressed;
    } else {
      eventVar = event;
    }
  } else {
    //and this makes sure it's defined for desktop
    eventVar = event;
  }

  //remove directions whenever starting to move in a new one
  if (character.classList.contains("stopped")) {
    character.classList.remove("up","down","left","right","stopped");
  }

  if (eventVar.key === 'q' || eventVar.key === 'Tab') {
    //open/close menu
    //if there's dialogue open, don't do shit
    if (document.querySelector(".dialogue-popup").id != "") {
      return
    }

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
  if (eventVar.key === ' ' || eventVar.target.id == "dialogue-arrow" || eventVar.target.id == "interact-button") {

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

  if (eventVar.key === 'ArrowLeft' || eventVar.key === 'a' || character.classList.contains("left") || eventVar.target.id == "left-arrow-button" || direction == "left") {

    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (eventVar.shiftKey) {
      var moveDistance = +fastMoveSpeed
      character.classList.add("sprint");
    }

    var direction = "left"

    //check for obstacles
    if (document.querySelectorAll(".obstacle") != null) {

      if (obstacleCheck(direction,moveDistance) == false || obstacleCheck(direction,moveDistance) == true && !character.classList.contains("left")) {
        //if no obstacles, then pass to the move function
        moveLeft(moveDistance)
      } else {
        //this helps prevent clipping
        character.style.left = parseInt(character.style.left) + parseInt(moveDistance) + "px";
      }
    }

    //check for buildings
    churchOverlap();

  }

  if (eventVar.key === 'ArrowRight' || eventVar.key === 'd' || character.classList.contains("right") || eventVar.target.id == "right-arrow-button" ||  direction == "right") {
    
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (eventVar.shiftKey) {
      var moveDistance = +fastMoveSpeed;
      character.classList.add("sprint");
    }

    var direction = "right"

    //check for obstacles
    if (document.querySelectorAll(".obstacle") != null) {

      if (obstacleCheck(direction,moveDistance) == false || obstacleCheck(direction,moveDistance) == true && !character.classList.contains("right")) {
        //if no obstacles, or obstacles but moving the other way, then pass to the move function
        moveRight(moveDistance)
      } else {
        //this helps prevent clipping
        character.style.left = parseInt(character.style.left) - parseInt(moveDistance) + "px";
      }
    }

    //check for buildings
    churchOverlap();
  }

  if (eventVar.key === 'ArrowUp' || eventVar.key === 'w' ||character.classList.contains("up") || eventVar.target.id == "up-arrow-button" || direction == "up") {
    
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (eventVar.shiftKey) {
      var moveDistance = +fastMoveSpeed;
      character.classList.add("sprint");
    }

    var direction = "up"

    //check for obstacles
    if (document.querySelectorAll(".obstacle") != null) {

      if (obstacleCheck(direction,moveDistance) == false || obstacleCheck(direction,moveDistance) == true && !character.classList.contains("up")) {
        //if no obstacles, or obstacles but moving the other way, then pass to the move function
        moveUp(moveDistance);
      } else {
        //this helps prevent clipping
        character.style.top = parseInt(character.style.top) + parseInt(moveDistance) + "px";
      }
    }

    //check for buildings
    churchOverlap();
  }

  if (eventVar.key === 'ArrowDown' || eventVar.key === 's' || character.classList.contains("down") || eventVar.target.id == "down-arrow-button" ||  direction == "down") {
    
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (eventVar.shiftKey) {
      var moveDistance = +fastMoveSpeed;
      character.classList.add("sprint");
    }

    var direction = "down"

    //check for obstacles
    if (document.querySelectorAll(".obstacle") != null) {

      if (obstacleCheck(direction,moveDistance) == false || obstacleCheck(direction,moveDistance) == true && !character.classList.contains("down")) {
        //if no obstacles, or obstacles but moving the other way, then pass to the move function
        moveDown(moveDistance);
      } else {
        //this helps prevent clipping
        character.style.top = parseInt(character.style.top) - parseInt(moveDistance) + "px";
      }
    }

    //check for buildings
    churchOverlap();
  }

  //set the buttonpressed var to the current event trigger, to recall on mobile
  buttonPressed = eventVar;

  //don't ask me why this needs to have a timeout inside and out but it won't run right otherwise
  setTimeout(() => {
    if (!matchMedia('(pointer:fine)').matches) {
      //if we're on mobile,
      if (mouseDown == 1) {
        //and button is being pressed, fire again 
        setTimeout(() => {
          buttonPress.call();
          console.log("running");
        }, 32);
      }

      if (mouseDown == 0) {
        //if button isn't being pressed, end 
        setTimeout(() => {
          buttonRelease();
          console.log("running 2");
        }, 32);
      }
    }
  }, 32);
}

function buttonRelease() {
  //on mobile, check if we're on a recall, and if so, repeat that event
  if (!matchMedia('(pointer:fine)').matches) {
    if (buttonPressed != "initial") {
      var eventVar = buttonPressed;
    } else {
      eventVar = event;
    }
  } else {
    //and this makes sure it's defined for desktop
    eventVar = event;
  }

  if (eventVar.key === 'ArrowLeft' || eventVar.key === 'a' || eventVar.target.id == "left-arrow-button") {
    moveDistance = slowMoveSpeed
    if(eventVar.shiftKey) {
      moveDistance = fastMoveSpeed
    }
    stopLeft();
    //re-check for obstacles
    obstacleCheck("left",moveDistance)
    //check for buildings
    churchOverlap();
    //fix zindex
    zIndexSort()

    //and reset button pressed for mobile
    buttonPressed = "initial";
  }

  if (eventVar.key === 'ArrowRight' || eventVar.key === 'd' || eventVar.target.id == "right-arrow-button") {
    moveDistance = slowMoveSpeed
    if(eventVar.shiftKey) {
      moveDistance = fastMoveSpeed
    }
    stopRight()
    //re-check for obstacles
    obstacleCheck("right",moveDistance)
    //check for buildings
    churchOverlap();
    //fix zindex
    zIndexSort()

    //and reset button pressed for mobile
    buttonPressed = "initial";
  }

  if (eventVar.key === 'ArrowUp' || eventVar.key === 'w' || eventVar.target.id == "up-arrow-button") {
    moveDistance = slowMoveSpeed
    if(eventVar.shiftKey) {
      moveDistance = fastMoveSpeed
    }
    stopUp()
    //re-check for obstacles
    obstacleCheck("up",moveDistance)
    //check for buildings
    churchOverlap();
    //fix zindex
    zIndexSort()

    //and reset button pressed for mobile
    buttonPressed = "initial";
  }

  if (eventVar.key === 'ArrowDown' || eventVar.key === 's' || eventVar.target.id == "down-arrow-button") {
    moveDistance = slowMoveSpeed
    if(eventVar.shiftKey) {
      moveDistance = fastMoveSpeed
    }
    stopDown()
    //re-check for obstacles
    obstacleCheck("down",moveDistance)
    //check for buildings
    churchOverlap();
    //fix zindex
    zIndexSort()

    //and reset button pressed for mobile
    buttonPressed = "initial";
  }

  //this prevents any weird lingering of the move animation (and it's readded immediately if a direction is held)
  if (eventVar.key === 'Shift') {
    moveDistance = slowMoveSpeed
    if(eventVar.shiftKey) {
      moveDistance = fastMoveSpeed
    }

    character.classList.remove("sprint");
    obstacleCheck("down",moveDistance);
    obstacleCheck("up",moveDistance);
    obstacleCheck("left",moveDistance);
    obstacleCheck("right",moveDistance);
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
        //subtract a value from it to set it right
        setTimeout(() => {
          character.style.left = leftPosition - moveDistance + "px";
        }, 16);
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
        //add a value to it, and pixels to set it right
        setTimeout(() => {
          character.style.left = leftPosition + moveDistance + "px";
        }, 16);
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
        //subtract a value from it, and pixels to push it up
        setTimeout(() => {
          character.style.top = topPosition - moveDistance + "px";
        }, 16);
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
        //add a value to it, and pixels to push it down
        setTimeout(() => {
          character.style.top = topPosition + moveDistance + "px";
        }, 16);
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
    }, 16);
  }

  function stopRight() {
    setTimeout(() => {
      character.classList.remove("moving");
      if (character.classList.contains("sprint")){
        character.classList.remove("sprint");
      }
      character.classList.add("stopped");
    }, 16);
  }

  function stopUp() {
    setTimeout(() => {
      character.classList.remove("moving");
      if (character.classList.contains("sprint")){
        character.classList.remove("sprint");
      }
      character.classList.add("stopped");
    }, 16);
  }

  function stopDown() {
    setTimeout(() => {
      character.classList.remove("moving");
      if (character.classList.contains("sprint")){
        character.classList.remove("sprint");
      }
      character.classList.add("stopped");
    }, 16);
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
    }, 16);

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