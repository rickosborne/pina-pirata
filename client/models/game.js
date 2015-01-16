var AmpersandState = require('ampersand-state');
var AmpersandCollection = require('ampersand-collection');
var Player = require('./player');
var Adventure = require('./adventure');
var CardDeck = require('./card-deck');
var AdventureDeck = require('./adventure-deck');
var _ = require('underscore');

var EVENTS = {
  TURN_FINISH: 'turn:finish',
  TURN_START:  'turn:start',
  GAME_START:  'game:start',
  GAME_FINISH: 'game:finish',
  GAME_ABORT: 'game:abort',
  PLAYER_ADD: 'player:add',
  PLAYER_DROP: 'player:drop',
  PLAY_REVERSE: 'play:reverse',
  CARD_PLAY: 'card:play',
  CARD_DISCARD: 'card:discard',
  CARD_TRANSFER: 'card:transfer',
  CARD_REVEAL: 'card:reveal',
  CARD_TAKEBACK: 'card:takeback',
  DECK_SHUFFLE: 'deck:shuffle',
  DECK_REPLENISH: 'deck:replenish',
  DECK_DRAW: 'deck:draw',
  DECK_ADD: 'deck:add',
  DECK_EMPTY: 'deck:empty',
  DECK_REVEALED: 'deck:revealed',
  DECK_HIDDEN: 'deck:hidden',
  ADVENTURE_ADD: 'adventure:add',
  ADVENTURE_APPLIES: 'adventure:applies'
};

var Game = module.exports = AmpersandState.extend({
  __name__: 'Game',
  props: {
    round: ['number', false, -1],
    currentPlayerNum: ['number', false, 0],
    adventureCount: ['number', false, 2],
    playDirection: ['number', false, 1],
    deckRevealed: ['number', false, 0],
    personalNames: ['object', false, function(){return {}}],
    isPlaying: ['boolean', false, false],
    winners: ['array', false, function(){return []}]
  },
  collections: {
    players: AmpersandCollection.extend({
      model: Player
    }),
    adventures: AmpersandCollection.extend({
      __name__: 'AdventuresView',
      model: Adventure,
      toString: function() {
        return this.__name__ + '[' + this.length + ':' + this.map(function(adventure) {
            return adventure.toString();
          }).join('; ') + ']';
      }
    }),
    mainDeck: CardDeck,
    adventureDeck: AdventureDeck,
    discardPile: CardDeck,
    piles: AmpersandCollection.extend({
      __name__: 'Piles',
      model: CardDeck,
      toString: function() {
        return this.__name__ + '[' + this.length + ':' + this.map(function(pile) {
            return pile.toString();
          }).join('; ') + ']';
      }
    })
  },
  derived: {
    startingHandSize: {
      deps: ['players'],
      fn: function() {
        return this.players.length < 6 ? 8 : 7;
      }
    },
    pileCount: {
      deps: ['adventures'],
      fn: function() {
        var count = 1;
        this.adventures.each(function(adventure) {
          if ('additionalPiles' in adventure) count += _.result(adventure['additionalPiles']);
        });
        return count;
      }
    },
    currentPlayer: {
      deps: ['currentPlayerNum', 'players'],
      fn: function() {
        return this.players.at(this.currentPlayerNum);
      }
    },
    nextPlayer: {
      deps: ['nextPlayerNum', 'players'],
      fn: function() {
        return this.players.at(this.nextPlayerNum)
      }
    },
    nextPlayerNum: {
      deps: ['currentPlayerNum', 'playDirection', 'players'],
      fn: function() {
        return (this.currentPlayerNum + this.playDirection + this.players.length) % this.players.length;
      }
    },
    leftPlayerNum: {
      deps: ['currentPlayerNum', 'players'],
      fn: function() {
        return (this.currentPlayerNum + 1 + this.players.length) % this.players.length;
      }
    },
    leftPlayer: {
      deps: ['leftPlayerNum', 'players'],
      fn: function() {
        return this.players.at(this.leftPlayerNum);
      }
    },
    rightPlayerNum: {
      deps: ['currentPlayerNum', 'players'],
      fn: function() {
        return (this.currentPlayerNum - 1 + this.players.length) % this.players.length;
      }
    },
    rightPlayer: {
      deps: ['rightPlayerNum', 'players'],
      fn: function() {
        return this.players.at(this.rightPlayerNum);
      }
    }
  },
  addPlayer: function(player) {
    this.players.add(player);
    player.addedToGame(this);
    this.trigger(EVENTS.PLAYER_ADD, player, this);
  },
  setup: function() {
    this.playDirection = 1;
    this.mainDeck.buildBasicDeck();
    // players
    this.players.each(function(player) {
      player.hand.reset();
    });
    // initial deal
    for(var i = 0; i < this.startingHandSize; i++) {
      this.players.each(function(player) {
        player.addToHand(this.mainDeck.draw());
      }, this);
    }
    // pile(s)
    this.piles.reset();
    for(var pileN = 1; pileN <= this.pileCount; pileN++) {
      var pile = new CardDeck([this.mainDeck.draw()]);
      pile.setIndex = pileN;
      this.piles.add(pile);
    }
    // adventures
    this.adventures.reset();
    this.adventureDeck.personalize(this.personalNames);
    for(var adventureN = 1; (adventureN <= this.adventureCount) && (this.adventureDeck.length > 0); adventureN++) {
      var adventure = this.adventureDeck.draw();
      this.adventures.add(adventure.attributes); // wtf is this hackery?
      this.trigger(EVENTS.ADVENTURE_ADD, adventure, this);
      if (adventure.addToGame) adventure.addToGame(this);
    }
  },
  startTurn: function() {
    //this.currentPlayer.on(EVENTS.TURN_FINISH, this.finishTurn, this);
    //console.log('startTurn', this.currentPlayer.name);
    this.trigger(EVENTS.TURN_START, this.currentPlayer, this);
    this.currentPlayer.turnStart(this.currentPlayer, this).then(this.finishTurn.bind(this));
  },
  finishTurn: function() {
    //this.currentPlayer.off(EVENTS.TURN_FINISH);
    //console.log('finishTurn');
    this.trigger(EVENTS.TURN_FINISH, this.currentPlayer);
    var winners = this.players.filter(function(player) {
      return player.hand.length === 0;
    });
    if (winners.length > 0) {
      this.finishGame(winners);
    } else {
      this.currentPlayerNum = this.nextPlayerNum;
      _.defer(this.startTurn.bind(this));
    }
  },
  finishGame: function(winners) {
    //this.trigger(EVENTS.TURN_FINISH, this.currentPlayer);
    this.isPlaying = false;
    this.winners = winners;
    this.trigger(EVENTS.GAME_FINISH, winners);
    this.cleanUp();
  },
  abortGame: function() {
    this.trigger(EVENTS.TURN_FINISH, this.currentPlayer);
    this.trigger(EVENTS.GAME_ABORT);
    this.cleanUp();
  },
  cleanUp: function() {
    this.players.each(function(player) {
      //player.off(null, null, this);
      player.removeFromGame(this);
    }, this);
  },
  startGame: function() {
    this.currentPlayerNum = 0;
    //this.players.each(function(player) {
    //  player.on(EVENTS.GAME_FINISH, this.finishGame, this);
    //}, this);
    this.isPlaying = true;
    this.winners = [];
    this.trigger(EVENTS.GAME_START);
    this.startTurn();
  },
  isWild: function(card, player) {
    var result = false;
    this.adventures.each(function(adventure) {
      if (adventure.isWild) result = result || adventure.isWild(card, player, this);
    }, this);
    return result;
  },
  couldPlayOn: function(card, player) {
    var isWild = this.isWild(card, player);
    var faces = card.faceTypes;
    return this.piles.filter(function(pile) {
      if (isWild) return true;
      var topCard = pile.top();
      this.adventures.each(function(adventure) {
        if (adventure.masqueradeAction) topCard = adventure.masqueradeAction(topCard, player, this) || topCard;
      }, this);
      for (var faceN = 0; faceN < faces.length; faceN++) {
        if (topCard.hasType(faces[faceN])) {
          var couldPlay = true;
          this.adventures.each(function(adventure) {
            if (adventure.blockPlay && adventure.blockPlay(card, topCard, pile, this)) couldPlay = false;
          }, this);
          if (couldPlay) return true;
        }
      }
      return false;
    }, this);
  },
  masqueradeCard: function(card, player) {
    this.adventures.each(function(adventure) {
      if (adventure.masqueradeAction) card = adventure.masqueradeAction(card, player, this) || card;
    }, this);
    return card;
  },
  peekMainDeck: function(player) {
    return this.masqueradeCard(this.mainDeck.peek(), player);
  },
  playCard: function(card, pile, player) {
    var previousTop = pile.top();
    pile.add(card);
    var masqCard = this.masqueradeCard(card);
    this.trigger(EVENTS.CARD_PLAY, card, previousTop, pile, player, this);
    this.adventures.each(function(adventure) {
      if (adventure.playCard) adventure.playCard(card, masqCard, previousTop, pile, player, this);
    }, this);
  },
  shuffleMainDeck: function() {
    this.mainDeck.shuffle();
    this.trigger(EVENTS.DECK_SHUFFLE);
  },
  replenishMainDeck: function() {
    this.piles.each(function(pile) {
      var topCard = pile.take();
      this.mainDeck.add(pile.models);
      pile.remove(pile.models); // reset is causing view issues
      pile.add(topCard);
    }, this);
    if (this.discardPile.length > 0) {
      this.mainDeck.add(this.discardPile.models);
      this.discardPile.reset([]);
    }
    this.shuffleMainDeck();
    this.trigger(EVENTS.DECK_REPLENISH, this);
  },
  drawCard: function(player) {
    var card = this.mainDeck.draw();
    if (!card) { // replenish decks
      this.replenishMainDeck();
      card = this.mainDeck.draw();
    }
    if (!card) { // no more cards!
      this.abortGame();
      return null;
    }
    this.trigger(EVENTS.DECK_DRAW, card, player);
    return card;
  },
  reversePlayOrder: function() {
    this.playDirection = -this.playDirection;
    this.trigger(EVENTS.PLAY_REVERSE, this.playDirection, this.nextPlayer);
  },
  addCardToMainDeck: function(card, player) {
    this.mainDeck.addBottom(card);
    this.trigger(EVENTS.DECK_ADD, card, player);
  },
  adventureApplies: function(adventure, player, card) {
    this.trigger(EVENTS.ADVENTURE_APPLIES, adventure, player, card);
  },
  revealMainDeck: function() {
    if (!this.deckRevealed) this.trigger(EVENTS.DECK_REVEALED, this);
    this.deckRevealed++;
  },
  hideMainDeck: function() {
    this.deckRevealed--;
    if (!this.deckRevealed) this.trigger(EVENTS.DECK_HIDDEN, this);
  },
  discard: function(card, player) {
    this.discardPile.add(card);
    this.trigger(EVENTS.CARD_DISCARD, card, player);
  },
  transferCard: function(card, toPlayer, fromPlayer) {
    toPlayer.addToHand(card);
    this.trigger(EVENTS.CARD_TRANSFER, card, toPlayer, fromPlayer);
  },
  revealCard: function(card, player) {
    this.trigger(EVENTS.CARD_REVEAL, card, player);
  },
  takeBackCard: function(card, pile, player) {
    pile.remove(card);
    player.addToHand(card);
    this.trigger(EVENTS.CARD_TAKEBACK, card, pile, player);
  }
});

Game.prototype.EVENTS = EVENTS;