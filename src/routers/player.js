const express = require('express')
const Player = require('../models/player')

const router = express.Router()

// GET player by id
router.get('/players/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)

    if(!player) {
      throw new Error()
    }

    res.send(player)
  } catch(error) {
    res.status(404).send()
  }
})

// GET player by any parameter
router.get('/players', async (req, res) => {
  try {
    const player = await Player.findOne( req.body )

    if(!player) {
      throw new Error()
    }

    res.send(player)
  } catch(error) {
    res.status(404).send()
  }
})

module.exports = router
