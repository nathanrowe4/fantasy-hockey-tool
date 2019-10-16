const express = require('express')
const mongoose = require('mongoose')
const Team = require('../models/team')

const router = express.Router()

// GET team by parameter
router.post('/team', async (req, res) => {
  const team = new Team(req.body)

  try {
    await team.save()
    res.status(201).send(team)
  } catch(error) {
    res.status(500).send(error)
  }
})

// PUT new player on team
router.put('/team/addPlayer', async (req, res) => {
  try {
    const teamId = mongoose.Types.ObjectId(req.body.teamId)
    const newPlayerId = mongoose.Types.ObjectId(req.body.playerId)

    const team = await Team.findOneAndUpdate({ _id: teamId },
      {$push: { Players: newPlayerId }}, {useFindAndModify: false})

    if(!team) {
      throw new Error()
    }

    res.send(team)
  } catch(error) {
    res.status(404).send(error)
  }
})

router.put('/team/removePlayer', async (req, res) => {
  try {
    const teamId = mongoose.Types.ObjectId(req.body.teamId)
    const playerToRemoveId = mongoose.Types.ObjectId(req.body.playerId)

    const team = await Team.findOneAndUpdate({ _id: teamId },
      {$pull: { Players: playerToRemoveId }}, {useFindAndModify: false})

    if(!team) {
      throw new Error()
    }

    res.send(team)
  } catch(error) {
    res.status(404).send(error)
  }
})

router.put('/team/changeName', async (req, res) => {
  try {
    const teamId = mongoose.Types.ObjectId(req.body.teamId)

    const team = await Team.findOneAndUpdate({ _id: teamId },
      {$set: { Name: req.body.newTeamName }}, {useFindAndModify: false})

    if(!team) {
      throw new Error()
    }

    res.send(team)
  } catch(error) {
    res.status(404).send(error)
  }
})

module.exports = router
