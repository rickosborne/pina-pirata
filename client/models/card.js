var AmpersandState = require('ampersand-state');
var _ = require('underscore');

var FACES = {
  RABBIT:   0x0001,
  PARROT:   0x0002,
  MANDRILL: 0x0004,
  OCTOPUS:  0x0008,
  TIGER:    0x0010,
  PENGUIN:  0x0020,
  CROC:     0x0040,
  RAT:      0x0080,
  TURTLE:   0x0100,
  WALRUS:   0x0200
};

// var FACE_STRINGS = _.invert(FACES);

var Card = module.exports = AmpersandState.extend({
  props: {
    type: 'number'
  },
  derived: {
    faces: {
      deps: ['type'],
      fn: function() {
        var result = [];
        _(FACES).each(function(typeCode, typeName) {
          if (this.hasType(typeCode)) result.push(typeName);
        }, this);
        return result;
      }
    },
    faceTypes: {
      deps: ['type'],
      fn: function() {
        var result = [];
        _(FACES).each(function(typeCode) {
          if (this.hasType(typeCode)) result.push(typeCode);
        }, this);
        return result;
      }
    }
  },
  hasType: function(type) {
    return (this.type || 0) & type;
  },
  toString: function() {
    return 'Card[' + this.faces.join('|') + ']';
  }
});

Card.prototype.FACES = FACES;
