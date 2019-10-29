const express = require('express')
const bodyParser = require('body-parser')
const stats = require('simple-statistics')

const categoriesModule = require('../modules/categories')
const queryModule = require('../modules/query')

const Player = require('../models/player')
const ztable = require('ztable')

const router = express.Router()
var jsonParser = bodyParser.json()

// GET helper function
async function getPlayerFromDatabase(query) {
  var player = undefined

  if(query.hasOwnProperty('id')) {
    player = await Player.findById(query.id).lean()
  } else {
    player = await Player.findOne(query).lean()
  }

  return player
}

// Helper function to calculate difference of 2 players stats
function getDifference(players) {
  const categories = categoriesModule.getCategories()
  var differenceObj = {}

  categories.forEach(function (category) {
    differenceObj[category] = players[0][category] - players[1][category]
  })

  return differenceObj
}
// Helper function to return $group filter
function getGroupFilter(id, aggregator) {
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

// Helper function to return player averages
async function getPlayerAveragesAndStandardDeviations(query) {
  var averageFilter = getGroupFilter(null, "avg")
  var standardDeviationFilter = getGroupFilter(null, "stdDevPop")

  var matchFilter = {
    $match: query || queryModule.getAvailablePlayersQuery()
  }

  var playerAverages = await Player.aggregate([
    matchFilter,
    averageFilter
  ])

  var playerStandardDeviations = await Player.aggregate([
    matchFilter,
    standardDeviationFilter
  ])

  var playerData = {
    avg: playerAverages,
    std: playerStandardDeviations
  }

  return playerData
}

// Helper function to get percentiles
async function getPlayerPercentiles(player, populationQuery) {
  var populationData = await getPlayerAveragesAndStandardDeviations(populationQuery)

  var percentiles = {
    Name: player.Name
  }

  var categories = categoriesModule.getCategories()

  categories.forEach(function (category) {
    if(populationData["avg"][0] && populationData["std"][0]) {
      var zscore = stats.zScore(player[category], populationData["avg"][0][category], populationData["std"][0][category])
      percentiles[category] = ztable(zscore) * 100
    }
  })

  return percentiles
}

// GET: Get player by id
router.get('/players/:id', jsonParser, async (req, res) => {
  try {
    const player = await getPlayerFromDatabase(req.params)

    if(!player) {
      throw new Error()
    }

    res.send(player)
  } catch(error) {
    res.status(404).send()
  }
})

// GET: Get player by parameter in body
router.get('/players', jsonParser, async (req, res) => {
  try {
    const player = await getPlayerFromDatabase(req.body)

    if(!player) {
      throw new Error()
    }

    res.send(player)
  } catch(error) {
    res.status(404).send()
  }
})

// GET: Get top players for category
router.get('/playerLeaders', jsonParser, async (req, res) => {
  try {
    var categories = categoriesModule.getCategories()

    if(!categories.includes(req.body.category)) {
      throw new Error()
    }

    var sortQuery = {}
    sortQuery[req.body.category] = -1

    const players = await Player.find(req.body.playerFilter).
      limit(req.body.numPlayers).
      sort(sortQuery).
      lean()

    if(!players) {
      throw new Error()
    }

    res.send(players)
  } catch(error) {
    res.status(404).send(error)
  }
})

// GET: Compare players by parameter in body
router.get('/comparePlayers', jsonParser, async (req, res) => {
  try {
    const keys = Object.keys(req.body)

    // iterate through body arguments
    for(var count = 0; count < keys.length; count++) {
      const key = keys[count]

      // create query for provided fields in body
      var query = {}
      query[key] = {$in: [req.body[key][0], req.body[key][1]]}

      // query database
      const players = await Player.find(query).lean()

      if(players && players.length == 2) {
        const comparison = getDifference(players)
        res.send({players, comparison})
      }
    }

    throw new Error()
  } catch(error) {
    res.status(404).send(error)
  }
})

// GET: Get players that meet minimum stat requirements
router.get('/playerFilter', jsonParser, async (req, res) => {
  try {
    var query = {}
    var categories = Object.keys(req.body)

    categories.forEach(function (category) {
      query[category] = {$gt: req.body[category]}
    })

    const players = await Player.find(query).lean()

    if(!players) {
      throw new Error()
    }

      res.send(players)
  } catch(error) {
    res.status(404).send()
  }
})

// GET: Get percentile scores for each category
router.get('/playerPercentile', async (req, res) => {
  try {
    const player = await getPlayerFromDatabase(req.body.playerQuery)

    if(!player) {
      throw new Error()
    }

    var percentiles = await getPlayerPercentiles(player, req.body.populationQuery)

    res.send(percentiles)
  } catch (error) {
    res.status(404).send()
  }
})

// GET: Get population-wide statistics
router.get('/populationStatistics', async (req, res) => {
  try {
    const filter = getGroupFilter(null, "sum")

    var total = await Player.aggregate([
      filter
    ])

    var available = await Player.aggregate([
      {
        $match: queryModule.getAvailablePlayersQuery()
      }, filter
    ])

    total = total[0]
    available = available[0]

    res.send({total, available})
  } catch (error) {
    res.status(404).send(error)
  }
})

// GET: Get PDF for specified categories
router.get('/categoryPdf', jsonParser, async (req, res) => {
  try {
    var categoriesArray = await Player.aggregate([
      getGroupFilter(null, "push")
    ])

    categoriesArray = categoriesArray[0]

    var PDF = {}
    var categories = categoriesModule.getCategories()

    categories.forEach(function (category) {
      PDF[category] = stats.kernelDensityEstimation(categoriesArray[category])
    })

    res.send(PDF)
  } catch (error) {
    res.status(404).send()
  }
})

module.exports = router
