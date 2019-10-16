const express = require('express')
const Player = require('../models/player')

const router = express.Router()

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

// GET: Get player by id
router.get('/players/:id', async (req, res) => {
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
router.get('/players', async (req, res) => {
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

module.exports = router
