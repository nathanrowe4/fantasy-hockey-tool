const express = require('express')
const mongoose = require('mongoose')
const Team = require('../models/team')

const router = express.Router()

// GET: Get team by parameter in body
router.post('/team', async (req, res) => {
  const team = new Team(req.body)

  try {
    await team.save()
    res.status(201).send(team)
  } catch(error) {
    res.status(500).send(error)
  }
})

// PUT: Add new player to team
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

// PUT: Remove player from team by id
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

// PUT: Change team name by id
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
