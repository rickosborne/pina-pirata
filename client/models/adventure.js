var AmpersandState = require('ampersand-state');
var Card = require('./card');

var ADVENTURES = [];
var FACES = Card.prototype.FACES;
var WILD = Card.prototype.WILD;

module.exports = AmpersandState.extend({
  __name__: 'Adventure',
  props: {
    name: 'string',
    face: ['number', false],
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
  face: FACES.PENGUIN,
  playCard: function(card, masqCard, previousTop, pile, player, game) {
    if (masqCard.hasType(FACES.PENGUIN)) {
      game.adventureApplies(this, player, card);
      game.reversePlayOrder();
    }
  }
});

registerAdventure({
  name: 'Man Overboard',
  desc: 'Whenever you play a Parrot, put a card from your Hand on top of the draw pile.',
  face: FACES.PARROT,
  playCard: function(card, masqCard, previousTop, pile, player, game) {
    if (masqCard.hasType(FACES.PARROT) && (player.hand.length > 0)) {
      var returnCard = player.selectDiscard(game);
      game.adventureApplies(this, player, card);
      game.addCardToMainDeck(returnCard, player);
    }
  }
});

registerAdventure({
  name: 'No Other Walrus',
  desc: 'You cannot play a Walrus on a Walrus. The solitary walrus is every pirate type (he can be played on any other pirate, and triggers all Adventure tiles that are triggered when particular pirates are played).',
  face: FACES.WALRUS,
  blockPlay: function(card, topCard) {
    return card.hasType(FACES.WALRUS) && topCard && topCard.hasType(FACES.WALRUS);
  },
  isWild: function(card) {
    return card.type === FACES.WALRUS;
  },
  masqueradeAction: function(card) {
    // any card can be played on the solitary walrus
    return (card.type === FACES.WALRUS) ? new Card({type: WILD}) : card;
  },
  playCard: function(card, masqCard, previousTop, pile, player, game) {
    if ((previousTop.type === FACES.WALRUS) || (card.type === FACES.WALRUS)) {
      game.adventureApplies(this, player, card);
    }
  }
});

registerAdventure({
  name: 'Tick Tock Tick Tock',
  desc: 'Whenever you play a Crocodile, the player to your left draws a card.',
  face: FACES.CROC,
  playCard: function(card, masqCard, previousTop, pile, player, game) {
    if (masqCard.hasType(FACES.CROC)) {
      game.adventureApplies(this, player, card);
      game.leftPlayer.addToHand(game.drawCard(game.leftPlayer));
    }
  }
});

registerAdventure({
  name: 'Mating Season',
  desc: 'The top card of the draw pile is face-up. While that card has an Octopus, Octopuses are Wildcards.',
  face: FACES.OCTOPUS,
  isWild: function(card, player, game) {
    var topCard = game.peekMainDeck(player);
    return topCard && topCard.hasType(FACES.OCTOPUS) && card.hasType(FACES.OCTOPUS);
  },
  playCard: function(card, masqCard, previousTop, pile, player, game) {
    var drawCard = game.mainDeck.peek();
    if (masqCard && previousTop && drawCard && masqCard.hasType(FACES.OCTOPUS) && drawCard.hasType(FACES.OCTOPUS) && !previousTop.hasType(FACES.OCTOPUS)) {
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

registerAdventure({
  name: 'Moonlight',
  desc: 'While you have only one card left in your Hand, play with your card revealed on the table.',
  addToGame: function(game) {
    var adventure = this;
    var checkHand = function(card, hand) {
      var player = hand.parent;
      if (hand.length === 1) {
        game.adventureApplies(adventure, player, hand.peek());
        game.revealCard(hand.peek(), player);
      }
    };
    game.players.each(function(player) {
      player.hand.on('add remove', checkHand, adventure);
    }, this);
    game.players.on('add', function(player) {
      player.hand.on('add remove', checkHand, adventure);
    }, this);
    game.players.on('remove', function(player) {
      player.hand.off(null, null, this);
    }, this);
  },
  removeFromGame: function(game) {
    game.players.each(function(player) {
      player.hand.off(null, null, this);
    }, this);
    game.players.off(null, null, this);
  }
});

registerAdventure({
  name: 'Despair',
  desc: 'All your pirates are Wildcards as long as you have at least 8 cards in Hand.',
  isWild: function(card, player, game) {
    return player.hand.length >= 8;
  },
  playCard: function(card, masqCard, previousTop, pile, player, game) {
    if (!(card.type & previousTop.type) && (player.hand.length >= 7)) {
      game.adventureApplies(this, player, card);
    }
  }
});

registerAdventure({
  name: 'Favorable Current',
  desc: 'You may discard a card at any time you have exactly 5 cards in Hand.',
  addToGame: function(game) {
    var adventure = this;
    var checkHand = function(card, hand) {
      var player = hand.parent;
      if (hand.length === 5) {
        game.adventureApplies(adventure, player, null);
        var discard = player.selectDiscard(game);
        if (discard) game.discard(discard, player);
      }
    };
    game.players.each(function(player) {
      player.hand.on('add remove', checkHand, adventure);
    }, this);
    game.players.on('add', function(player) {
      player.hand.on('add remove', checkHand, adventure);
    }, this);
    game.players.on('remove', function(player) {
      player.hand.off(null, null, this);
    }, this);
  },
  removeFromGame: function(game) {
    game.players.each(function(player) {
      player.hand.off(null, null, this);
    }, this);
    game.players.off(null, null, this);
  }
});

registerAdventure({
  name: 'Sabotage',
  desc: 'Whenever you play a Monkey, give the player to your left a card from your Hand.',
  face: FACES.MANDRILL,
  playCard: function(card, masqCard, previousTop, pile, player, game) {
    if (masqCard.hasType(FACES.MANDRILL)) {
      var discard = player.selectDiscard();
      if (discard) {
        game.adventureApplies(this, player, discard);
        game.transferCard(discard, game.leftPlayer, player);
      }
    }
  }
});

//registerAdventure({
//  name: 'Turtleball',
//  desc: 'Whenever you play a Penguin on a Turtle, the player to your right takes that Turtle into his Hand.',
//  face: FACES.PENGUIN
//});

//registerAdventure({
//  name: 'Labyrinth',
//  desc: "Whenever you play a Rat, you may take the card onto which you've just played the Rat into your Hand.",
//  face: FACES.RAT
//});

//registerAdventure({
//  name: 'Full Sails',
//  desc: 'Play an extra card on your turn.  If you cannot, but have cards in your hand, draw a card.'
//});

//registerAdventure({
//  name: 'Walrus Attack',
//  desc: 'Whenever you play a Walrus, you may play another card.',
//  face: FACES.WALRUS
//});

//registerAdventure({
//  name: 'Double Rations',
//  desc: 'Play with two Action piles.  You may play on the pile of your choice.'
//});

//registerAdventure({
//  name: 'New Captain',
//  desc: 'Whenever you play a solitary pirate, put it before you instead of on the Action pile.  If you have more cards before you than any other player, you do not have to draw a card when you cannot play.'
//});

//registerAdventure({
//  name: 'Bunny Checkpoint',
//  desc: 'Whenever you play an Octopus, each other player draws a card unless he reveals a Rabbit from his Hand.',
//  face: FACES.OCTOPUS
//});

//registerAdventure({
//  name: 'Crystal Ball',
//  desc: 'Whever you play a Rat, name a pirate and secretly look at the top card of the draw pile.  If that pirate is on the card, reveal it, put it back on the draw pile, and discard a card from your Hand.  Otherwise, simply put it back.',
//  face: FACES.RAT
//});

//registerAdventure({
//  name: 'Madness',
//  desc: 'Walruses are Wildcards.',
//  face: FACES.WALRUS
//});

//registerAdventure({
//  name: 'Iceberg',
//  desc: 'Whenever you draw a card, you may discard a Penguin from your Hand.',
//  face: FACES.PENGUIN
//});

//registerAdventure({
//  name: 'Go Fish',
//  desc: 'Whenever you play a Parrot, choose a pirate and opponent.  That opponent must give you a card from his Hand with this pirate, if possible.',
//  face: FACES.PARROT
//});

//registerAdventure({
//  name: 'Fake Map',
//  desc: 'Whenever you play a Turtle, put this Adventure tile before you.  If this Adventure tile is before you, you cannot play your last card.  Put this Adventure tile back with the others at the end of the round.',
//  face: FACES.TURTLE
//});

//registerAdventure({
//  name: 'Picky Cartographer',
//  desc: 'Whenever you play a Turtle, draw two cards, then discard one card.',
//  face: FACES.TURTLE
//});

//registerAdventure({
//  name: 'Migration',
//  desc: 'Whenever you draw a Turtle, you may give it to the player on your left.',
//  face: FACES.TURTLE
//});

//registerAdventure({
//  name: 'Bayou',
//  desc: 'Whenever you play a Crocodile, set aside the top card from the draw pile.  Whenever you play a card that has no Crocodile, take all the cards that have been set aside into your Hand.',
//  face: FACES.CROC
//});

//registerAdventure({
//  name: 'Staredown',
//  desc: 'Whenever you play a Crocodile, the next player ships his turn.',
//  face: FACES.CROC
//});

//registerAdventure({
//  name: 'Disinformation',
//  desc: 'Whenever you play a Tiger, put the top card of the draw pile on the Action pile.',
//  face: FACES.TIGER
//});

//registerAdventure({
//  name: 'Rabbit Hunt',
//  desc: 'Whenever you play a Tiger on a Rabbit, take the Rabbit and put it before you.  If one player has more cards before him than any other player, he may play an extra card on his turn.',
//  face: FACES.TIGER
//});

//registerAdventure({
//  name: 'Recruiting',
//  desc: 'Whenever you play a Monkey, look at the cards in the Hand of the player to your right, choose one and take it.',
//  face: FACES.MANDRILL
//});

//registerAdventure({
//  name: 'Stowaway',
//  desc: 'Whenever you play a Rat, discard a card from your Hand and slip it under the card played, then draw a card.',
//  face: FACES.RAT
//});

//registerAdventure({
//  name: 'Lucky Charm',
//  desc: 'If you have a Rabbit on every card in your Hand at the end of your turn you win the round.',
//  face: FACES.RABBIT
//});

//registerAdventure({
//  name: 'Big Hug',
//  desc: 'You may play any pirate on Rabbits',
//  face: FACES.RABBIT
//});

//registerAdventure({
//  name: 'The Tortoise and the Hare',
//  desc: 'Whenever you play a Rabbit, every opponent reveals a card from his Hand.  If every one of them reveals a Turtle, draw two cards.',
//  face: FACES.RABBIT
//});

//registerAdventure({
//  name: 'Acrobats',
//  desc: 'You may play a Parrot on a Monkey even if the cards have no pirate in common.',
//  face: FACES.PARROT
//});

//registerAdventure({
//  name: 'Old Sea Dog',
//  desc: 'Whenever you play a Tiger, you may flip an Adventure tile in play face-down.  Its effect is no longer active for this round (flip it face-up at the start of the next round).',
//  face: FACES.TIGER
//});

//registerAdventure({
//  name: 'Plan B',
//  desc: 'If you have exactly 3 cards in you Hand with at least one Octopus, one Walrus, and one Crocodile at the end of your turn, you win the round.',
//  face: FACES.WALRUS | FACES.CROC | FACES.OCTOPUS
//});

//registerAdventure({
//  name: 'Voodoo',
//  desc: 'At the start of the round, draw a card and put it before you face-up.  Every pirate on the cards before you is a Wildcard for you.'
//});

//registerAdventure({
//  name: 'Ghost',
//  desc: 'Whenever you play a solitary pirate, choose a pirate.  This pirate becomes a Wildcard for every player until another solitary pirate is played.'
//});

//registerAdventure({
//  name: 'Shipwreck',
//  desc: 'Whenever you play an Octopus, you may draw a card.  If you do so, you may play a card.',
//  face: FACES.OCTOPUS
//});

//registerAdventure({
//  name: 'Maelstrom',
//  desc: 'Whenever you play a Monkey, each player gives all of the cards in his Hand to the player to his left.',
//  face: FACES.MANDRILL
//});

//registerAdventure({
//  name: 'Alligaturtle',
//  desc: 'Turtles are also Crocodiles.  Crocodiles are also Turtles.',
//  face: FACES.CROC | FACES.TURTLE
//});

module.exports.ADVENTURES = ADVENTURES;