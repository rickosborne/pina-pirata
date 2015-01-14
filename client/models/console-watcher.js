var Watcher = require('./watcher');

var print = console.log;

module.exports = Watcher.extend({
    __name__: 'ConsoleWatcher',
    onTurnStart: function(player) {
        print(player.name, "is next to play.");
    },
    onTurnFinish: function(player) {
        print(player.name + "'s turn is over with", player.hand.length, "card" + (player.hand.length === 1 ? "" : "s"), "remaining.");
    },
    onGameStart: function() {
        print("Let the game begin!");
    },
    onGameFinish: function (winner) {
        if (winner) print(winner.name, "wins the game!");
        else print("The game is a draw.");
    },
    onGameAbort: function () {
        print("The game is a draw.");
    },
    onPlayerAdd: function (player) {
        print("A new player has joined:", player.name);
    },
    onPlayerDrop: function (player) {
        print(player.name, "has left the game.");
    },
    onPlayReverse: function (playDirection, nextPlayer) {
        print("The play direction reverses!", nextPlayer.name, "is next.");
    },
    onPlayCard: function(card, previousTop, pile, player) {
        var onto = previousTop ? previousTop.toString() : 'empty space';
        print(player.name, "plays", card.toString(), "onto pile", pile.setIndex + "'s", onto);
    },
    onDeckShuffle: function () {
        print("Shuffled the deck.");
    },
    onDeckReplenish: function() {
        print("Replenished the deck.");
    },
    onDeckDraw: function (card, player) {
        print(player.name, "drew a", card.toString());
    },
    onDeckAdd: function(card, player) {
        print(player.name, "puts a", card.toString(), "onto the deck.");
    },
    onDeckEmpty: function() {
        print("The draw pile ran out of cards!");
    },
    onAdventureAdd: function(adventure) {
        print("A new adventure has been revealed:", adventure.toString())
    },
    onAdventureApplies: function(adventure) {
        print(adventure.toString(), "applies!");
    },
    onDeckRevealed: function() {
        print("The top card of the draw pile is now face-up.");
    },
    onDeckHidden: function() {
        print("The top card of the draw pile is now face-down.");
    }
});