//Character Dialogue as a string. Splice it every (20 words?)

//Divide lines of dialogue with ♡
//To change character expression, make sure to put the correct name before each line. this is REQUIRED!! Use "null" if a character has no expressions
//And repeat lines don't have the expression function -- so we also need a neutral named file (just character name) for that

const npcList = [
  { name: "Fluffy", dialogue: "RAWR lol XD", repeatLine: "Raaaaawwwr."},
  { name: "Quincy", dialogue: "excited♡Oh, heya Aunt Jude! Are you here for the show??♡annoyed♡...of course you're not.♡null♡So you're looking for anything strange around here? Well, there's something going on with the forest to the west...♡concerned♡That place gives me the heebie-jeebies. I checked it out for the atmosphere for my show, but it's like, REAL scary, y'know?♡null♡I'd stay away, myself... but if you're looking for strange, that's where I'd look.♡annoyed♡Anyway, if you change your mind about my show... I'll be here. Like always.", repeatLine: "That forest is <i>bad news</i>, auntie. Be careful if you go that way. <i class='whisper'>I don't wanna get in trouble with mom...</i>"},
  { name: "Terracotta", dialogue: "neutral♡Hello there! I don't see strangers around here too often. What brings you to these parts?♡concern♡Oh dear, an investigation? I'm sorry, I can't say that I've seen anything strange around here lately. I only really frequent this wildflower patch and the old church, myself.♡neutral♡I'm picking some flowers for the abandoned graves there right now, actually - I just hate to see them neglected.♡happy♡Please, if you have someone who needs a pick-me-up, take some yourself!", repeatLine: "I have the graves covered, but please feel free to take some flowers if you'd like!"},
  { name: "Crow", dialogue: "caw♡<span class='crow-scream'>CAW! caw! cAw!</span>♡neutral♡Hello! Hello! Another brindle beast! ♡neutral♡You are alone! ♡null♡Alone, like it?", repeatLine: "Alone, like it?"},
  { name: "Gnash", dialogue: "null♡...♡null♡.....♡null♡Why... have you come here?<div class='flex-row'><button class='active' id='option-1'>Seeking something strange</button> <button id='option-3'>Seeking you</button></div>"},
  //Items Down Here
  { name: "Drawing", dialogue: "This drawing is yellowed and dirty, but seems to be of... an equid? Something seems off about it, though."},
  { name: "Daisy", dialogue: "A freshly picked daisy."},
  { name: "Hair", dialogue: "A clump of scraggly black hair, caught in the brambles. It smells like forest earth, mildew, and... iron? It's slightly greasy to the touch."},
  { name: "CandyApple", dialogue: "Toffee apples (in Commonwealth English) or candy apples (in American English) are whole apples covered in a sugar candy coating, with a stick inserted as a handle.♡These are a common treat at fall festivals in Western culture in the Northern Hemisphere, such as Halloween and Guy Fawkes Night, because these festivals occur in the wake of annual apple harvests.[1]♡Although toffee apples and caramel apples may seem similar, they are made using distinctly different processes."},
];