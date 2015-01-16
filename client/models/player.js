var AmpersandState = require('ampersand-state');
var CardDeck = require('./card-deck');
var Game = require('./game');

module.exports = AmpersandState.extend({
  __name__: 'Player',
  props: {
    name: 'string',
    game: [Game, false, null],
    isCurrent: ['boolean', false, false]
  },
  children: {
    hand: CardDeck
  },
  initialize: function() {
    this.hand.reset();
  },
  addedToGame: function(game) {
    this.game = game;
    //game.on(game.EVENTS.TURN_START, this.turnStart, this);
    this.game.off(null, null, this);
    this.game.on('change:currentPlayer', function() {
      this.isCurrent = this.game.currentPlayer === this;
    }, this);
  },
  addToHand: function(card) {
    this.hand.add(card);
  },
  toString: function() {
    return this.__name__ + '{"' + this.name + '":' + this.hand.toString() + '}';
  },
  turnStart: function(player) { return {then:function(){}}; }, // TBD
  selectDiscard: function() { return {then:function(){}}; },
  selectGiveaway: function() { return {then:function(){}}; },
  deferredDrawCard: function(deferred) {
    //console.log('deferredDrawCard');
    var card = this.game.drawCard(this);
    if (card) {
      deferred.resolve({action: this.game.EVENTS.DECK_DRAW, card: card});
      this.addToHand(card);
    }
    else {
      deferred.resolve({action: this.game.EVENTS.DECK_EMPTY});
    }
  }
});