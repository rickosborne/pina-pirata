var AmpersandState = require('ampersand-state');
var AmpersandCollection = require('ampersand-collection');
var Player = require('./player');
var Adventure = require('./adventure');
var CardDeck = require('./card-deck');
var AdventureDeck = require('./adventure-deck');

var EVENTS = {
  TURN_FINISH: 'turn:finish',
  TURN_START:  'turn:start',
  GAME_START:  'game:start',
  GAME_FINISH: 'game:finish',
  GAME_ABORT: 'game:abort',
  GAME_PLAYER_ADD: 'game:player:add',
  GAME_PLAYER_DROP: 'game:player:drop',
  GAME_PLAY_REVERSE: 'game:play:reverse',
  DECK_SHUFFLE: 'deck:shuffle',
  DECK_DRAW: 'deck:draw',
  DECK_ADD: 'deck:add',
  DECK_EMPTY: 'deck:empty'
};

var Game = module.exports = AmpersandState.extend({
  __name__: 'Game',
  props: {
    round: ['number', false, -1],
    currentPlayerNum: ['number', false, -1],
    adventureCount: ['number', false, 2],
    playDirection: ['number', false, 1]
  },
  collections: {
    players: AmpersandCollection.extend({
      model: Player
    }),
    adventures: AmpersandCollection.extend({
      __name__: 'Adventures',
      model: Adventure,
      toString: function() {
        return this.__name__ + '[' + this.length + ':' + this.map(function(adventure) {
            return adventure.toString();
          }).join('; ') + ']';
      }
    }),
    mainDeck: CardDeck,
    adventureDeck: AdventureDeck,
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
    }
  },
  addPlayer: function(player) {
    this.players.add(player);
    player.addedToGame(this);
    this.trigger(EVENTS.GAME_PLAYER_ADD, player, this);
  },
  setup: function() {
    // initial deal
    for(var i = 0; i < this.startingHandSize; i++) {
      this.players.each(function(player) {
        player.addToHand(this.mainDeck.draw());
      }, this);
    }
    // pile(s)
    this.piles.reset();
    for(var pileN = 1; pileN <= this.pileCount; pileN++) {
      this.piles.add(new CardDeck([this.mainDeck.draw()]));
    }
    // adventures
    this.adventures.reset();
    for(var adventureN = 1; adventureN <= this.adventureCount && adventureN <= this.adventureDeck.length; adventureN++) {
      var adventure = this.adventureDeck.draw(Adventure);
      this.adventures.add(adventure.attributes); // wtf is this hackery?
      adventure.addToGame(this);
    }
  },
  startTurn: function() {
    this.currentPlayer.on(EVENTS.TURN_FINISH, this.finishTurn, this);
    this.trigger(EVENTS.TURN_START, this.currentPlayer, this);
  },
  finishTurn: function() {
    console.log('finishTurn', this.currentPlayer.name);
    this.currentPlayer.off(EVENTS.TURN_FINISH);
    this.trigger(EVENTS.TURN_FINISH, this.currentPlayer);
    this.currentPlayerNum = this.nextPlayerNum;
    this.startTurn();
  },
  finishGame: function() {
    console.log('finishGame', this.currentPlayer.name);
    this.trigger(EVENTS.TURN_FINISH, this.currentPlayer);
    this.trigger(EVENTS.GAME_FINISH);
    this.cleanUp();
  },
  abortGame: function() {
    console.log('abortGame');
    this.trigger(EVENTS.TURN_FINISH, this.currentPlayer);
    this.trigger(EVENTS.GAME_ABORT);
    this.cleanUp();
  },
  cleanUp: function() {
    this.players.each(function(player) {
      player.off(null, null, this);
    });
  },
  startGame: function() {
    console.log(this.__name__, 'startGame');
    this.currentPlayerNum = 0;
    this.players.each(function(player) {
      player.on(EVENTS.GAME_FINISH, this.finishGame, this);
    }, this);
    this.trigger(EVENTS.GAME_START);
    this.startTurn();
  },
  isWild: function(card) {
    var result = false;
    this.adventures.each(function(adventure) {
      if (adventure.isWild) result = result || adventure.isWild(card, this);
    }, this);
    return result;
  },
  couldPlayOn: function(card) {
    var isWild = this.isWild(card);
    var faces = card.faceTypes;
    return this.piles.filter(function(pile) {
      if (isWild) return true;
      var topCard = pile.top();
      this.adventures.each(function(adventure) {
        if (adventure.masqueradeAction) topCard = adventure.masqueradeAction(topCard) || topCard;
      }, this);
      for (var faceN = 0; faceN < faces.length; faceN++) {
        if (topCard.hasType(faces[faceN])) {
          var couldPlay = true;
          this.adventures.each(function(adventure) {
            if (adventure.blockPlay && adventure.blockPlay(card, pile, this)) couldPlay = false;
          }, this);
          if (couldPlay) return true;
        }
      }
      return false;
    }, this);
  },
  playCard: function(card, pile, player) {
    console.log('playCard', player.name, card.toString(), pile.top().toString());
    pile.add(card);
    this.adventures.each(function(adventure) {
      if (adventure.playCard) adventure.playCard(card, pile, player, this);
    }, this);
    //console.log(pile.toString());
  },
  shuffleMainDeck: function() {
    this.mainDeck.shuffle();
    this.trigger(EVENTS.DECK_SHUFFLE);
  },
  drawCard: function(player) {
    var card = this.mainDeck.draw();
    if (!card) { // replenish decks
      console.log('replenishing');
      this.piles.each(function(pile) {
        var topCard = pile.take();
        this.mainDeck.add(pile.models);
        pile.reset([topCard]);
      }, this);
      console.log(this.piles.toString());
      this.shuffleMainDeck();
      card = this.mainDeck.draw();
    }
    if (!card) { // no more cards!
      this.abortGame();
      return null;
    }
    console.log('drawCard', player.name, card.toString());
    this.trigger(EVENTS.DECK_DRAW);
    return card;
  },
  reversePlayOrder: function() {
    var was = this.nextPlayer.name;
    this.playDirection = -this.playDirection;
    console.log('reversePlayDirection was:', was, 'now:', this.nextPlayer.name);
    this.trigger(EVENTS.GAME_PLAY_REVERSE);
  },
  addCardToMainDeck: function(card) {
    this.mainDeck.addBottom(card);
    this.trigger(EVENTS.DECK_ADD);
  }
});

Game.prototype.EVENTS = EVENTS;