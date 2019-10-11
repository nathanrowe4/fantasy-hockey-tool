const express = require('express')
const Player = require('../models/player')

const router = express.Router()

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

router.get('players/:category', async (req, res) => {
  try {
    const category = req.params.category.toString()
    const players = await Player.findMany({}).sort({ category: -1 }).limit(10)

    if(!players) {
      throw new Error()
    }

    res.send(players)
  } catch(error) {
    res.status(404).send()
  }
})

router.get('players/:team', async (req, res) => {
  try {
    const players = await Player.findMany({ Owner: req.params.team.toString() })

    if(!players) {
      throw new Error()
    }

    res.send(players)
  } catch(error) {
    res.status(404).send()
  }
})

module.exports = router
