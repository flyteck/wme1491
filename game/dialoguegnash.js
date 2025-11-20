//Divide lines of dialogue with ♡
//To change character expression, make sure to put the correct name before each line. this is REQUIRED!! Use "null" if a character has no expressions

//All options must end with a button, even if it's only one option

//<div class='flex-row'><button id='option-1'>???</button> <button id='option-2'>???</button></div>

const gnashDialogueOptions = [
  { option: "option-1", dialogue: "null♡Something... strange?<div class='flex-row'><button id='option-3'>There's been rumours of a monster</button> <button id='option-3'>You, I think</button></div>"},
  { option: "option-3", dialogue: "null♡Me...?♡null♡Why...?<div class='flex-row'><button id='option-4'>Have you been hurting equids?</button><button id='option-4'>Everyone is scared</button></div>"},
  { option: "option-4", dialogue: "null♡I would...♡null♡I would not hurt anyone.♡null♡I am here. Alone.♡null♡I only... watch.♡null♡Are you...♡null♡...like me? <div class='flex-row'><button id='option-5'>Yes</button><button id='option-6'>No</button></div>"},
  { option: "option-5", dialogue: "null♡I am... not so sure.<div class='flex-row'><button id='option-7'>[Give him something]</button></div>"},
  { option: "option-6", dialogue: "null♡...<div class='flex-row'><button id='option-7'>[Give him something]</button></div>"},
  { option: "option-7", dialogue: "null♡<div class='flex-row' style='margin-top: -20px;'><button class='drawing-button' id='option-drawing'><img src='objectives/drawing.png'></button><button id='option-hair' class='hair-button'><img src='objectives/hair.png'></button><button id='option-daisy' class='daisy-button'><img src='objectives/daisy.png'></button><button id='option-daisy' class='daisy-button'><img src='objectives/daisy.png' class='daisy-button'></button><button id='option-daisy' class='daisy-button'><img src='objectives/daisy.png'></button></div>"},
  { option: "option-drawing", dialogue: "null♡Is this... me?♡null♡Then...♡null♡I am... not like you.<div class='flex-row'><button id='option-7'>[Give him something else]</button></div>"},
];