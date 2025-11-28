////// Code to move the character

////KNOWN BUGS
//Can walk over church pews due to them being fences. Need to have some separate object type maybe idk how to fix this one yet
//Leaf stutter on mobile -- this is an optimization thing. I should have a clause to cancel calling a pause when you go quickly between two
//Object that make the same sfx, possibly by adding a class
//SO I found a way to randomly clip through fences VERY accidentally, and there's still some sticking near them. IDK man.

//Menu open/close doesn't interact w forest music (maybe I'll just replace the SRC etc)

//Need to optimize obstacle check - old method was buggy

////PLANS
//Fullscreen: needs to use zoom or else pixel alignments break. Would need to dynamically find the right zoom number and use that with JS
///for bullfrog: on change screen, check gamecontainer classlist, if it's got one of the bottom middle three, play; otherwise, pause

//For animating dialogue -- it would be spliced by letters, and then inserted one at a time with a small delay via innerHTML+
//Would need to either disable space, or have space clear the interval tho to prevent skipping


//this is evil and it needs to be defined globally I fucking guess
var crowInterval;
var expressions = "";
var direction = "initial";
var duckInterval = "initial";
var slideInterval;

var leftLocation = "Jensen Acres";

//need these silly things for Gnash dialogue
var gnash = false;
var inDialogue = false;
var talked = false;
var gnashOptions = false;
var currentOption = "initial"

//player vars 
var ambiencePlayer = document.getElementById("ambience-player");
var backgroundPlayer = document.getElementById("background-player");
var forestAmbience = document.getElementById("forest-ambience-player");
var forestPlayer = document.getElementById("forest-player");
var musicBox = document.getElementById("music-box");
var menuPlayer = document.getElementById("menu-player");

const obstacle = document.getElementsByClassName("obstacle");

//character + container
const character = document.getElementById("test-character");
const nose = document.getElementById("nose");
const gameContainer = document.getElementById("game-container");

buttonPressed = "initial";

//move distance (may have modifiers so I made it a variable)
var slowMoveSpeed = "8"
var fastMoveSpeed = "16"
var moveDelay = "64";

var sprintButton = document.getElementById("sprint-button");

//these numbers need to be the width minus the respective height/width of the character
var gameWidth = parseInt(795);
var gameHeight = parseInt(510);

///quick OS detector for stupid stupid ipads
window.addEventListener("load", getMobileOperatingSystem);

function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    //Mac detection 
    if (navigator.platform.startsWith("Mac") || navigator.platform === "iPhone") {
        return "Mac";
    }
}

var OS = getMobileOperatingSystem();

var smallMobile = matchMedia('(hover:none)').matches && screen.width < "1024";
var appleDevice = OS == "Mac" && matchMedia('(any-pointer:coarse)').matches || OS == "iOS";

////and a zoom set, for phones n shit
//fire when we rotate/resize
window.addEventListener("resize", zoomScreen);
//and right away
zoomScreen();

function zoomScreen() {
  const mediaQuery = window.matchMedia('(max-width: 896px)');
  const mediaQueryLG = window.matchMedia('(max-width: 950px)');

  var gameWrapper = document.getElementById("game-wrapper");

  if (mediaQuery.matches || (smallMobile == true && mediaQueryLG.matches) || (appleDevice == true && mediaQueryLG.matches)) {
    gameWrapper.style.zoom = ((document.documentElement.clientWidth / 1097) - 0.05);
    gameWrapper.style.zoom = ((document.documentElement.clientHeight / 576) - 0.05);
  }

  const ipadProW = window.matchMedia('(width: 1366px)');
  const ipadProH = window.matchMedia('(height: 1024px)');

  if (ipadProW.matches && ipadProH.matches) {
    gameWrapper.style.zoom = ((document.documentElement.clientWidth / 1097) + 0.05);
    document.getElementById("inventory").style.maxWidth = "160px";
    document.getElementById("inventory").style.fontSize = "70%";
  }
}

////////////////////////////////////////////////////////////////////////////////

//only mobile stuff (if no mouse support)
if (smallMobile == true || appleDevice == true) {
  //this makes the buttons work on mobile
  window.addEventListener("contextmenu", function(e) { e.preventDefault(); })
  document.querySelector("body").classList.add("touch-only");
}

//set sfx audio volume 
window.addEventListener("load", audioVolume);

function audioVolume() {
  var soundEffect = document.querySelectorAll(".sound-effect");
  for (i = 0; i < soundEffect.length; i++) {
    soundEffect[i].volume = 0.5;
  }
  backgroundPlayer.volume = 0.7;
  document.getElementById("advance").volume = 0.2;
  document.getElementById("leaves").volume = 0.2;

  forestPlayer.volume = 0.2;
  forestAmbience.volume = 0.2;
}

//this checks if the mouse is held down, to repeat click directions
var mouseDown = 0;

document.body.ontouchstart = function() { 
    mouseDown = 1;
}
document.body.ontouchend = function() {
    mouseDown = 0;
    buttonRelease;
}

///////////////////////Tutorial, titles, & other things over top

window.addEventListener("load", hideLoader);

function hideLoader() {
  document.getElementById("loader").style.opacity = "0";
  setTimeout(() => {
     document.getElementById("loader").style.display = "none";
     document.getElementById("wait").classList.add("stop");
  }, 200);
}

//load the game title in when the page loads
window.addEventListener("load", screenTitle);

//(and it's also called when someone changes screens)
function screenTitle() {
  var screenName = document.getElementById("screen-display");
  //check which screen we're on, and get the appropriate title

  //default screen name for all cases
  screenName.innerHTML = "Jensen Acres";

  //for the forest area
  if (gameContainer.classList.contains("left-3") || gameContainer.classList.contains("left-2") || gameContainer.classList.contains("left-1", "up-1")) {
    //we have this as a global variable, modified when you leave the forest;
    screenName.innerHTML = leftLocation;
  }

  //for Gnash's screen
  if (gameContainer.classList.contains("left-3", "up-1")) {
    screenName.innerHTML = "Tangled Nest";
  }

  //for the pond
  if (gameContainer.classList.contains("down-1") && !gameContainer.classList.contains("right-3") && !gameContainer.classList.contains("left-2") && !gameContainer.classList.contains("left-3")) {
    screenName.innerHTML = "Khoi Pond";
  }

  //for the church
  if (gameContainer.classList.contains("right-2") || gameContainer.classList.contains("right-3")) {
    screenName.innerHTML = "Abandoned Church";
  }

  //for the Quincy's spot
  if (gameContainer.classList.contains("right-3") && gameContainer.classList.contains("down-1")) {
    screenName.innerHTML = "Quincy's Spot";
  }

  //add a hyphen
  screenName.innerHTML += " - ";

  //and then add the directional classes for navigation
  screenName.innerHTML += gameContainer.classList.toString().replace(/\s/g, ' SPACEHOLDER ').replace(/-/g, ' ').replace(' SPACEHOLDER ', ', ');

  //we're gonna call this in here, to be sure it's all updated when it goes
  if (document.getElementById("tutorial").style.display == "none") {
    soundEffectManage();
  }
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

    //remove that once the tutorial is gone
    window.removeEventListener("keydown", hideTutorial);

    //start the cutscene
    cutScene("intro-cutscene");
    document.getElementById("intro-player").play();
  }
}

function cutScene(slidePlayer) {
  //theres.... a lot of timeouts in here and my head hurts but know they work okay
  var cutScene = document.getElementById(slidePlayer);
  //show the cutscene box
  cutScene.classList.add("playing");

  if (slidePlayer == "outro-cutscene") {
    var gnash = false;
    var inDialogue = false;
    var talked = false;
    var gnashOptions = false;
    var currentOption = "initial";
    //no funny business
    document.removeEventListener("keydown", buttonPress);
    document.removeEventListener("keyup", buttonRelease);
  }

  //get all cutscene slides
  var slides = cutScene.getElementsByClassName("slide")
  
  //make sure they're all not visible (IDK why this is needed but the CSS is being overwritten so);
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  //allow for skipping
  window.addEventListener("keydown", addSkip);

  //set the interval for slideshow
  clearInterval(slideInterval);

  if (slidePlayer == "credits") {
    slideInterval = setInterval(slideChange, 6000);
  } else {
    slideInterval = setInterval(slideChange, 10400);
  }
  var slideNumber = "0";

  //show the first slide
  slides[slideNumber].style.display = "flex";
  setTimeout(() => {
    slides[slideNumber].style.opacity = "1";
    slides[slideNumber].style.backgroundPosition = "0 center";
  }, 200);
  
  function slideChange() {
    //hide the current slide
    slides[slideNumber].style.opacity = "0";

    setTimeout(() => {
      slides[slideNumber].style.display = "none";

      //redefine slide number
      slideNumber = parseInt(slideNumber) + parseInt("1");

      //show the next slide
      slides[slideNumber].style.display = "flex";
      setTimeout(() => {
        slides[slideNumber].style.opacity = "1";
        if (!slides[slideNumber].classList.contains("static")) {
          slides[slideNumber].style.backgroundPosition = "0 center";
        }
      }, 200);

      //if we're currently on the last slide,
      if (slideNumber == parseInt(slides.length) - parseInt("1")) {
        //stop iterating
        clearInterval(slideInterval);

        //fade out and hide the curent slide
        setTimeout(() => {
          slides[slideNumber].style.opacity = "0";
          setTimeout(() => {
            slides[slideNumber].style.display = "none";
            //and hide
            hideCutscene();

          }, 200);
        }, 10200);
      }
    }, 200);
  }

}

function playCredits() {
  //this has to be a looped function man
  cutScene("credits");
}

//skip
function addSkip() {
  var cutScene = document.querySelector(".cutscene.playing");

  cutScene.querySelector(".skip").style.opacity = "0.6"
  window.addEventListener("keydown", hideCutscene);

  setTimeout(() => {
    cutScene.querySelector(".skip").style.opacity = "0"
    window.removeEventListener("keydown", hideCutscene);
  }, 2000);
}

function hideCutscene() {
  var cutScene = document.querySelector(".cutscene.playing");
  var slidePlayer = cutScene.id;
  //hide cutscence (lower opacity and then after it fades, hide it fully);
  var introPlayer = document.getElementById("intro-player")

  if (!introPlayer.paused) {
    fadeOut(introPlayer);
  }
  if (!musicBox.paused) {
    fadeOut(musicBox);
  }

  setTimeout(() => {
    cutScene.classList.remove("playing");
    }, 200);
  cutScene.style.opacity = "0";

  //and remove the listener once it's gone, and clear interval
  window.removeEventListener("keydown", addSkip);
  window.removeEventListener("keydown", hideCutscene);
  clearInterval(slideInterval);

  //only set the game up for play if it's the intro custcene
  if (slidePlayer == "intro-cutscene") {
    //start playing music
    backgroundPlayer.play();
    ambiencePlayer.play();

    //add open to the mobile controls on the intro cutscene, otherwise hide em
    if (slidePlayer == "intro-cutscene") {
      document.getElementById("mobile-controls").classList.add("open");
    } else {
      document.getElementById("mobile-controls").classList.remove("open");
    }
    //run through all the functions of the controller whenever someone presses a button
    document.addEventListener("keydown", buttonPress);
    //run through all the functions of the controller whenever someone lifts a button
    document.addEventListener("keyup", buttonRelease);
  }

  if (slidePlayer == "outro-cutscene") {
    //play the credits if we're on the outro
    playCredits();
  }

  if (slidePlayer == "credits") {
    //if we're on credits, set up and display the endcard
    console.log("endcard");
    document.getElementById("endcard").style.display = "flex";

    document.addEventListener("keydown", endcardToggle);

    //I cleared this in like 20000 places man IDFK
    clearInterval(slideInterval);
  }

}
//fill in inventory descriptions
var itemViewer = document.getElementById("item-viewer");
var menu = document.getElementById("inventory");
var items = itemViewer.getElementsByTagName("span");

//loop through the inventory
for (i = 0; i < items.length; i++) {
  //get the name of each item
  itemName = items[i].id.replace("-description", "");

  //loop through the interact list
  for (j = 0; j < npcList.length; j++) {
    if (itemName == npcList[j].name) {
      var description = items[i].querySelector(".description")
      //if they match, set the description text
      description.innerHTML = npcList[j].dialogue.replace(/♡/g, "");
    }
  }

}

///////////////////////Misc character pre-functions

window.addEventListener("load", zIndexSort);

//z-index sort for all obstacles
function zIndexSort() {

  //get all divs in the game screen
  var screenElements = gameContainer.querySelectorAll("div");

  //go down the list, and set their z-index to their top position
  for (i = 0; i < screenElements.length; i++) {
    //grab all items other than the churchtop & ground items
    if (!screenElements[i].classList.contains("ground") && !screenElements[i].classList.contains("churchtop")) {
      var screenElementBounds = parseInt(screenElements[i].style.top);
        
      //don't touch if it's below 0 as well
      if (screenElementBounds > 0) {
        screenElements[i].style.zIndex = screenElementBounds;
      }
    }
  }

  //and then for the ground items, set em all to 1
  var ground = document.querySelectorAll(".ground") 
  for (i = 0; i < ground.length; i++) {
    ground[i].style.zIndex = "1";
  }
}

//this is called from the screenchange function
function duckCheck() {
  //if we're on the bottom screen,
  if (gameContainer.classList.contains("down-1") && !gameContainer.classList.contains("left-1") && !gameContainer.classList.contains("left-2") && !gameContainer.classList.contains("left-3") && !gameContainer.classList.contains("right-1") && !gameContainer.classList.contains("right-2") && !gameContainer.classList.contains("right-3")) {
    //move that duck,
    moveDuck();
    //and if we don't have an interval, set it
    if (duckInterval == "initial") {
      duckInterval = setInterval(moveDuck, 6000);
    }
  } else {
    //otherwise, reset the interval
    if (duckInterval != "initial") {
      clearInterval(duckInterval);
      duckInterval = "initial";
    }
  }
}

//duck move
function moveDuck() {
  const duck = document.getElementById("Duck");
  duck.classList.toggle("left");
}

///////////////////////Controlling the Character & Other Inputs

//this is for the mobile sprint button only
function sprintToggle() {

  if (!sprintButton.classList.contains("active")) {
    sprintButton.classList.add("active");
    character.classList.add("sprint");
    return;
  }

  if (sprintButton.classList.contains("active")) {
    sprintButton.classList.remove("active");
    character.classList.remove("sprint");
    return;
  }
}

function buttonPress() {
  //on mobile, check if we're on a recall, and if so, repeat that event
  if (smallMobile == true || appleDevice == true) {
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

  if (character.classList.contains("fixed")) {
    return
  }

  //if we're stuck, fix our position
  if (character.classList.contains("blocked")) {
    obstacleCorrect();
    return;
  }

  if (eventVar.key === 'q' || eventVar.target.id == "menu-button") {
    //open/close menu

    //if there's dialogue open, don't do shit
    if (document.querySelector(".dialogue-popup").id != "") {
      return
    }

    //if it's open, close it
    if (menu.classList.contains("open")) {
      menu.classList.remove("open");
      if (menu.querySelector(".collected") != null) {
        menu.querySelector(".collected").classList.remove("viewing");
      }

      //if we're in the forest
      if (document.body.classList.contains("inForest")) {
        //play ambience & background
        forestAmbience.play();
        forestPlayer.play();
      } 
      if (!document.body.classList.contains("inForest")) {
        //play ambience & background
        ambiencePlayer.play();
        backgroundPlayer.play();
      }

      //and pause menu music (+ set it to beginning)
      menuPlayer.pause();
      menuPlayer.currentTime = 0;

      document.querySelector(".focus").classList.remove("focus");
      document.querySelector("span.viewing").classList.remove("viewing");
      return
    }
    
    //if it's closed, open it
    if (!menu.classList.contains("open")) {
      //pause ambience & background (+ set them to beginning)
      if (document.body.classList.contains("inForest")) {
        //in forest
        forestAmbience.pause();
        forestPlayer.pause();
        forestAmbience.currentTime = 0;
        forestPlayer.currentTime = 0;
      } 
      if (!document.body.classList.contains("inForest")) {
        //not in forest
        ambiencePlayer.pause();
        backgroundPlayer.pause();

        ambiencePlayer.currentTime = 0;
        backgroundPlayer.currentTime = 0;
      }

      //and play menu music
      document.getElementById("menu-player").play();

      menu.classList.add("open");

      if (menu.querySelector(".collected") != null) {
        //if there's collected items,

        //first, hide default
        var defaultText = document.getElementById("Default");
        defaultText.style.display = "none";

        var collectedItems = menu.getElementsByClassName("collected");
        var itemDisplays = itemViewer.getElementsByTagName("span");
        
        //grab the first collected item, add focus to it
        collectedItems[0].classList.add("focus");

        //and then we find the matching name, and add viewing to that
        for (i = 0; i < itemDisplays.length; i++) {
          if (itemDisplays[i].id.replace("-description","") == collectedItems[0].id.replace("Inventory","")) {
            itemDisplays[i].classList.add("viewing");
            break;
          }
        }

      }
      return
    }
  }
  
  //on spacebar click, call item check. if it returns true, modify the clicked item
  if (eventVar.key === ' ' || eventVar.target.id == "dialogue-arrow" || eventVar.target.id == "interact-button" || (gnash == true && inDialogue == false)) {

    //check if you're on a reset or a success
    if (document.body.classList.contains("reset") || document.body.classList.contains("success")) {
      //if you are, set needed general variables
      var dialoguePopUp = document.querySelector(".dialogue-popup");
      var dialogueLoader = document.getElementById("dialogue-loader");

      //do stuff for the blackout (so only if we have reset & no success)
      if (!document.body.classList.contains("success")) {
        document.getElementById("blackout").style.opacity = "1";

        setTimeout(() => {
          reset();
          document.getElementById("blackout").style.opacity = "0";
        }, 1000);
      }

      //play the ending cutscene, if we have success
      if (document.body.classList.contains("success")) {
        document.getElementById("outro-cutscene").classList.add("playing");
        setTimeout(() => {
          cutScene("outro-cutscene");
        }, 600);
      }

      //check if we're on the last line of dialogue, and if so, do something different
      if (dialoguePopUp.classList.contains("last-line")) {
        //hide the popup
        dialoguePopUp.style.display = "none";
        //remove the talking ID
        dialoguePopUp.id = "";
        //remove last line,
        dialoguePopUp.classList.remove("last-line", "talking-now");
        expressions = "";
        setTimeout(() => {
          dialogueLoader.innerHTML = "";
        }, 32);

        if (interactFound != null) {        
          //add repeat for characters so we know they're done their main dialogue (items dissapear after interact, so this excludes them)
          interactFound.classList.add("repeat");
        }

        if (interactFound != null && interactFound.classList.contains("objective")) {
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
    }

    var interactFound = interactCheck();

    //this makes it so all space bar clicks after the Gnash dialogue opens work normally
    if (gnash == true && inDialogue == false) {
      inDialogue = true
      var noSound = true;
    }

    if (interactFound != undefined || document.querySelector(".last-line") != null) {

      //pause sound effects & stop character
      document.getElementById("walk-player").pause();
      document.getElementById("lope-player").pause();
      character.classList.remove("left", "right", "up", "down", "moving", "sprint");

      //if you are, set needed general variables
      var dialoguePopUp = document.querySelector(".dialogue-popup")
      var dialogueLoader = document.getElementById("dialogue-loader")

      //play sounds (stop first to make sure they restart)
      document.getElementById("advance").pause();
      document.getElementById("advance2").pause();

      document.getElementById("advance").currentTime = 0;
      document.getElementById("advance2").currentTime = 0;

      //we don't want these to play when we open Gnash
      if (!noSound == true) {
        document.getElementById("advance").play();
        document.getElementById("advance2").play();
      }

      noSound = false;

      //this is for if we're in the depths of Gnash dialogue; skips out of here
      if (gnashOptions == true) {
        gnashInteraction();
        return;
      }

      //check if we're on the last line of dialogue, and if so, do something different
      if (dialoguePopUp.classList.contains("last-line")) {
        //hide the popup
        dialoguePopUp.style.display = "none";
        //remove the talking ID
        dialoguePopUp.id = "";
        //remove last line,
        dialoguePopUp.classList.remove("last-line", "talking-now");
        expressions = "";
        setTimeout(() => {
          dialogueLoader.innerHTML = "";
        }, 32);

        if (interactFound != null) {        
          //add repeat for characters so we know they're done their main dialogue (items dissapear after interact, so this excludes them)
          interactFound.classList.add("repeat");
        }

        if (interactFound != null && interactFound.classList.contains("objective")) {
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

      if (interactFound != null && interactFound.classList.contains("repeat")) {
        //if we've talked to this NPC already, they say their extra line.
        dialoguePopUp.style.display = "flex";

        //get the name of the NPC
        var npcName = document.getElementById(interactFound.id).id;

        //specifics for Cain & Vatra's shared dialogue
        if (npcName == "Cain" || npcName == "Vatra") {
          npcName = "CainVatra";
        }

        //add the who's talking to the textbox
        var dialoguePopUp = document.querySelector(".dialogue-popup");
        dialoguePopUp.id = npcName + "-talking"

        //set their name to show up in the textbox h3
        if (npcName == "CainVatra") {
          document.getElementById("character-name").innerHTML = "Cain & Vatra";
        } else {
          document.getElementById("character-name").innerHTML = npcName;
        }

        //set the viewable image with the right SRC
        var interactDisplay = document.getElementById("interact-display");
        interactDisplay.src = "objectives/" + npcName.toLowerCase() + ".png";

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

        //play sound effect, only when item is got
        if (!dialoguePopUp.classList.contains("item-text")) {
          document.getElementById("item-effect").play();
        }

        //add item class to dialogue box, and add collected to the item in the inventory
        dialoguePopUp.classList.add("item-text");
        foundInventory.classList.add("collected");

        //drop the opacity on the interact
        interactFound.style.opacity = "0"
      }

      //make the textbox visible
      if (interactFound.id != "Gnash") {
        dialoguePopUp.style.display = "flex";
      }

      //this is for gnash specifically -- set the timeout to give time for Gnash Animation
      if (interactFound.id == "Gnash" && talked == false) {
        gnashAnimation();
        //fade the music
        fadeOut(forestPlayer);
        //remove listeners
        document.removeEventListener("keydown", buttonPress);
        document.removeEventListener("keyup", buttonRelease);

        setTimeout(() => {
          //open the box
          dialoguePopUp.style.display = "flex";
          //switch to Gnash's static animation
          document.getElementById("GnashPix").style.backgroundImage = "url(charactersprites/gnashpix.png)";
          //set talked to true so this doesn't fire again
          talked = true;

          //re-add listeners
          document.addEventListener("keydown", buttonPress);
          document.addEventListener("keyup", buttonRelease);

          //set the buttonpressed var to the current event trigger, to recall on mobile
          buttonPressed = eventVar;

          //don't ask me why this needs to have a timeout inside and out but it won't run right otherwise
          setTimeout(() => {
            if (smallMobile == true || appleDevice == true) {
              //if we're on mobile,
              if (mouseDown == 1) {
                //and button is being pressed, fire again 
                setTimeout(() => {
                  buttonPress.call();
                }, 32);
              }

              if (mouseDown == 0) {
                //if button isn't being pressed, end 
                setTimeout(() => {
                  buttonRelease();
                }, 32);
              }
            }
          }, 32);

        }, 6000);
      }

      //get the name of the NPC
      var npcName = document.getElementById(interactFound.id).id;

      //specifics for Cain & Vatra's shared dialogue
      if (npcName == "Cain" || npcName == "Vatra") {
        npcName = "CainVatra";
      }

      //add the who's talking to the textbox
      var dialoguePopUp = document.querySelector(".dialogue-popup");
      dialoguePopUp.id = npcName + "-talking"

      //set their name to show up in the textbox h3
      if (npcName == "CainVatra") {
        document.getElementById("character-name").innerHTML = "Cain & Vatra";
      } else {
        document.getElementById("character-name").innerHTML = npcName;
      }

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

      //split dialogue at the hearts (♡) [this allows us to break up our lines nicely],
      var words = dialogue.split('♡');

      //if there's expressions, shift one off
      if (expressions != "") {
        expressions.shift();
      }

      if (!dialoguePopUp.classList.contains("talking-now") && !interactFound.classList.contains("objective")) {
        //on our first one, we want to grab our facial expressions, so we separate those out (odd numbers, even is text),
        var words = dialogue.split('♡').filter((e, i) =>  i % 2 != 0);
        //and add "talking now" so we don't do it again
        expressions = dialogue.split('♡').filter((e, i) =>  i % 2 == 0);
        dialoguePopUp.classList.add("talking-now");
      }

      //set the viewable image with the proper SRC (this must be after things are split to make sure it includes the first expression)
      var interactDisplay = document.getElementById("interact-display");
      //slight delay to make sure that expressions exist
        //if it's not an item, and it isn't "null"
      if (!interactFound.classList.contains("objective") && expressions[0] != "null") {
        //get the correct sprite + expression
        interactDisplay.src = "objectives/" + npcName.toLowerCase() + expressions[0].toLowerCase() + ".png";
      } else {
        //otherwise, just do it without the expression
        interactDisplay.src = "objectives/" + npcName.toLowerCase() + ".png";
      }

      //get the first dialogue chunk, put it in the textbox
      dialogueSplit()
      function dialogueSplit() {
        var dialogueChunk = words.slice(0,1);
        //and clean it up (remove excess commas and put desired ones back in)
        dialogueLoader.innerHTML = dialogueChunk.toString().replaceAll(",", " ").replaceAll("  ", ", ");

        if (words.length == 1) {
          dialoguePopUp.classList.add("last-line");
        }
        
        words.shift(); 

        //if there's words left after the splice
        if (words.length != 0) {
          //set the global dialogue var to the new remaining text
          for (i = 0; i < npcList.length; i++) {
            if (npcName == npcList[i].name) {
              //then grab their dialogue
             npcList[i].dialogue = words.join("♡");
            }
          }
        } else {
          dialoguePopUp.classList.add("last-line");
        }
      }

      //this adds active to the first button
      var speechBubble = document.getElementById("speech-bubble");
      if (speechBubble.querySelector("button") != null) {
        var buttons = speechBubble.querySelectorAll("button");
        for (i = 0; i < buttons.length; i++) {
          //if a button is visible,
          if (buttons[i].checkVisibility() == true) {
            //pause transitions
            buttons[i].style.transition = "0ms all";
            //make it active
            buttons[i].classList.add("active");
            //and cut the loop so we just have one
            break;
          }
        }

        setTimeout(() => {
          for (i = 0; i < buttons.length; i++) {
            //and then make sure to reset transitions
            buttons[i].style.transition = "";
          }
        }, 32);
      }

    }
  }

  //If there's buttons, allow toggling and selecting
  var speechBubble = document.getElementById("speech-bubble");
  if (speechBubble.querySelector("button") != null) {

    //if we're on Gnash we need too do this bit
    if (document.querySelector(".dialogue-popup").id == "Gnash-talking") {
      gnashOptions = true;
    }

      //get all buttons in the current dialogue box, make an array
      var buttons = speechBubble.querySelectorAll("button");
      var buttonArray = Array.from(buttons)

      if (eventVar.key === 'ArrowLeft' || eventVar.key === 'a' || character.classList.contains("left") || eventVar.target.id == "left-arrow-button" || direction == "left") {
        //sounds 
        document.getElementById("advance2").pause();
        document.getElementById("advance2").currentTime = 0;
        document.getElementById("advance2").play();

        //get the active button
        var activeButton = buttonArray.find((element) => element.classList.contains("active"));

        //if we don't have one, add it to the first
        if (activeButton == null) {
          buttonArray[0].classList.add("active");
          activeButton = buttonArray[0];
        }

        //it's index
        var buttonIndex = buttonArray.indexOf(activeButton);
        //and the last button
        var lastButton = buttonArray.length - 1;

        //remove active from the current button
        activeButton.classList.remove("active");

        //if we're not on the first button,
        if (buttonIndex != 0) {
          //subtract one from the index
          buttonArray[buttonIndex - 1].classList.add("active");
        } else {
          //otherwise, add to the last button
          buttonArray[lastButton].classList.add("active")
        }
      }

      if (eventVar.key === 'ArrowRight' || eventVar.key === 'd' || character.classList.contains("right") || eventVar.target.id == "right-arrow-button" ||  direction == "right") {
        //sounds 
        document.getElementById("advance2").pause();
        document.getElementById("advance2").currentTime = 0;
        document.getElementById("advance2").play();

        //get the active button
        var activeButton = buttonArray.find((element) => element.classList.contains("active"));
        //it's index
        var buttonIndex = buttonArray.indexOf(activeButton);
        //and the last button
        var lastButton = buttonArray.length - 1;

        //remove active from the current button
        activeButton.classList.remove("active");

        //if we're not on the last button,
        if (buttonIndex != lastButton) {
          //add one to the index
          buttonArray[buttonIndex + 1].classList.add("active");
        } else {
          //otherwise, add to the first button
          buttonArray[0].classList.add("active")
        }
      }
  }
  
  if (!document.querySelector(".dialogue-popup").id == "") {
    //end this if dialogue is open
    return
  }

  if (menu.classList.contains("open") && menu.querySelector(".collected") != null) {
    //if menu is open we also wanna do some different stuff
    if (eventVar.key === 'ArrowLeft' || eventVar.key === 'a' || eventVar.target.id == "left-arrow-button") {
      var collected = menu.getElementsByClassName("collected");
      var collectedItems = Array.from(collected);
      var itemDisplays = itemViewer.getElementsByTagName("span");

      //play sounds (stop first to make sure they restart)
      document.getElementById("advance2").pause();
      document.getElementById("advance2").currentTime = 0;

      //play
      document.getElementById("advance2").play();

      //get the focused button
      var focusButton = collectedItems.find((element) => element.classList.contains("focus"));

      //if we don't have one, add it to the first
      if (focusButton == null) {
        collectedItems[0].classList.add("focus");
        focusButton = collectedItems[0];
      }

      //get it's index
      var buttonIndex = collectedItems.indexOf(focusButton);
      //and the last button
      var lastButton = collectedItems.length - 1;

      //remove active from the current button
      focusButton.classList.remove("focus");
      //and remove viewing from em all
      for (i = 0; i < itemDisplays.length; i++) {
        if (itemDisplays[i].classList.contains("viewing")) {
          itemDisplays[i].classList.remove("viewing");
        }
      }

      //if we're not on the first button,
      if (buttonIndex != 0) {
        //subtract one from the index
        collectedItems[buttonIndex - 1].classList.add("focus");
      } else {
        //otherwise, add to the last button
        collectedItems[lastButton].classList.add("focus")
      }

      //redefine the focused button
      var focusButton = collectedItems.find((element) => element.classList.contains("focus"));

      //and set viewing on the corresponding description
      for (i = 0; i < itemDisplays.length; i++) {
        if (itemDisplays[i].id.replace("-description","") == focusButton.id.replace("Inventory","")) {
          itemDisplays[i].classList.add("viewing");
          break
        }
      }

    }

    if (eventVar.key === 'ArrowRight' || eventVar.key === 'd' || eventVar.target.id == "right-arrow-button") {
      var collected = menu.getElementsByClassName("collected");
      var collectedItems = Array.from(collected);
      var itemDisplays = itemViewer.getElementsByTagName("span");

      //play sounds (stop first to make sure they restart)
      document.getElementById("advance2").pause();
      document.getElementById("advance2").currentTime = 0;

      //play
      document.getElementById("advance2").play();

      //get the focused button
      var focusButton = collectedItems.find((element) => element.classList.contains("focus"));

      //if we don't have one, add it to the first
      if (focusButton == null) {
        collectedItems[0].classList.add("focus");
        focusButton = collectedItems[0];
      }

      //get it's index
      var buttonIndex = collectedItems.indexOf(focusButton);
      //and the last button
      var lastButton = collectedItems.length - 1;

      //remove active from the current button
      focusButton.classList.remove("focus");
      //and remove viewing from em all
      for (i = 0; i < itemDisplays.length; i++) {
        if (itemDisplays[i].classList.contains("viewing")) {
          itemDisplays[i].classList.remove("viewing");
        }
      }

      //if we're not on the last button,
      if (buttonIndex != lastButton) {
        //add one to the index
        collectedItems[buttonIndex + 1].classList.add("focus");
      } else {
        //otherwise, add to the first button
        collectedItems[0].classList.add("focus")
      }

      //redefine the focused button
      var focusButton = collectedItems.find((element) => element.classList.contains("focus"));

      //and set viewing on the corresponding description
      for (i = 0; i < itemDisplays.length; i++) {
        if (itemDisplays[i].id.replace("-description","") == focusButton.id.replace("Inventory","")) {
          itemDisplays[i].classList.add("viewing");
          break
        }
      }

    }

    //and end so we don't move the character
    return
  }

  if (eventVar.key === 'ArrowLeft' || eventVar.key === 'a' || character.classList.contains("left") || eventVar.target.id == "left-arrow-button" || direction == "left") {
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (eventVar.shiftKey || sprintButton.classList.contains("active")) {
      var moveDistance = +fastMoveSpeed
      character.classList.add("sprint");
    }
    //and the direction
    var direction = "left"
    //check for obstacles
    if (document.querySelectorAll(".obstacle") != null) {
      if (obstacleCheck(direction,moveDistance) == false || obstacleCheck(direction,moveDistance) == true && !character.classList.contains("left")) {
        //if no obstacles, then pass to the move function
        moveCharacter(direction,moveDistance);
      }
    }
  }

  if (eventVar.key === 'ArrowRight' || eventVar.key === 'd' || character.classList.contains("right") || eventVar.target.id == "right-arrow-button" ||  direction == "right") {
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (eventVar.shiftKey || sprintButton.classList.contains("active")) {
      var moveDistance = +fastMoveSpeed;
      character.classList.add("sprint");
    }
    //and the direction
    var direction = "right"
    //check for obstacles
    if (document.querySelectorAll(".obstacle") != null) {
      if (obstacleCheck(direction,moveDistance) == false || obstacleCheck(direction,moveDistance) == true && !character.classList.contains("right")) {
        //if no obstacles, or obstacles but moving the other way, then pass to the move function
        moveCharacter(direction,moveDistance)
      }
    }
  }

  if (eventVar.key === 'ArrowUp' || eventVar.key === 'w' ||character.classList.contains("up") || eventVar.target.id == "up-arrow-button" || direction == "up") {
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (eventVar.shiftKey || sprintButton.classList.contains("active")) {
      var moveDistance = +fastMoveSpeed;
      character.classList.add("sprint");
    }
    //and the direction
    var direction = "up"
    //check for obstacles
    if (document.querySelectorAll(".obstacle") != null) {
      if (obstacleCheck(direction,moveDistance) == false || obstacleCheck(direction,moveDistance) == true && !character.classList.contains("up")) {
        //if no obstacles, or obstacles but moving the other way, then pass to the move function
        moveCharacter(direction,moveDistance)
      }
    }
  }

  if (eventVar.key === 'ArrowDown' || eventVar.key === 's' || character.classList.contains("down") || eventVar.target.id == "down-arrow-button" ||  direction == "down") {
    //set move distance, and modify if holding shift to sprint
    var moveDistance = +slowMoveSpeed
    if (eventVar.shiftKey || sprintButton.classList.contains("active")) {
      var moveDistance = +fastMoveSpeed;
      character.classList.add("sprint");
    }
    //and the direction
    var direction = "down"
    //check for obstacles
    if (document.querySelectorAll(".obstacle") != null) {
      if (obstacleCheck(direction,moveDistance) == false || obstacleCheck(direction,moveDistance) == true && !character.classList.contains("down")) {
        //if no obstacles, or obstacles but moving the other way, then pass to the move function
        moveCharacter(direction,moveDistance)
      }
    }
  }

  //set the buttonpressed var to the current event trigger, to recall on mobile
  buttonPressed = eventVar;

  //don't ask me why this needs to have a timeout inside and out but it won't run right otherwise
  setTimeout(() => {
    if (smallMobile == true || appleDevice == true) {
      //if we're on mobile,
      if (mouseDown == 1) {
        //and button is being pressed, fire again 
        setTimeout(() => {
          buttonPress.call();
        }, 32);
      }

      if (mouseDown == 0) {
        //if button isn't being pressed, end 
        setTimeout(() => {
          buttonRelease();
        }, 32);
      }
    }
  }, 32);
}

function buttonRelease() {
  //on mobile, check if we're on a recall, and if so, repeat that event
  if (smallMobile == true || appleDevice == true) {
    if (buttonPressed != "initial") {
      var eventVar = buttonPressed;
    } else {
      eventVar = event;
    }
  } else {
    //and this makes sure it's defined for desktop
    eventVar = event;
  }

  //dynamically set the direction variable based on what you're pressing
  if (eventVar.key === 'ArrowLeft' || eventVar.key === 'a' || eventVar.target.id == "left-arrow-button") {
    direction = "left"
  }

  if (eventVar.key === 'ArrowRight' || eventVar.key === 'd' || eventVar.target.id == "right-arrow-button") {
    direction = "right"
  }

  if (eventVar.key === 'ArrowUp' || eventVar.key === 'w' || eventVar.target.id == "up-arrow-button") {
    direction = "up"
  }

  if (eventVar.key === 'ArrowDown' || eventVar.key === 's' || eventVar.target.id == "down-arrow-button") {
    direction = "down"
  }

  //this makes sure to skip for spacebar & for shift
  if (direction != "initial") {
    //set the movespeed
    moveDistance = slowMoveSpeed
    if(eventVar.shiftKey || sprintButton.classList.contains("active")) {
      moveDistance = fastMoveSpeed
    }
    //stop character
    if (eventVar.key !== 'Shift') {
      stopCharacter(direction);
    }
    //re-check for obstacles
  }

  //this prevents any weird lingering of the move animation (and it's readded immediately if a direction is held)
  if (eventVar.key === 'Shift') {
    moveDistance = slowMoveSpeed
    if(eventVar.shiftKey || sprintButton.classList.contains("active")) {
      moveDistance = fastMoveSpeed
    }
    character.classList.remove("sprint");
  }
  //and for all buttons, reset button pressed for mobile
    buttonPressed = "initial";
}

//check for obstacles
function obstacleCheck(direction,moveDistance) {
  //get classes on game container
  var gameContainerClasses = gameContainer.classList.value.split(' ');
  //shift off the location name

  var characterBounds = character.getBoundingClientRect();

  //check if we're in the church
  if (gameContainer.classList.contains("right-2") && !gameContainer.classList.contains("up-1") && !gameContainer.classList.contains("down-1")) {
    var church = document.getElementsByClassName("churchtop");
    var churchEntrance = document.getElementById("church-entrance");
    var characterBounds = character.getBoundingClientRect();
    var churchBounds = churchEntrance.getBoundingClientRect();

    var overlap = !(churchBounds.right <= characterBounds.left || churchBounds.left >= characterBounds.right ||
                  churchBounds.bottom <= characterBounds.top || churchBounds.top >= characterBounds.bottom);
    //if we have overlap,
    if (overlap === true) {
      //if the character bottom is below the church bottom, and we're moving down
      if (characterBounds.bottom >= churchBounds.bottom && character.classList.contains("down")) {
        for (i = 0; i < church.length; i++) {
          church[i].style.opacity = "1";
        }
      } 
      //if the character bottom is above the church top, and we're moving up
      if (characterBounds.top <= churchBounds.top && character.classList.contains("up")) {
        for (i = 0; i < church.length; i++) {
          church[i].style.opacity = "0";
        }
          
      }
    }
  }

  //check if we're on the forest screen
  if (gameContainer.classList.contains("left-2") && gameContainer.classList.contains("down-1")) {
    //get the interact zone
    var forestEntrance = document.getElementById("forest-entry");

    //check for overlap
    var forestBounds = forestEntrance.getBoundingClientRect();
    var overlap = !(forestBounds.right <= characterBounds.left || forestBounds.left >= characterBounds.right ||
                  forestBounds.bottom <= characterBounds.top || forestBounds.top >= characterBounds.bottom);

    //if there's overlap
      if (overlap === true) {
        var fog = document.querySelectorAll(".fog");

        //if we're going left (entering)
        if (character.classList.contains("left")) {
          //pause and reset the time on the music players
          backgroundPlayer.pause();
          ambiencePlayer.pause();
          backgroundPlayer.currentTime = 0;
          ambiencePlayer.currentTime = 0;

          for (i = 0; i < fog.length; i++) {
            fog[i].style.opacity = "0";
          }

          document.getElementById("clouds").style.opacity = "0";

          leftLocation = "Stripey Hollow";
          screenTitle();

          document.getElementById("health").style.opacity = "1";
          character.style.filter = "brightness(0.8) hue-rotate(-45deg) saturate(1.2)";
          document.body.classList.add("inForest");

          forestPlayer.play();
          forestAmbience.play();
        }
        //if we're going right (leaving)
        if (character.classList.contains("right")) {
          //pause and reset the time on the music players
          forestPlayer.pause();
          forestAmbience.pause();
          forestPlayer.currentTime = 0;
          forestAmbience.currentTime = 0;

          for (i = 0; i < fog.length; i++) {
            fog[i].style.opacity = "";
          }

          document.getElementById("clouds").style.opacity = "0.25";

          leftLocation = "Jensen Acres";
          screenTitle();

          document.getElementById("health").style.opacity = "";
          character.style.filter = "";
          document.body.classList.remove("inForest");

          backgroundPlayer.play();
          ambiencePlayer.play();
        }
      }
  }

  //check if we're overlapping an open tombstone
  var openTombstone = document.querySelector(".active.tombstone div");
  //we use nosebounds here for accuracy
  var noseBounds = nose.getBoundingClientRect();
  //if one exists,
  if (openTombstone != null) {
    var tombBounds = openTombstone.getBoundingClientRect();
    var tombOverlap = !(tombBounds.right <= noseBounds.left || tombBounds.left >= noseBounds.right ||
                      tombBounds.bottom <= noseBounds.top || tombBounds.top >= noseBounds.bottom);
    //and we're not overlapping it,
    if (tombOverlap === false) {
      //close it
      openTombstone.parentElement.classList.remove("active");
    }
  }

  //check for ground items
  var groundItem = document.querySelectorAll(".ground");
    for (i = 0; i < groundItem.length; i++) {
        var groundItemBounds = groundItem[i].getBoundingClientRect();

        var overlap = !(groundItemBounds.right <= characterBounds.left || groundItemBounds.left >= characterBounds.right ||
                          groundItemBounds.bottom <= characterBounds.top || groundItemBounds.top >= characterBounds.bottom);

        //define needed players
        var leafPlayer = document.getElementById("leaves");

        //if there's overlap, we're not pressing shift to target this, and our bottom is higher than the object bottom
        if (overlap === true && eventVar.key != 'Shift' && characterBounds.bottom <= groundItemBounds.bottom) {
          //for leaves

          //if we're running, normal speed; double speed for walking (since the steps are faster)
          if (groundItem[i].classList.contains("leaves")) {
            if (character.classList.contains("sprint")) {
              leafPlayer.playbackRate = 1;
            } else {
              leafPlayer.playbackRate = 1.5;
            }

            leafPlayer.play();
            leafPlayer.classList.add("leaves-" + i, "playing");
            setTimeout(() => {
              leafPlayer.classList.remove("playing");
            }, 32);
          }
        } 

        //if there's no overlap, a leaf player is playing, and we didn't just come from one, pause all the ground sfx players (for leaves)
        if (overlap === false && leafPlayer.classList.contains("leaves-" + i) && !leafPlayer.classList.contains("playing")) {
          leafPlayer.pause();
          //and reset the leaves
          leafPlayer.classList = "sound-effect ground-sound";
        }
  }

  //check for obstacles
  for (i = 0; i < obstacle.length; i++) {
    var gameClasses = gameContainer.classList.value.split(' ');
    var obstacleClasses = obstacle[i].classList.value.split(' ');

    //only do all this shit if it's not in a fog box (decorative) and if it has the game container's classes (visible)
    //this could be further refined -- down-1 for example checks ALL obstacles on *any* down 1 screen (only relevant for single directions)
    //could add a "single" class to those pages? idk
    if (!obstacle[i].parentElement.classList.contains("fog") && gameClasses.every(r=> obstacleClasses.includes(r))) {

      var gameClasses = gameContainer.classList.value.split(' ');
      var obstacleClasses = obstacle[i].classList.value.split(' ');

      //for general obstacles
      if (!obstacle[i].classList.contains("fence")) {
        var obstacleBounds = obstacle[i].getBoundingClientRect();
        var overlap = !(obstacleBounds.right <= characterBounds.left || obstacleBounds.left >= characterBounds.right ||
                      obstacleBounds.bottom <= characterBounds.top || obstacleBounds.top >= characterBounds.bottom);

        //if there's overlap
        if (overlap === true) {
          //check where the overlap is [overlap || character || object]
          var overlapLeftRight = characterBounds.left <= obstacleBounds.right;
          var overlapRightLeft = characterBounds.right >= obstacleBounds.left;
          var overlapTopBottom = characterBounds.top <= obstacleBounds.bottom;
          var overlapBottomTop = characterBounds.bottom >= obstacleBounds.top;
          
          //check if we're AT GNASH
          if (obstacle[i].id == "Gnash") {
            gnash = true;
            return true;
          }

          if (overlapLeftRight == true && character.classList.contains("left")) {
            if (smallMobile == false && appleDevice == false) {
              character.classList.add("blocked");
            }
            return true;
          }

          if (overlapRightLeft == true && character.classList.contains("right")) {
            if (smallMobile == false && appleDevice == false) {
              character.classList.add("blocked");
            }
            return true;
          }

          if (overlapTopBottom == true && character.classList.contains("up")) {
            if (smallMobile == false && appleDevice == false) {
              character.classList.add("blocked");
            }
            return true;
          }

          if (overlapBottomTop == true && character.classList.contains("down")) {
            if (smallMobile == false && appleDevice == false) {
              character.classList.add("blocked");
            }
            return true;
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
          var overlapTopBottom = characterBounds.top <= obstacleBounds.bottom
          var overlapBottomTop = characterBounds.bottom >= obstacleBounds.top

          //we will allow to move up unless the character bottom is higher than the obstacle bottom
          var behind = (parseInt(obstacle[i].style.zIndex)) > parseInt(character.style.zIndex);
          var inFront = (parseInt(obstacle[i].style.zIndex)) < parseInt(character.style.zIndex);

          if (overlapBottomTop == true && character.classList.contains("down") && behind == true) {
            if (smallMobile == false && appleDevice == false) {
              character.classList.add("blocked");
            }
            return true;
          }

          if (overlapTopBottom == true && character.classList.contains("up")) {
            //if character top overlaps object bottom,
            var overlapBottomBottom = characterBounds.bottom <= obstacleBounds.bottom
            //see if the bottom is also higher, and if we're in front
            if (overlapBottomBottom == true && inFront === true) {
              //if it is, increase top to push it down
              if (smallMobile == false && appleDevice == false) {
                character.classList.add("blocked");
              }
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

//check for interactable object (NPC, Item) 
function interactCheck() {
  var npc = document.querySelectorAll(".npc");
  var objective = document.querySelectorAll(".objective");
  var tombstone = document.querySelectorAll(".tombstone div");
  var characterBounds = character.getBoundingClientRect();

  //we use nosebounds here for accuracy (this is a smaller hitbox on the front end of the character)
  var noseBounds = nose.getBoundingClientRect();

  //for NPCs
  for (i = 0; i < npc.length; i++) {
    var npcBounds = npc[i].getBoundingClientRect();

    //check all objectives for intersection
    var overlap = !(npcBounds.right <= noseBounds.left || npcBounds.left >= noseBounds.right ||
                  npcBounds.bottom <= noseBounds.top || npcBounds.top >= noseBounds.bottom);

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
    var overlap = !(objectiveBounds.right <= noseBounds.left || objectiveBounds.left >= noseBounds.right ||
                  objectiveBounds.bottom <= noseBounds.top || objectiveBounds.top >= noseBounds.bottom);

    if (overlap === true && !objective[i].classList.contains("collected")) {
      //if player is touching one (and it hasn't been found), return which one
      var foundItem = objective[i];
      //add the option to the dialogue loader, for later
      document.getElementById("dialogue-loader").classList.add("option-" + objective[i].id.toLowerCase());
      return foundItem
    }
  }

  //to read the tombstones
  for (i = 0; i < tombstone.length; i++) {
    var tombstoneBounds = tombstone[i].getBoundingClientRect();

    //check all objectives for intersection
    var overlap = !(tombstoneBounds.right <= noseBounds.left || tombstoneBounds.left >= noseBounds.right ||
                  tombstoneBounds.bottom <= noseBounds.top || tombstoneBounds.top >= noseBounds.bottom);

    if (overlap === true) {
      //if player is touching one (and it hasn't been found), return which one
      var tombstoneCurrent = tombstone[i];
      //^we need this for later due to the timeout

      if (tombstone[i].parentElement.classList.contains("active") && !tombstone[i].classList.contains("clicked")) {
          tombstone[i].parentElement.classList.remove("active");
      } else {
          tombstone[i].parentElement.classList.add("active");
          tombstone[i].parentElement.classList.add("clicked");
          setTimeout(() => {
            //we need this clicked class + timeout to prevent weird double taps on mobile
            tombstoneCurrent.parentElement.classList.remove("clicked");
        }, 100);
      }
    }
  }
  //otherwise, button does nothing
}

//move left
function moveCharacter(direction,moveDistance) {
    //get the element's left position
    var leftPosition = parseInt(character.style.left);

    if (character.classList.contains("blocked")) {
      return;
    }

    if (direction == "left") {
      //only move if there's room to move
      if (leftPosition > 0) {
        setTimeout(() => {
          //if we're on a diagonal, half the move distance since it'll be applied twice
          if (character.classList.contains("up") || character.classList.contains("down")) {
            //idk why this is the math we need but it is
            if (character.classList.contains("sprint")) {
              moveDistance = parseInt(moveDistance)/parseInt("2")+parseInt("4");
            } else {
              moveDistance = parseInt(moveDistance)/parseInt("2")+parseInt("2");
            }
          }
          //subtract a value from it to set it right
          character.style.left = leftPosition - moveDistance + "px";
        }, moveDelay);
      } else {
        //fire move screen event
        moveScreen("left");
        setTimeout(() => {
          document.body.classList.remove("just-moved");
        }, 1000);
      }

      //indicate the character is moving and going left
      character.classList.add("moving","left","face-left");
      character.classList.remove("right","stopped","face-right","face-up","face-down");
    }

    if (direction == "right") {
      //only move if there's room to move
      if (leftPosition < gameWidth) {
        //if we're on a diagonal, half the move distance since it'll be applied twice
        if (character.classList.contains("up") || character.classList.contains("down")) {
          //idk why this is the math we need but it is
          if (character.classList.contains("sprint")) {
            moveDistance = parseInt(moveDistance)/parseInt("2")+parseInt("4");
          } else {
            moveDistance = parseInt(moveDistance)/parseInt("2")+parseInt("2");
          }
        }
        //add a value to it, and pixels to set it right
        setTimeout(() => {
          character.style.left = leftPosition + moveDistance + "px";
        }, moveDelay);
      } else {
        //fire move screen event
        moveScreen("right");
        setTimeout(() => {
          document.body.classList.remove("just-moved");
        }, 1000);
      }

      //indicate the character is moving and going right
      character.classList.add("moving","right","face-right");
      character.classList.remove("left","stopped","face-left","face-up","face-down");
    }

    if (direction == "up") {
      //get the element's top position
      var topPosition = parseInt(character.style.top);

      //only move if there's room to move
      if (topPosition > 0) {
        setTimeout(() => {
          //if we're on a diagonal, half the move distance since it'll be applied twice
          if (character.classList.contains("left") || character.classList.contains("right")) {
            //idk why this is the math we need but it is
            if (character.classList.contains("sprint")) {
              moveDistance = parseInt(moveDistance)/parseInt("2")+parseInt("4");
            } else {
              moveDistance = parseInt(moveDistance)/parseInt("2")+parseInt("2");
            }
          }
          //subtract a value from it, and pixels to push it up
          character.style.top = topPosition - moveDistance + "px";
        }, moveDelay);
      } else {
        //fire move screen event
        moveScreen("up");
        setTimeout(() => {
          document.body.classList.remove("just-moved");
        }, 1000);
      }

      //indicate the character is moving and going up
      character.classList.add("moving","up","face-up");
      character.classList.remove("down","stopped","face-down");
    }

    if (direction == "down") {
      //move down
      //get the element's top position
      var topPosition = parseInt(character.style.top);

      //only move if there's room to move
      if (topPosition < gameHeight) {
        setTimeout(() => {
          //if we're on a diagonal, half the move distance since it'll be applied twice
          if (character.classList.contains("left") || character.classList.contains("right")) {
          //idk why this is the math we need but it is
          if (character.classList.contains("sprint")) {
            moveDistance = parseInt(moveDistance)/parseInt("2")+parseInt("4");
          } else {
            moveDistance = parseInt(moveDistance)/parseInt("2")+parseInt("2");
          }
        }
        //add a value to it, and pixels to push it down
        character.style.top = topPosition + moveDistance + "px";
      }, moveDelay);
    } else {
      //fire move screen event
      moveScreen("down");
      setTimeout(() => {
      document.body.classList.remove("just-moved");
      }, 1000);
    }

    //indicate the character is moving and going down
    character.classList.add("moving","down","face-down");
    character.classList.remove("up","stopped","face-up");
  }

  //check if we're running or walking, play sfx
  if (character.classList.contains("sprint")) {
    //pause walk, start playing lope sfx
    document.getElementById("walk-player").pause();
    document.getElementById("lope-player").play();
  } else {
    //pause lope, start playing walk sfx
    document.getElementById("lope-player").pause();
    document.getElementById("walk-player").play();
  }

  //and when we move we check zindex
  zIndexSortCharacter();
}

//Stop moving 
function stopCharacter() {
  setTimeout(() => {
    character.classList.remove("moving");
    if (character.classList.contains("sprint")){
      character.classList.remove("sprint");
    }
    
    //pause walk sound effects
    document.getElementById("walk-player").pause();
    document.getElementById("lope-player").pause();
    //and ground sound effects
    setTimeout(() => {
      var groundPlayers = document.querySelectorAll(".ground-sound");
      for (i = 0; i < groundPlayers.length; i++) {
        groundPlayers[i].pause();
      }
    }, 150);

    //unlike obstacleCheck, this actually remedies any overlap
    obstacleCorrect();

    //allow movement again
    if (character.classList.contains("fixed")) {
      if (character.classList.contains("left")) {
        character.style.left = parseInt(character.style.left.replace("px","")) - parseInt(slowMoveSpeed) + "px";
      }
      if (character.classList.contains("right")) {
        character.style.left = parseInt(character.style.left.replace("px","")) - parseInt(slowMoveSpeed) + "px";
      }
      if (character.classList.contains("up")) {
        character.style.top = parseInt(character.style.top.replace("px","")) + parseInt(slowMoveSpeed) + "px";
      }
      if (character.classList.contains("down")) { 
        character.style.top = parseInt(character.style.top.replace("px","")) - parseInt(slowMoveSpeed) + "px";
      }

      character.classList.remove("fixed");
    }
    character.classList.remove("blocked");
    //and indicate stopped
    character.classList.add("stopped");
  }, 100);
}

//Secondary Obstacle Check 
function obstacleCorrect() {
  //after we stop moving, we do a final obstacle check where we correct any issues
    //check which way we're facing
    if (character.classList.contains("left")) { var facing = "left"; }
    if (character.classList.contains("right")) { var facing = "right"; }
    if (character.classList.contains("up")) { var facing = "up"; }
    if (character.classList.contains("down")) { var facing = "down"; }

    var diagonal = (character.classList.contains("down") && character.classList.contains("right") || character.classList.contains("down") && character.classList.contains("left") || character.classList.contains("up") && character.classList.contains("right") || character.classList.contains("up") && character.classList.contains("right"));    

    var moveDistance = +slowMoveSpeed
    if (character.classList.contains("sprint") || sprintButton.classList.contains("active")) {
      var moveDistance = +fastMoveSpeed;
    }

    for (i = 0; i < obstacle.length; i++) {
      var obstacleBounds = obstacle[i].getBoundingClientRect();
      var characterBounds = character.getBoundingClientRect();
      var overlap = !(obstacleBounds.right < characterBounds.left || obstacleBounds.left > characterBounds.right ||
                      obstacleBounds.bottom < characterBounds.top || obstacleBounds.top > characterBounds.bottom);

      if (overlap == true) {
        //check where the overlap is [overlap || character || object]
        var overlapLeftRight = characterBounds.left < obstacleBounds.right;
        var overlapRightLeft = characterBounds.right > obstacleBounds.left;
        var overlapTopBottom = characterBounds.top < obstacleBounds.bottom;
        var overlapBottomTop = characterBounds.bottom > obstacleBounds.top;

        //for general obstacles
        if (!obstacle[i].classList.contains("fence")) {
          if (facing == "left" && overlapLeftRight == true) {
            //first, we see how wide the obstacle is -- we move back movedistance if it's more than double the move distance
            if (obstacleBounds.width > (moveDistance*4) || diagonal == true) {
              character.style.left = parseInt(character.style.left.replace("px","")) + parseInt(moveDistance*2) + "px";
              character.classList.add("fixed");
            } else {
              character.style.left = parseInt(obstacle[i].style.left) + parseInt(obstacleBounds.width) + parseInt(moveDistance) + "px";
            }
          }

          if (facing == "right" && overlapRightLeft == true) {
            //first, we see how wide the obstacle is -- we move back movedistance if it's more than double the move distance
            if (obstacleBounds.width > (moveDistance*4) || diagonal == true) {
              character.style.left = parseInt(character.style.left.replace("px","")) - parseInt(moveDistance*2) + "px";
              character.classList.add("fixed");
            } else {
              character.style.left = parseInt(obstacle[i].style.left) - parseInt(characterBounds.width) - parseInt(moveDistance) + "px";
            }
          }

          if (facing == "up" && overlapTopBottom == true) {
            //first, we see how tall the obstacle is -- we move back movedistance if it's more than double the move distance
            if (obstacleBounds.height > (moveDistance*4) || diagonal == true) {
              character.style.top = parseInt(character.style.top.replace("px","")) + parseInt(moveDistance*2) + "px";
              character.classList.add("fixed");
            } else {
              character.style.top = parseInt(obstacle[i].style.top) + parseInt(obstacleBounds.height) + parseInt(moveDistance) + "px";
            }
          }

          if (facing == "down" && overlapBottomTop == true) {
            //first, we see how tall the obstacle is -- we move back movedistance if it's more than double the move distance
            if (obstacleBounds.height > (moveDistance*4) || diagonal == true) {
              character.style.top = parseInt(character.style.top.replace("px","")) - parseInt(moveDistance*2) + "px";
              character.classList.add("fixed");
            } else {
              character.style.top = parseInt(obstacle[i].style.top) - parseInt(moveDistance) - parseInt(characterBounds.height) + "px";
            }
          }
        }

        //for fences
        if (obstacle[i].classList.contains("fence")) {
          var behind = (parseInt(obstacle[i].style.zIndex)) > parseInt(character.style.zIndex);
          var inFront = (parseInt(obstacle[i].style.zIndex)) < parseInt(character.style.zIndex);

          if (overlapBottomTop == true && character.classList.contains("down") && behind == true) {
            //if character bottom overlaps object top, decrease top to push it up
            character.style.top = parseInt(obstacle[i].style.top) - parseInt(moveDistance*2) + "px";
          }

          if (overlapTopBottom == true && character.classList.contains("up")) {
            //if character top overlaps object bottom,
            var overlapBottomBottom = characterBounds.bottom <= obstacleBounds.bottom
            //see if the bottom is also higher, and if we're in front
            if (overlapBottomBottom == true && inFront === true) {
              //if it is, increase top to push it down
              character.style.top = parseInt(obstacle[i].style.top) + parseInt(obstacleBounds.height) - parseInt(moveDistance*2) + "px";
            }
          }
        }
      }
    }

    zIndexSortCharacter()
}

//Move screen
function moveScreen(direction) {
  if (document.body.classList.contains("just-moved")) {
    //if we just moved, bail to prevent jumping
    return;
  }
  var newPosition
  //define the variables based on move direction
  if(direction == "left") {
    newPosition = gameWidth + "px";
  }

  if(direction == "up") {
    newPosition = gameHeight + "px";
  }

  if(direction == "right" || direction == "down") {
    newPosition = "0";
  }

  document.body.classList.add("just-moved");

  //jump character to the right spot on the new screen
  character.style.transition = "0ms ease all";
  character.style.opacity = "0";
  setTimeout(() => {
    if(direction == "right" || direction == "left") {
      character.style.left = newPosition;
    }
    if(direction == "up" || direction == "down") {
      character.style.top = newPosition;
    }

    if (direction == "down") {
      character.style.zIndex = "2";
    }

    if (direction == "up") {
      character.style.zIndex = "gameHeight";
    }

    setTimeout(() => {
      character.style.opacity = "";
      character.style.transition = "";
    }, 32);
  }, 32);

  setTimeout(() => {
    //idk why we need this but we seem to need this
    moveScreen2(direction,newPosition);
  }, moveDelay);

  //this generates the screen title (delay to be sure that the classes are all updated before generating)
  setTimeout(() => {
    screenTitle();
    duckCheck();
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

//move screen but MORE you FUCKING CUNT
  function moveScreen2(direction,newPosition) {
    //jump character to the right spot on the new screen (passed our variables from the initial function)
    character.style.transition = "0ms ease all";
    setTimeout(() => {
      if(direction == "right" || direction == "left") {
        character.style.left = newPosition;
      }
      if(direction == "up" || direction == "down") {
       character.style.top = newPosition;
      }
      setTimeout(() => {
        character.style.transition = "";
      }, 32);
    }, 32);
  }

///////////////////////NPCs

function soundEffectManage() {
  //for the crow
  var crow = document.getElementById("Crow")
  var crowPlayer = document.getElementById("crow-player");

  //if we're on one of the right screens,
  if (gameContainer.classList.contains("right-1") || gameContainer.classList.contains("right-2") || gameContainer.classList.contains("right-3") && !crow.classList.contains("repeat")) {
    //set interval (only if it's undefined, it stacks otherwise for some reason)
    if (crowInterval == undefined) {
      crowInterval = setInterval(crowCall, 6000);
    }

    //first, set the volume based on distance from the crow
    setTimeout(() => {
      if (gameContainer.classList.contains("right-3") && !gameContainer.classList.contains("up-1") || !gameContainer.classList.contains("down-1")) {
        crowPlayer.volume = "1"
      }

      if (gameContainer.classList.contains("right-3") && gameContainer.classList.contains("up-1") || gameContainer.classList.contains("down-1")) {
        crowPlayer.volume = "0.5"
      }

      if (gameContainer.classList.contains("right-2") && !gameContainer.classList.contains("up-1") || !gameContainer.classList.contains("down-1")) {
        crowPlayer.volume = "0.5"
      }

      if (gameContainer.classList.contains("right-2") && gameContainer.classList.contains("up-1") || gameContainer.classList.contains("down-1")) {
        crowPlayer.volume = "0.3"
      }

      if (gameContainer.classList.contains("right-1")) {
        crowPlayer.volume = "0.1"
      }
    }, 32);
  } else {
    clearInterval(crowInterval);
  }

}

//if the crow isn't calling, call
function crowCall() {
  var crow = document.getElementById("Crow")
  var crowPlayer = document.getElementById("crow-player");

  if (crow.classList.contains("repeat") || crow.classList.contains("last-line")) {
    clearInterval(crowInterval);
    return
  }

  //add call, play the sound
  crow.classList.add("call");
  crowPlayer.play();
  //and then remove after the sound should be done
  setTimeout(() => {
      crow.classList.remove("call");
  }, 2000);
}

function gnashAnimation() {
  var gnash = document.getElementById("GnashPix");
  //make sure it's the default (walk) showing
  document.getElementById("GnashPix").style.backgroundImage = "";
  //move gnash to the left
  gnash.style.transition = "0ms all"
  gnash.style.top = character.style.top;
  gnash.style.transition = ""
  gnash.style.left = "304px";
}

function gnashInteraction() {
  var dialoguePopUp = document.querySelector(".dialogue-popup");
  var dialogueLoader = document.getElementById("dialogue-loader");
  var GnashBox = document.getElementById("Gnash-talking");

  //get the pressed button [if there are buttons]
  if (currentOption == "initial") {
    currentOption = document.querySelector("button.active").id;
  }

  //go through the dialogue list, and find the content
  var gnashDialogue = getGnashDialogue().toString();

  function getGnashDialogue() {
    //iterate through the list to find a name match,
    for (i = 0; i < gnashDialogueOptions.length; i++) {
        if (currentOption == gnashDialogueOptions[i].option) {
          //then grab their dialogue
           return gnashDialogueOptions[i].dialogue;
        }
      }
    }

    //split dialogue at the hearts (♡) [this allows us to break up our lines nicely,
    var words = gnashDialogue.split('♡');

    //if there's expressions, shift one off
    if (expressions != "") {
      expressions.shift();
    }

    if (currentOption == "option-daisy" && expressions != "") {
      document.body.classList.add("success");
    }

    //if we don't have an option selected, do that + grab expressions
    if (!dialoguePopUp.classList.contains("option-selected")) {
      //we separate those out (odd numbers expressions, even is text),
      var words = gnashDialogue.split('♡').filter((e, i) =>  i % 2 != 0);
      //and add "talking now" so we don't do it again
      expressions = gnashDialogue.split('♡').filter((e, i) =>  i % 2 == 0);
      //and we add option selected to prevent this happening again
      dialoguePopUp.classList.add("option-selected");

      if (currentOption == "option-daisy") {
        musicBox.play();
        fadeOut(forestAmbience);
      }

      //on option 7, check for and delete extrenuous buttons (to make arrow toggles smooth)
        if (currentOption == "option-7") {
          //delay to be sure they're in already
          setTimeout(() => {
            for (i = 0; i < dialogueLoader.classList.length; i++) {
              if (dialogueLoader.classList[i] == "option-drawing") {document.getElementById("option-drawing").classList.add("item-found");}
              if (dialogueLoader.classList[i] == "option-daisy") {document.getElementById("option-daisy").classList.add("item-found");}
              if (dialogueLoader.classList[i] == "option-hair") {document.getElementById("option-hair").classList.add("item-found");}
              if (dialogueLoader.classList[i] == "option-feather") {document.getElementById("option-feather").classList.add("item-found");}
              if (dialogueLoader.classList[i] == "option-clover") {document.getElementById("option-clover").classList.add("item-found");}
              if (dialogueLoader.classList[i] == "option-bone") {document.getElementById("option-bone").classList.add("item-found");}
            }

            var currentButtons = dialogueLoader.querySelectorAll("button");

            for (i = 0; i < currentButtons.length; i++) {
              if (!currentButtons[i].classList.contains("item-found")) {
                currentButtons[i].remove();
              }
            }

            var currentButtons = dialogueLoader.querySelectorAll("button");

            //any buttons added after this points must have a manual active added
            if (currentButtons.length == 0) {
              dialogueLoader.innerHTML = "[You don't have any items...] <div class='flex-row'><button id='gnash-close' class='active'>[Run!!]</button></div>";
              //this resets our dialogue box and allows it to close
              gnash = false;
              inDialogue = false;
              talked = false;
              gnashOptions = false;
              expressions = "";
              currentOption = "initial"

              //reset Gnash's classlist
              document.getElementById("Gnash").classList = "npc obstacle Oddly-Shaded-Woods up-1 left-3";

              //and his position
              document.getElementById("GnashPix").style.transition = "0ms ease all";
              document.getElementById("GnashPix").style.left = "-195px";
              setTimeout(() => {
                document.getElementById("GnashPix").style.transition = "";
              }, 32);

              //replace Gnash's initial dialogue, before branching back to his specific tree
              for (i = 0; i < npcList.length; i++) {
                if ("Gnash" == npcList[i].name) {
                  //new dialogue for conversation 2
                  npcList[i].dialogue = "empty♡...♡empty♡...You're back.♡empty♡<div class='flex-row'><button class='active' id='option-6'>I have something for you...</button></div>"
                }

                //and update Cain & Vatra's dialogue options
                if ("CainVatra" == npcList[i].name) {
                  //new dialogue for conversation 2
                  npcList[i].dialogue = "caintalking♡Were you just IN THE FOREST?!"
                  npcList[i].repeatLine = "<span><i>Holy horselfies</i>, you're not dead?? You're not going in AGAIN are you!?</span>"
                }
              }

              //NEW DIALOGUE
              gnashDialogueOptions = [
                { option: "option-6", dialogue: "empty♡...<div class='flex-row'><button id='option-7'>[Give him something]</button></div>"},
                { option: "option-7", dialogue: "null♡<div class='flex-row' style='margin-top: -20px;'><button class='drawing-button' id='option-drawing'><img src='objectives/drawing.png'></button><button id='option-hair' class='hair-button'><img src='objectives/hair.png'></button><button id='option-daisy' class='daisy-button'><img src='objectives/daisy.png'></button><button id='option-bone' class='bone-button'><img src='objectives/bone.png' class='bone-button'></button><button id='option-daisy' class='daisy-button'><img src='objectives/daisy.png'></button></div>"},
                { option: "option-drawing", dialogue: "null♡Is this... me?♡null♡Then...♡null♡I am... not like you.<div class='flex-row'><button id='option-7'>[Give him something else]</button></div>"},
                { option: "option-hair", dialogue: "null♡Oh. My hair.♡null♡I do not... need this.<div class='flex-row'><button id='option-7'>[Give him something else]</button></div>"},
                { option: "option-bone", dialogue: "null♡Oh -♡null♡My gnawing bone.♡null♡I... misplaced it.<div class='flex-row'><button id='option-7'>[Give him something else]</button></div>"},
                { option: "option-feather", dialogue: "empty♡...♡empty♡Are you... with... these creatures... <div class='flex-row'><button id='option-feather-a'>Yes</button><button id='option-feather-b'>No</button></div>"},
                { option: "option-feather-a", dialogue: "empty♡...You should leave. Now. <div class='flex-row'><button id='option-feather-close' class='active'>Okay-!</button></div>"},
                { option: "option-feather-b", dialogue: "empty♡...That is good. <div class='flex-row'><button id='option-7'>[Give him something else]</button></div>"},
              ];

              document.body.classList.add("reset");
  
            }
          }, 200);
        }

      //for the feather option, reset but IDK it needs to be fucking separate
        if (currentOption == "option-feather-a") {
          //okay this has to be done from scratch fucking kill me right now
          setTimeout(() => {
              //this resets our dialogue box and allows it to close
              gnash = false;
              inDialogue = false;
              talked = false;
              gnashOptions = false;
              expressions = "";
              currentOption = "initial"

              //reset Gnash's classlist
              document.getElementById("Gnash").classList = "npc obstacle Oddly-Shaded-Woods up-1 left-3";

              //and his position
              document.getElementById("GnashPix").style.transition = "0ms ease all";
              document.getElementById("GnashPix").style.left = "-195px";
              setTimeout(() => {
                document.getElementById("GnashPix").style.transition = "";
              }, 32);

              //replace Gnash's initial dialogue, before branching back to his specific tree
              for (i = 0; i < npcList.length; i++) {
                if ("Gnash" == npcList[i].name) {
                  //new dialogue for conversation 2
                  npcList[i].dialogue = "empty♡...♡empty♡...You're back.♡empty♡<div class='flex-row'><button class='active' id='option-6'>I have something for you...</button></div>"
                }

                //and update Cain & Vatra's dialogue options
                if ("CainVatra" == npcList[i].name) {
                  //new dialogue for conversation 2
                  npcList[i].dialogue = "caintalking♡Were you just IN THE FOREST?!"
                  npcList[i].repeatLine = "<span><i>Holy horselfies</i>, you're not dead?? You're not going in AGAIN are you!?</span>"
                }
              }

              //NEW DIALOGUE
              gnashDialogueOptions = [
                { option: "option-6", dialogue: "empty♡...<div class='flex-row'><button id='option-7'>[Give him something]</button></div>"},
                { option: "option-7", dialogue: "null♡<div class='flex-row' style='margin-top: -20px;'><button class='drawing-button' id='option-drawing'><img src='objectives/drawing.png'></button><button id='option-hair' class='hair-button'><img src='objectives/hair.png'></button><button id='option-daisy' class='daisy-button'><img src='objectives/daisy.png'></button><button id='option-bone' class='bone-button'><img src='objectives/bone.png' class='bone-button'></button><button id='option-daisy' class='daisy-button'><img src='objectives/daisy.png'></button></div>"},
                { option: "option-drawing", dialogue: "null♡Is this... me?♡null♡Then...♡null♡I am... not like you.<div class='flex-row'><button id='option-7'>[Give him something else]</button></div>"},
                { option: "option-hair", dialogue: "null♡Oh. My hair.♡null♡I do not... need this.<div class='flex-row'><button id='option-7'>[Give him something else]</button></div>"},
                { option: "option-bone", dialogue: "null♡Oh -♡null♡My gnawing bone.♡null♡I... misplaced it.<div class='flex-row'><button id='option-7'>[Give him something else]</button></div>"},
                { option: "option-feather", dialogue: "empty♡...♡empty♡Are you... with... these creatures... <div class='flex-row'><button id='option-feather-a'>Yes</button><button id='option-feather-b'>No</button></div>"},
                { option: "option-feather-a", dialogue: "empty♡...You should leave. Now. <div class='flex-row'><button id='option-feather-close' class='active'>Okay-!</button></div>"},
                { option: "option-feather-b", dialogue: "empty♡...That is good. <div class='flex-row'><button id='option-7'>[Give him something else]</button></div>"},
              ];

              document.body.classList.add("reset");
          }, 200);
        }

      //this is used to delete items you've already given away
      if (currentOption == "option-drawing" || currentOption == "option-daisy" || currentOption == "option-hair" || currentOption == "option-feather" || currentOption == "option-clover" || currentOption == "option-bone") {
        //hide this button for future loops
        dialogueLoader.classList.remove(currentOption);

        //and we need to get rid of it in the inventory too
        var inventoryVersion = document.getElementById(currentOption.replace("option-","").charAt(0).toUpperCase() + currentOption.replace("option-","").slice(1) + "Inventory");
        inventoryVersion.classList.add("given");

        //and note we gave it away in its description
        var inventoryDescription = document.getElementById(currentOption.replace("option-","").charAt(0).toUpperCase() + currentOption.replace("option-","").slice(1) + "-description");
        inventoryDescription.querySelector(".description").innerHTML += " Given to the creature in the forest.";
        
      }
    }

    //set the viewable image with the proper SRC (this must be after things are split to make sure it includes the first expression)
      var interactDisplay = document.getElementById("interact-display");
      if (expressions[0] != "null") {
        //get the correct sprite + expression
        interactDisplay.src = "objectives/" + "gnash" + expressions[0].toLowerCase() + ".png";
      } else {
        //otherwise, just do it without the expression
        interactDisplay.src = "objectives/" + "gnash" + ".png";
      }

      //get the first dialogue chunk, put it in the textbox
      dialogueSplit();
      function dialogueSplit() {
        var dialogueChunk = words.slice(0,1);
        //and clean it up (remove excess commas and put desired ones back in)
        dialogueLoader.innerHTML = dialogueChunk.toString().replaceAll(",", " ").replaceAll("  ", ", ");
        
        words.shift(); 

        //if there's words left after the splice
        if (words.length != 0) {
          //set the global dialogue var to the new remaining text
          for (i = 0; i < gnashDialogueOptions.length; i++) {
            if (currentOption == gnashDialogueOptions[i].option) {
              //and mash the dialogue back together
              gnashDialogueOptions[i].dialogue = words.join("♡");
            }
          }
        } else {
          //otherwise, clear the option-selected class, and set currentOption to initial to re-run the option select code
          dialoguePopUp.classList.remove("option-selected");
          currentOption = "initial"
        }
      }

      //this adds active to the first button
      var speechBubble = document.getElementById("speech-bubble");
      //if there are buttons,
      if (speechBubble.querySelector("button") != null) {
        var buttons = speechBubble.querySelectorAll("button");
        for (i = 0; i < buttons.length; i++) {
          //and if a button is visible,
          if (buttons[i].checkVisibility() == true) {
            //pause transitions
            buttons[i].style.transition = "0ms all";
            //make it active
            buttons[i].classList.add("active");
            //and cut the loop so we just have one active one
            break;
          }
        }

        setTimeout(() => {
          for (i = 0; i < buttons.length; i++) {
            //and then make sure to reset transitions
            buttons[i].style.transition = "";
          }
        }, 32);
      }
}

function reset() {
  //move character back to the forest entrance
  gameContainer.classList.remove("left-3","up-1");
  gameContainer.classList.add("left-2","down-1");

  //reposition at the gate
  character.style.left = "420px";
  character.style.top = "244px";
  character.style.zIndex = "244";
  //turn around
  character.classList.remove("left","face-left");
  character.classList.add("face-right");

  //fix the title
  document.getElementById("screen-display").innerHTML = "Oddly Shaded Woods - down 1, left 2";

  //and rerun the forest exit code
  //pause and reset the time on the music players
  forestPlayer.pause();
  forestAmbience.pause();
  forestPlayer.currentTime = 0;
  forestAmbience.currentTime = 0;

  var fog = document.querySelectorAll(".fog");
  for (i = 0; i < fog.length; i++) {
    fog[i].style.opacity = "";
  }

  document.getElementById("health").style.opacity = "";
  character.style.filter = "";
  document.body.classList.remove("inForest");
  document.getElementById("clouds").style.opacity = "0.25";

  //we only wanna play these when we're not on a success
  if (!document.body.classList.contains("success")) {
    backgroundPlayer.play();
    ambiencePlayer.play(); 
  } else {
    //play any outro music I wanna add
  }

  //aaaand remove reset from the body
  document.body.classList.remove("reset");
}

///////////////////////

//character specific z-index sort to double check once we finish moving
function zIndexSortCharacter() {
  //only do it if it's above 0 jfc
  if (character.style.top.replace("px","") > "0") {
    character.style.zIndex = character.style.top.replace("px","");
  }
}

function fadeOut(audioElement) {
  var fadeInterval = setInterval(function() {
    // Check if the volume is already at 0
    if (audioElement.volume <= 0.01) {
      clearInterval(fadeInterval);
      audioElement.volume = 0; // Ensure volume is exactly 0
      audioElement.pause();
      audioElement.currentTime = 0;
    } else {
      // Decrease the volume
      audioElement.volume -= 0.01;
    }
  }, 10); // Adjust the interval in milliseconds (e.g., 200ms)
}

function endcardToggle() {
    var endcard = document.getElementById("endcard");
    var buttonList = endcard.getElementsByTagName("button");
    var buttons = Array.from(buttonList);

    //on mobile, check if we're on a recall, and if so, repeat that event
    if (smallMobile == true || appleDevice == true) {
      if (buttonPressed != "initial") {
        eventVar = buttonPressed;
      } else {
        eventVar = event;
      }
    } else {
      //and this makes sure it's defined for desktop
      eventVar = event;
    }

    if (eventVar.key === 'ArrowLeft' || eventVar.key === 'a' || eventVar.target.id == "left-arrow-button") {
      //play sounds (stop first to make sure they restart)
      document.getElementById("advance2").pause();
      document.getElementById("advance2").currentTime = 0;

      //play
      document.getElementById("advance2").play();

      //get the focused button
      var focusButton = buttons.find((element) => element.classList.contains("focus"));

      //if we don't have one, add it to the first
      if (focusButton == null) {
        buttons[0].classList.add("focus");
        focusButton = buttons[0];
      }

      //get it's index
      var buttonIndex = buttons.indexOf(focusButton);
      //and the last button
      var lastButton = buttons.length - 1;

      //remove active from the current button
      focusButton.classList.remove("focus");

      //if we're not on the first button,
      if (buttonIndex != 0) {
        //buttons one from the index
        buttons[buttonIndex - 1].classList.add("focus");
      } else {
        //otherwise, add to the last button
        buttons[lastButton].classList.add("focus")
      }

    }

    if (eventVar.key === 'ArrowRight' || eventVar.key === 'd' || eventVar.target.id == "right-arrow-button") {
      //play sounds (stop first to make sure they restart)
      document.getElementById("advance2").pause();
      document.getElementById("advance2").currentTime = 0;

      //play
      document.getElementById("advance2").play();

      //get the focused button
      var focusButton = buttons.find((element) => element.classList.contains("focus"));

      //if we don't have one, add it to the first
      if (focusButton == null) {
        buttons[0].classList.add("focus");
        focusButton = buttons[0];
      }

      //get it's index
      var buttonIndex = buttons.indexOf(focusButton);
      //and the last button
      var lastButton = buttons.length - 1;

      //remove active from the current button
      focusButton.classList.remove("focus");

      //if we're not on the last button,
      if (buttonIndex != lastButton) {
        //add one to the index
        buttons[buttonIndex + 1].classList.add("focus");
      } else {
        //otherwise, add to the first button
        buttons[0].classList.add("focus")
      }

    }

    if (eventVar.key === ' ' || eventVar.target.id == "interact-button") {
      var focusButton = document.querySelector("button.focus");
      var action = focusButton.id;

      if (action == "replay") {
        //refresh
        window.location.reload();
      }

      if (action == "return") {
        window.location.href = 'https://flyteck.github.io/wme1491/index.html';
      }
    }
}

function refresh() {
  if (event.target.id == "replay") {
    //refresh
      window.location.reload();
    }

    if (event.target.id == "return") {
      window.location.href = 'https://flyteck.github.io/wme1491/index.html';
    }
}