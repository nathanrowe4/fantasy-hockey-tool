const express = require('express')
const Player = require('../models/player')

const router = express.Router()

// GET: Get player by id
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

// GET: Get player by parameter in body
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
