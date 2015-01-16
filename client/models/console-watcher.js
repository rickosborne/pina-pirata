var Watcher = require('./watcher');

var print = function() {
    return console.log(Array.prototype.slice.apply(arguments).join(' '));
};

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
    onGameFinish: function (winners) {
        if (!winners || winners.length === 0) print("The game is a draw.");
        else if (winners.length > 1) print("Winners:", winners.map(function(winner) { return winner.name; })).join(", ");
        else print(winners[0].name, "wins the game!");
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
    onCardPlay: function(card, previousTop, pile, player) {
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
    },
    onCardDiscard: function(card, player) {
        print(player.name, "puts the", card.toString(), "in the discard pile.");
    },
    onCardTransfer: function(card, toPlayer, fromPlayer) {
        print(fromPlayer.name, "gives", card.toString(), "to", toPlayer.name);
    },
    onCardReveal: function(card, player) {
        print(player.name, "reveals", card.toString(), "to all players.");
    },
    onCardTakeback: function(card, pile, player) {
        print(player.name, "takes", card.toString(), "back from pile", pile.setIndex, "and now has", player.hand.length, "in hand.");
    }
});