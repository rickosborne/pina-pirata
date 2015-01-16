var Adventure = require('./Adventure');
var Deck = require('./deck');
var Card = require('./card');
var _ = require('underscore');

module.exports = Deck.extend({
  __name__: 'AdventureDeck',
  model: Adventure,
  initialize: function() {
    this.shuffle();
  },
  shuffle: function() {
    this.reset(_.shuffle(Adventure.ADVENTURES));
  },
  personalize: function(names) {
    this.shuffle();
    var regexes = [];
    var replacements = [];
    _(names).each(function(personalized, original) {
      original = Card.prototype.FACE_NAMES[original] || original;
      if (!original) return;
      replacements.push(personalized);
      regexes.push(new RegExp('\\b' + original, 'ig'));
    });
    this.each(function(adventure) {
      var newName = adventure.name;
      var newDesc = adventure.desc;
      for (var i = 0; i < replacements.length; i++) {
        newName = newName.replace(regexes[i], replacements[i]);
        newDesc = newDesc.replace(regexes[i], replacements[i]);
      }
      if (newName !== adventure.name) adventure.name = newName;
      if (newDesc !== adventure.desc) adventure.desc = newDesc;
    });
  }
});

