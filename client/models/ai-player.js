var AmpersandState = require('ampersand-state');
var Player = require('./player');

module.exports = Player.extend({
  __name__: 'AIPlayer',
  turnStart: function(player, game) {
    if (player != this) return;
    console.log('turnStart', this.toString());
    if (this.hand.length < 1) {
      this.trigger(game.EVENTS.GAME_FINISH, player);
      return;
    }
    var card = null, pile = null;
    for (var handN = 0; handN < this.hand.length && !pile; handN++) {
      card = this.hand.at(handN);
      var piles = game.couldPlayOn(card);
      if (piles.length > 0) pile = piles[0];
    }
    if (pile && card) {
      this.hand.remove(card);
      game.playCard(card, pile, player);
    }
    else {
      this.addToHand(game.drawCard(player));
    }
    if (this.hand.length > 0) this.trigger(game.EVENTS.TURN_FINISH, player);
    else this.trigger(game.EVENTS.GAME_FINISH, player);
  }
});