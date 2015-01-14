var App = require('./models/app');
var AIPlayer = require('./models/ai-player');

var app = new App();
var game = app.game;

game.addPlayer(new AIPlayer({name: 'Alice'}));
game.addPlayer(new AIPlayer({name: 'Bob'}));
game.addPlayer(new AIPlayer({name: 'Chuck'}));

game.setup();

console.log(game.players.toString());
console.log(game.mainDeck.toString());
console.log(game.piles.toString());
console.log(game.adventures.toString());
console.log(game.adventureDeck.toString());

game.startGame();