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

playerSchema.statics.getGroupFilter = (id, aggregator) => {
  const categories = categoriesModule.getCategories()

  var filter = {
    "$group": {
      "_id": id
    }
  }

  const aggregatorString = "$" + aggregator

  categories.forEach(function (category) {
    var lookup = "$" + category
    filter["$group"][category] = {}
    filter["$group"][category][aggregatorString] = lookup
  })

  return filter
}

playerSchema.statics.getDifference = (players) => {
  const categories = categoriesModule.getCategories()
  var differenceObj = {}

  categories.forEach(function (category) {
    differenceObj[category] = players[0][category] - players[1][category]
  })

  return differenceObj
}

const Player = mongoose.model('Player', playerSchema)

module.exports = Player
