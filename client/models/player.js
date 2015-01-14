var AmpersandState = require('ampersand-state');
var CardDeck = require('./card-deck');

module.exports = AmpersandState.extend({
  __name__: 'Player',
  props: {
    name: 'string'
  },
  children: {
    hand: CardDeck
  },
  initialize: function() {
    this.hand.reset();
  },
  addedToGame: function(game) {
    game.on(game.EVENTS.TURN_START, this.turnStart, this);
  },
  addToHand: function(card) {
    this.hand.add(card);
  },
  toString: function() {
    return this.__name__ + '{"' + this.name + '":' + this.hand.toString() + '}';
  },
  turnStart: function(player) {
    console.log(this.__name__ + '{' + this.name + '}', 'turnStart');
  } // TBD
});