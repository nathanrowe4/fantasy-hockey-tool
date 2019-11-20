const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

const teamSchema = new mongoose.Schema({
  Manager: {
    type: String,
    required: true,
    trim: true,
  },
  Players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    autopopulate: true,
  }],
  Name: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  collection: 'teams',
});

teamSchema.plugin(autopopulate);

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
