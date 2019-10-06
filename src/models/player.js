const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
  Player: {
    type: String,
    required: true,
    trim: true
  },
  Owner: {
    type: String,
    required: true,
    trim: true
  },
  G: {
    type: Number,
    required: true
  },
  A: {
    type: Number,
    required: true
  },
  PLUSMINUS: {
    type: Number,
    required: true
  },
  PIM: {
    type: Number,
    required: true
  },
  SOG: {
    type: Number,
    required: true
  },
  PPP: {
    type: Number,
    required: true
  },
  HITS: {
    type: Number,
    required: true
  },
  FOW: {
    type: Number,
    required: true
  }
})

const Player = mongoose.model('Player', playerSchema)

module.exports = Player
