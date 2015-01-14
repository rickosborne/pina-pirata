var AmpersandState = require('ampersand-state');
var Game = require('./game');

module.exports = AmpersandState.extend({
  props: {
    screen: 'splash'
  },
  children: {
    game: Game
  }
});