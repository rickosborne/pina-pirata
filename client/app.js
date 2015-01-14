var App = require('./models/app');
var AIPlayer = require('./models/ai-player');

var app = new App();
var game = app.game;

var alice = new AIPlayer({name: 'Alice'});
var bob   = new AIPlayer({name: 'Bob'});

game.addPlayer(alice);
game.addPlayer(bob);

game.setup();

console.log(alice.toString());
console.log(bob.toString());
console.log(game.mainDeck.toString());
console.log(game.piles.toString());
console.log(game.adventures.toString());
console.log(game.adventureDeck.toString());

game.startGame();