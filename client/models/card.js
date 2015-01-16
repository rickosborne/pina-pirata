var AmpersandState = require('ampersand-state');
var _ = require('underscore');

var faceData = [
  [ 'RABBIT',   0x0001, 'Rabbit' ],
  [ 'PARROT',   0x0002, 'Parrot' ],
  [ 'MANDRILL', 0x0004, 'Monkey' ],
  [ 'OCTOPUS',  0x0008, 'Octopus' ],
  [ 'TIGER',    0x0010, 'Tiger' ],
  [ 'PENGUIN',  0x0020, 'Penguin' ],
  [ 'CROC',     0x0040, 'Crocodile' ],
  [ 'RAT',      0x0080, 'Rat' ],
  [ 'TURTLE',   0x0100, 'Turtle' ],
  [ 'WALRUS',   0x0200, 'Walrus' ]
];

var FACES = {};
var FACE_NAMES = {};
_(faceData).each(function(data) {
  FACES[data[0]] = data[1];
  FACE_NAMES[data[0]] = data[2];
});


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
          if (this.hasType(typeCode)) result.push(typeName.toLowerCase());
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
Card.prototype.WILD = _(FACES).reduce(function(acc, val) { return acc + val; }, 0);
Card.prototype.FACE_STRINGS = _.invert(FACES);
Card.prototype.FACE_NAMES = FACE_NAMES;

