const express = require('express')
const bodyParser = require('body-parser')
const Player = require('../models/player')

const router = express.Router()
var jsonParser = bodyParser.json()

// GET helper function
async function getPlayerFromDatabase(query) {
  var player = undefined

  if(query.hasOwnProperty('id')) {
    player = await Player.findById(query.id)
  } else {
    player = await Player.findOne(query)
  }

  return player
}

// Helper function to calculate difference of 2 players stats
function getDifference(players) {
  const categories = ['G', 'A', 'PIM', 'PLUSMINUS', 'PIM', 'SOG', 'PPP', 'HITS', 'FOW']
  var differenceObj = {}

  for(var count = 0; count < categories.length; count++) {
    var category = categories[count]
    differenceObj[category] = players[0][category] - players[1][category]
  }

  return differenceObj
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
router.get('/playerLeaders', async (req, res) => {
  try {
    const category = req.query.category.toString()
    const players = await Player.find({})
      .sort({category: -1})
      .limit(req.query.numPlayers)

    if(!players) {
      throw new Error()
    }

      res.send(players)
    } catch(error) {
      res.status(404).send()
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
      const players = await Player.find(query)

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

    const players = await Player.find(query);

    if(!players) {
      throw new Error()
    }

      res.send(players)
  } catch(error) {
    res.status(404).send()
  }
})

module.exports = router
