var AmpersandState = require('ampersand-state');
var Card = require('./card');

var ADVENTURES = [];

module.exports = AmpersandState.extend({
  __name__: 'Adventure',
  props: {
    name: 'string',
    playCard: ['function', false],
    isWild: ['function', false],
    blockPlay: ['function', false],
    masqueradeAction: ['function', false]
  },
  addToGame: function(game) {
    this.game = game;
    // make a bunch of bindings here
  },
  removeFromGame: function(game) {
    delete this.game;
    // unbind a bunch here
  },
  toString: function() {
    return 'Adventure["' + this.name + '"]';
  }
});

var registerAdventure = function(adventure) {
  ADVENTURES.push(adventure);
};

registerAdventure({
  name: 'Follow the Penguin',
  desc: 'Whenever you play a Penguin, the play order switches directions.',
  playCard: function(card, pile, player, game) {
    if (card.hasType(card.FACES.PENGUIN)) game.reversePlayOrder();
  }
});

registerAdventure({
  name: 'Man Overboard',
  desc: 'Whenever you play a Parrot, put a card from your Hand on top of the draw pile.',
  playCard: function(card, pile, player, game) {
    if (card.hasType(card.FACES.PARROT) && (player.hand.length > 0)) {
      var card = player.hand.drawRandom();
      console.log(this.toString(), player.name, card.toString(), player.hand.toString());
      game.addCardToMainDeck(card);
    }
  }
});

registerAdventure({
  name: 'No Other Walrus',
  desc: 'You cannot play a Walrus on a Walrus. The solitary walrus is every pirate type (he can be played on any other pirate, and triggers all Adventure tiles that are triggered when particular pirates are played).',
  blockPlay: function(card, pile, game) {
    var topCard = pile.top();
    return card.hasType(card.FACES.WALRUS) && topCard && topCard.hasType(card.FACES.WALRUS);
  },
  isWild: function(card, game) {
    return card.type === card.FACES.WALRUS;
  },
  masqueradeAction: function(card) {
    if (card.type === card.FACES.WALRUS) {
      // any card can be played on the solitary walrus
      console.log('masqueradeAction', this.toString());
      return new Card({type: card.WILD});
    }
    return card;
  }
});

registerAdventure({
  name: 'Tick Tock Tick Tock',
  desc: 'Whenever you play a Crocodile, the player to your left draws a card.',
  playCard: function(card, pile, player, game) {
    if (card.hasType(card.FACES.CROC)) {
      console.log('playCard', this.toString());
      game.leftPlayer.addToHand(game.drawCard(game.leftPlayer));
    }
  }
});

registerAdventure({
  name: 'Mating Season',
  desc: 'The top card of the draw pile is face-up. While that card has an Octopus, Octopuses are Wildcards.',
  isWild: function(card, game) {
    var topCard = game.mainDeck.peek();
    var isWild = topCard && topCard.hasType(card.FACES.OCTOPUS) && card.hasType(card.FACES.OCTOPUS);
    if (isWild) console.log('isWild', this.toString(), topCard.toString(), card.toString());
    return isWild;
  }
});

module.exports.ADVENTURES = ADVENTURES;