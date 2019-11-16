const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const categoriesModule = require('../modules/categories');

/**
 * Helper function to add categories to player model
 * @param {Object} playerObject - playerObject to add categories to
 */
function addCategories(playerObject) {
  const categories = categoriesModule.getCategories();

  categories.forEach(function(category) {
    playerObject[category] = {
      type: Number,
      required: true,
    };
  });
}

const playerObj = addCategories({
  Name: {
    type: String,
    required: true,
    trim: true,
    es_indexed: true,
  },
  Team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
});

const playerSchema = new mongoose.Schema(playerObj, {
  collection: 'dobber',
});

playerSchema.plugin(mongoosastic, {
  host: 'fht-search',
  port: 9200,
  curlDebug: true,
});

playerSchema.statics.getStats = (player) => {
  const playerStats = {};
  const categories = categoriesModule.getCategories();

  for (const key in player) {
    if (player.hasOwnProperty(key) && categories.includes(key)) {
      playerStats[key] = player[key];
    }
  }

  return playerStats;
};

playerSchema.statics.getGroupFilter = (id, aggregator) => {
  const categories = categoriesModule.getCategories();

  const filter = {
    '$group': {
      '_id': id,
    },
  };

  const aggregatorString = '$' + aggregator;

  categories.forEach(function(category) {
    const lookup = '$' + category;
    filter['$group'][category] = {};
    filter['$group'][category][aggregatorString] = lookup;
  });

  return filter;
};

playerSchema.statics.getDifference = (players) => {
  const categories = categoriesModule.getCategories();
  const differenceObj = {};

  categories.forEach(function(category) {
    differenceObj[category] = players[0][category] - players[1][category];
  });

  return differenceObj;
};

const Player = mongoose.model('Player', playerSchema);
const stream = Player.synchronize();
let count = 0;

stream.on('data', function(err, doc) {
  count++;
});
stream.on('close', function() {
  console.log('indexed ' + count + ' documents!');
});
stream.on('error', function(err) {
  console.log(err);
});

module.exports = Player;
