const express = require('express')
const Player = require('../models/player')

const router = express.Router()

router.get('/player/:id', async (req, res) => {
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

module.exports = router
