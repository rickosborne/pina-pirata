var AmpersandCollection = require('ampersand-collection');
var _ = require('underscore');

module.exports = AmpersandCollection.extend({
  __name__: 'Deck',
  shuffle: function() {
    this.reset(_.shuffle(this.models));
  },
  toString: function() {
    return this.__name__ + '[' + this.length + ':' + this.map(function(c) { return c.toString(); }).join(', ') + ']';
  },
  draw: function() {
    //console.log(this.__name__, 'draw');
    var item = this.peek();
    if (item) this.remove(item);
    return item;
  },
  peek: function() {
    return this.at(0);
  },
  top: function() {
    return this.at(this.length - 1);
  },
  take: function() {
    var item = this.top();
    if (item) this.remove(item);
    return item;
  },
  drawRandom: function() {
    return (this.length < 1) ? null : this.remove(this.at(Math.floor(Math.random() * this.length)));
  },
  addBottom: function(item) {
    this.add(item, {at: 0})
  }
});