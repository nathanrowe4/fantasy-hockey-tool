const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
  Manager: {
    type: String,
    required: true,
    trim: true
  },
  Players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }]
}
})

const Team = mongoose.model('Team', teamSchema)

module.exports = Team
