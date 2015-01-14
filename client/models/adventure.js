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
    masqueradeAction: ['function', false],
    addToGame: ['function', false],
    removeFromGame: ['function', false]
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
  playCard: function(card, previousTop, pile, player, game) {
    if (card.hasType(card.FACES.PENGUIN)) {
      game.adventureApplies(this, player, card);
      game.reversePlayOrder();
    }
  }
});

registerAdventure({
  name: 'Man Overboard',
  desc: 'Whenever you play a Parrot, put a card from your Hand on top of the draw pile.',
  playCard: function(card, previousTop, pile, player, game) {
    if (card.hasType(card.FACES.PARROT) && (player.hand.length > 0)) {
      var returnCard = player.hand.drawRandom();
      game.adventureApplies(this, player, card);
      game.addCardToMainDeck(returnCard, player);
    }
  }
});

registerAdventure({
  name: 'No Other Walrus',
  desc: 'You cannot play a Walrus on a Walrus. The solitary walrus is every pirate type (he can be played on any other pirate, and triggers all Adventure tiles that are triggered when particular pirates are played).',
  blockPlay: function(card, topCard) {
    return card.hasType(card.FACES.WALRUS) && topCard && topCard.hasType(card.FACES.WALRUS);
  },
  isWild: function(card) {
    return card.type === card.FACES.WALRUS;
  },
  masqueradeAction: function(card, player, game) {
    // any card can be played on the solitary walrus
    return (card.type === card.FACES.WALRUS) ? new Card({type: card.WILD}) : card;
  },
  playCard: function(card, previousTop, pile, player, game) {
    if (previousTop.type === card.FACES.WALRUS) {
      game.adventureApplies(this, player, card);
    }
  }
});

registerAdventure({
  name: 'Tick Tock Tick Tock',
  desc: 'Whenever you play a Crocodile, the player to your left draws a card.',
  playCard: function(card, previousTop, pile, player, game) {
    if (card.hasType(card.FACES.CROC)) {
      game.adventureApplies(this, player, card);
      game.leftPlayer.addToHand(game.drawCard(game.leftPlayer));
    }
  }
});

registerAdventure({
  name: 'Mating Season',
  desc: 'The top card of the draw pile is face-up. While that card has an Octopus, Octopuses are Wildcards.',
  isWild: function(card, game) {
    var topCard = game.mainDeck.peek();
    return topCard && topCard.hasType(card.FACES.OCTOPUS) && card.hasType(card.FACES.OCTOPUS);
  },
  playCard: function(card, previousTop, pile, player, game) {
    var drawCard = game.mainDeck.peek();
    if (card && previousTop && drawCard && card.hasType(card.FACES.OCTOPUS) && drawCard.hasType(card.FACES.OCTOPUS) && !previousTop.hasType(card.FACES.OCTOPUS)) {
      game.adventureApplies(this, player, card);
    }
  },
  addToGame: function(game) {
    game.revealMainDeck();
  },
  removeFromGame: function(game) {
    game.hideMainDeck();
  }
});

module.exports.ADVENTURES = ADVENTURES;