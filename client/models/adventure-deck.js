var Adventure = require('./Adventure');
var Deck = require('./deck');
var _ = require('underscore');

module.exports = Deck.extend({
  __name__: 'AdventureDeck',
  model: Adventure,
  initialize: function() {
    //console.log(this.__name__, 'initialize');
    this.reset(_.shuffle(Adventure.ADVENTURES));
  }
});

