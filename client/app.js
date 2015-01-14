var App = require('./models/app');
var AIPlayer = require('./models/ai-player');
var ConsoleWatcher = require('./models/console-watcher');

var logger = new ConsoleWatcher();
var app = new App();
var game = logger.game = app.game;

game.addPlayer(new AIPlayer({name: 'Alice'}));
game.addPlayer(new AIPlayer({name: 'Bob'}));
game.addPlayer(new AIPlayer({name: 'Chuck'}));

game.setup();
game.startGame();