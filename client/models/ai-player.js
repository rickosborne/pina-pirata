var Player = require('./player');
var Q = require('q');

module.exports = Player.extend({
  __name__: 'AIPlayer',
  turnStart: function(player, game) {
    var deferred = Q.defer();
    if (this.hand.length < 1) {
      //this.trigger(game.EVENTS.GAME_FINISH, player);
      deferred.resolve({action: game.EVENTS.GAME_FINISH});
    }
    else {
      var card = null, pile = null;
      for (var handN = 0; handN < this.hand.length && !pile; handN++) {
        card = this.hand.at(handN);
        var piles = game.couldPlayOn(card, player);
        if (piles.length > 0) pile = piles[0];
      }
      if (pile && card) {
        this.hand.remove(card);
        game.playCard(card, pile, player);
        deferred.resolve({action: game.EVENTS.CARD_PLAY, card: card, pile: pile});
      }
      else this.deferredDrawCard(deferred);
    }
    //if (this.hand.length > 0) this.trigger(game.EVENTS.TURN_FINISH, player);
    //else this.trigger(game.EVENTS.GAME_FINISH, player);
    return deferred.promise;
  },
  selectDiscard: function(game) {
    var deferred = Q.defer();
    deferred.resolve(this.hand.drawRandom());
    return deferred.promise;
  },
  selectGiveaway: function(toPlayer, game) {
    return this.selectDiscard(game);
  }
});