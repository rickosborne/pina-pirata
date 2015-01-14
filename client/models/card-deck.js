var Card = require('./card');
var Deck = require('./deck');
var _ = require('underscore');

module.exports = Deck.extend({
  __name__: 'CardDeck',
  model: Card,
  initialize: function() {
    var cards = [];
    _(Card.prototype.FACES).each(function(face1) {
      _(Card.prototype.FACES).each(function(face2) {
        if (face1 <= face2) cards.push({ type: face1 | face2 });
      }, this);
    }, this);
    this.reset(_.shuffle(cards));
  }
});