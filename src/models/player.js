const mongoose = require('mongoose')
const categoriesModule = require('../modules/categories')

function addCategories(playerObject) {
  const categories = categoriesModule.getCategories()

  categories.forEach(function (category) {
    playerObject[category] = {
      type: Number,
      required: true
    }
  })
}

var playerObj = addCategories({
  Name: {
    type: String,
    required: true,
    trim: true
  },
  Team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }
})

const playerSchema = new mongoose.Schema(playerObj, {
  collection: 'dobber'
})

playerSchema.statics.getStats = (player) => {
  var playerStats = {}
  const categories = categoriesModule.getCategories()

  for(var key in player) {
    if(player.hasOwnProperty(key) && categories.includes(key)) {
      playerStats[key] = player[key]
    }
  }

  return playerStats
}

const Player = mongoose.model('Player', playerSchema)

module.exports = Player
