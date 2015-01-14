var AmpersandState = require('ampersand-state');
var Game = require('./game');
var _ = require('underscore');

var methodFromEvent = {};

var noop = function() {};

var titleCase = function(str) {
    return str.split('_').map(function(part) {
        if (part.length < 1) return '';
        if (part.length < 2) return part.toUpperCase();
        return part.substr(0, 1).toUpperCase() + part.substr(1).toLowerCase();
    }).join('');
};

_(Game.prototype.EVENTS).each(function(eventKey, eventName) {
    methodFromEvent[eventKey] = 'on' + titleCase(eventName);
});

module.exports = AmpersandState.extend({
    __name__: 'Watcher',
    props: {
        game: Game
    },
    initialize: function() {
        if (this.game) this.watch(this.game);
        this.on('change:game', function(model, game) {
            var previousGame = model.previousAttributes().game;
            if (previousGame) previousGame.off(null, null, model);
            if (game) model.watch(game);
        });
    },
    watch: function(game) {
        _(methodFromEvent).each(function(methodName, eventKey) {
            game.on(eventKey, this[methodName], this);
        }, this);
    }
});