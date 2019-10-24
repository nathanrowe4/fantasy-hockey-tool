const mongoose = require('mongoose')
const categoriesModule = require('../modules/categories')

const playerSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    trim: true
  },
  Team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  G: {
    type: Number,
    required: true,
    minimum: 0
  },
  A: {
    type: Number,
    required: true,
    minimum: 0
  },
  PLUSMINUS: {
    type: Number,
    required: true
  },
  PIM: {
    type: Number,
    required: true,
    minimum: 0
  },
  SOG: {
    type: Number,
    required: true,
    minimum: 0
  },
  PPP: {
    type: Number,
    required: true,
    minimum: 0
  },
  HITS: {
    type: Number,
    required: true,
    minimum: 0
  },
  FOW: {
    type: Number,
    required: true,
    minimum: 0
  }
}, {
  collection: 'dobber'
})

playerSchema.statics.getStats = (player) => {
  var playerStats = {}
  const categories = categoriesModule.getCategories()
  var playerJSON = player.toJSON()

  for(var key in playerJSON) {
    if(playerJSON.hasOwnProperty(key) && categories.includes(key)) {
      playerStats[key] = playerJSON[key]
    }
  }

  return playerStats
}

const Player = mongoose.model('Player', playerSchema)

module.exports = Player
