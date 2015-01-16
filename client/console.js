var App = require('./models/app');
var AIPlayer = require('./models/ai-player');
var ConsoleWatcher = require('./models/console-watcher');

var logger = new ConsoleWatcher();
var app = new App();
var game = logger.game = app.game;

game.addPlayer(new AIPlayer({name: 'Robbie'}));
game.addPlayer(new AIPlayer({name: 'Stella'}));

game.setup();

game.startGame();
