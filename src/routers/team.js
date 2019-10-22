const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const Team = require('../models/team')

const router = express.Router()
var jsonParser = bodyParser.json()

// GET: Create team
router.post('/team', jsonParser, async (req, res) => {
  const team = new Team(req.body)

  try {
    await team.save()
    res.status(201).send(team)
  } catch(error) {
    res.status(500).send(error)
  }
})

// GET: Get total team projections by name
router.get('/team/projections', jsonParser, async (req, res) => {
  try {
    const team = await Team.findOne({Name: req.body.teamName})

    if(!team) {
      throw new Error()
    }

    const teamProjections = {
      "G": 0,
      "A": 0,
      "PLUSMINUS": 0,
      "PIM": 0,
      "SOG": 0,
      "PPP": 0,
      "HITS": 0,
      "FOW": 0
    }

    team.Players.forEach(function (playerId) {
      var player = Player.findById(playerId)

      var categories = Object.keys(player).filter(function (category) {
        //check if type is number
        //add to teamProjections object
      })
    })

    res.send(teamProjections)
  } catch(error) {
    res.status(404).send()
  }
})

// PUT: Add new player to team
router.put('/team/addPlayer', jsonParser, async (req, res) => {
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
router.put('/team/removePlayer',jsonParser, async (req, res) => {
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
router.put('/team/changeName', jsonParser, async (req, res) => {
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
