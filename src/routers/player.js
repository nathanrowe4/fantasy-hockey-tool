const express = require('express');
const bodyParser = require('body-parser');
const stats = require('simple-statistics');

const categoriesModule = require('../modules/categories');
const queryModule = require('../modules/query');
const nhlApiModule = require('../modules/nhlApi');

const Player = require('../models/player');
const ztable = require('ztable');

const router = express.Router();
const jsonParser = bodyParser.json();

/**
 * Helper function to get player from player-projections collection
 * @param {Object} query - query to use for mongodb find
 */
async function getPlayerFromDatabase(query) {
  let player = undefined;

  if (query.hasOwnProperty('id')) {
    player = await Player.findById(query.id).lean();
  } else {
    player = await Player.findOne(query).lean();
  }

  return player;
}

/**
 * Helper function to return player averages and standard deviations
 * @param {Object} query - query to use to get correct population for data
 * @return {Object}
 */
async function getPlayerAveragesAndStandardDeviations(query) {
  const averageFilter = Player.getGroupFilter(null, 'avg');
  const standardDeviationFilter = Player.getGroupFilter(null, 'stdDevPop');

  const matchFilter = {
    $match: query || queryModule.getAvailablePlayersQuery(),
  };

  const playerAverages = await Player.aggregate([
    matchFilter,
    averageFilter,
  ]);

  const playerStandardDeviations = await Player.aggregate([
    matchFilter,
    standardDeviationFilter,
  ]);

  const playerData = {
    avg: playerAverages,
    std: playerStandardDeviations,
  };

  return playerData;
}

/**
 * Helper function to get percentiles
 * @param {Object} player - the player document
 * @param {Object} populationQuery - query to calculate population statistics
 * @return {Object}
 */
async function getPlayerPercentiles(player, populationQuery) {
  const populationData =
    await getPlayerAveragesAndStandardDeviations(populationQuery);

  const percentiles = {
    Name: player.Name,
  };

  const categories = categoriesModule.getCategories();

  categories.forEach(function(category) {
    if (populationData['avg'][0] && populationData['std'][0]) {
      const zscore = stats.zScore(player[category],
          populationData['avg'][0][category],
          populationData['std'][0][category]);
      percentiles[category] = ztable(zscore) * 100;
    }
  });

  return percentiles;
}

// GET: Get player by id
router.get('/players/:id', jsonParser, async (req, res) => {
  try {
    const playerProjections = await getPlayerFromDatabase(req.params);

    if (!playerProjections) {
      throw new Error();
    }

    const playerSeasonStats =
      await nhlApiModule.getPlayerSeasonStats(playerProjections.Name);
    const playerForecastedStats =
      await nhlApiModule.getPlayerStatsPace(playerProjections.Name);
    const playerAdjustedStats =
      await nhlApiModule.getPlayerAdjustedGoals(playerProjections.Name);

    res.send({
      playerProjections,
      playerSeasonStats,
      playerForecastedStats,
      playerAdjustedStats,
    });
  } catch (error) {
    res.status(404).send();
  }
});

// GET: Get player by parameter in body
router.get('/players', jsonParser, async (req, res) => {
  try {
    const playerProjections = await getPlayerFromDatabase(req.body);

    if (!playerProjections) {
      throw new Error();
    }

    const playerSeasonStats =
      await nhlApiModule.getPlayerSeasonStats(playerProjections.Name);
    const playerForecastedStats =
      await nhlApiModule.getPlayerStatsPace(playerProjections.Name);
    const playerAdjustedStats =
      await nhlApiModule.getPlayerAdjustedGoals(playerProjections.Name);

    res.send({
      playerProjections,
      playerSeasonStats,
      playerForecastedStats,
      playerAdjustedStats,
    });
  } catch (error) {
    res.status(404).send();
  }
});

// GET: Get top players for category
router.get('/playerLeaders', jsonParser, async (req, res) => {
  try {
    const categories = categoriesModule.getCategories();

    if (!categories.includes(req.body.category)) {
      throw new Error();
    }

    const sortQuery = {};
    sortQuery[req.body.category] = -1;

    const players = await Player.find(req.body.playerFilter).
        limit(req.body.numPlayers).
        sort(sortQuery).
        lean();

    if (!players) {
      throw new Error();
    }

    res.send(players);
  } catch (error) {
    res.status(404).send(error);
  }
});

// GET: Compare players by parameter in body
router.get('/comparePlayers', jsonParser, async (req, res) => {
  try {
    const keys = Object.keys(req.body);

    // iterate through body arguments
    for (let count = 0; count < keys.length; count++) {
      const key = keys[count];

      // create query for provided fields in body
      const query = {};
      query[key] = {$in: [req.body[key][0], req.body[key][1]]};

      // query database
      const players = await Player.find(query).lean();

      if (players && players.length == 2) {
        const comparison = Player.getDifference(players);
        res.send({players, comparison});
      }
    }

    throw new Error();
  } catch (error) {
    res.status(404).send(error);
  }
});

// GET: Get players that meet minimum stat requirements
router.get('/playerFilter', jsonParser, async (req, res) => {
  try {
    const query = {};
    const categories = Object.keys(req.body);

    categories.forEach(function(category) {
      query[category] = {$gt: req.body[category]};
    });

    const players = await Player.find(query).lean();

    if (!players) {
      throw new Error();
    }

    res.send(players);
  } catch (error) {
    res.status(404).send();
  }
});

// GET: Get percentile scores for each category
router.get('/playerPercentile', async (req, res) => {
  try {
    const player = await getPlayerFromDatabase(req.body.playerQuery);

    if (!player) {
      throw new Error();
    }

    const percentiles =
      await getPlayerPercentiles(player, req.body.populationQuery);

    res.send(percentiles);
  } catch (error) {
    res.status(404).send();
  }
});

// GET: Get population-wide statistics
router.get('/populationStatistics', async (req, res) => {
  try {
    const filter = Player.getGroupFilter(null, 'sum');

    let total = await Player.aggregate([
      filter,
    ]);

    let available = await Player.aggregate([
      {
        $match: queryModule.getAvailablePlayersQuery(),
      }, filter,
    ]);

    total = total[0];
    available = available[0];

    const percentAvailable = {};
    const categories = categoriesModule.getCategories();

    categories.forEach(function(category) {
      percentAvailable[category] = available[category] / total[category] * 100;
    });

    res.send({
      total,
      available,
      percentAvailable,
    });
  } catch (error) {
    res.status(404).send(error);
  }
});

// GET: Get PDF for specified categories
router.get('/categoryPdf', jsonParser, async (req, res) => {
  try {
    let categoriesArray = await Player.aggregate([
      Player.getGroupFilter(null, 'push'),
    ]);

    categoriesArray = categoriesArray[0];

    const PDF = {};
    const categories = categoriesModule.getCategories();

    categories.forEach(function(category) {
      PDF[category] = stats.kernelDensityEstimation(categoriesArray[category]);
    });

    res.send(PDF);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;
