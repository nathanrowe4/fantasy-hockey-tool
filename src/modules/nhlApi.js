const request = require('request-promise');
const categoriesModule = require('./categories');
const breakoutModule = require('./breakout');

const nhlApiModule = (function() {
  'use strict';

  const _baseUrl = 'https://statsapi.web.nhl.com/api/v1';
  const _playerUrl = _baseUrl + '/people';
  const _teamUrl = _baseUrl + '/teams';

  const _categoriesMap = {
    'G': 'goals',
    'A': 'assists',
    'PLUSMINUS': 'plusMinus',
    'PIM': 'pim',
    'SOG': 'shots',
    'PPP': 'powerPlayPoints',
    'HITS': 'hits',
  };

  const _supportedCategories = Object.keys(_categoriesMap);

  /**
   * Function to get player id from api
   * @param {String} playerName - the name of the player
   * @return {Number}
   */
  async function _getPlayerId(playerName) {
    const data = await request.get({
      url: _teamUrl + '?expand=team.roster',
      json: true,
      headers: {'User-Agent': 'request'},
    }, (err, res, data) => {
      if (err) {
        console.log('Error: ' + err);
      } else if (res.statusCode !== 200) {
        console.log('Status: ' + res.statusCode);
      }
    });

    let playerId = -1;

    data.teams.some(function(team) {
      team.roster.roster.some(function(player) {
        if (player.person.fullName === playerName) {
          playerId = player.person['id'];
          return true;
        }
      });

      if (playerId !== -1) {
        return true;
      }
    });

    return playerId;
  }

  /**
   * Function to get player stats
   * @param {String} playerName - the name of the player
   * @param {String} statType - the stat type to retrieve from API
   * @return {Object}
   */
  async function _getPlayerStats(playerName, statType) {
    const playerId = await _getPlayerId(playerName);

    const requestUrl = _playerUrl + '/' + playerId + '/stats?stats=' + statType;

    const data = await request.get({
      url: requestUrl,
      json: true,
      headers: {'User-Agent': 'request'},
    }, (err, res, data) => {
      if (err) {
        console.log('Error: ' + err);
      } else if (res.statusCode !== 200) {
        console.log('Status: ' + res.statusCode);
      }
    });

    return data.stats[0].splits[0];
  }

  /**
   * Function to get player personal data
   * @param {String} playerName - the name of the player
   * @return {Object}
   */
  async function _getPlayerData(playerName) {
    const playerId = await _getPlayerId(playerName);

    const requestUrl = _playerUrl + '/' + playerId;

    const data = await request.get({
      url: requestUrl,
      json: true,
      headers: {'User-Agent': 'request'},
    }, (err, res, data) => {
      if (err) {
        console.log('Error: ' + err);
      } else if (res.statusCode !== 200) {
        console.log('Status: ' + res.statusCode);
      }
    });

    return data.people[0];
  }

  /**
   * Function to get player breakout threshold
   * @param {String} playerName - the name of the player
   * @return {Number}
   */
  async function _getBreakoutThreshold(playerName) {
    const playerData = await _getPlayerData(playerName);

    const height = {};

    height['feet'] = parseInt(playerData.height.split('\'')[0], 10);
    height['inches'] =
      parseInt(playerData.height.split(' ')[1].split('"')[0], 10);

    return breakoutModule.getPlayerBreakout(playerData.primaryPosition.type,
        height, playerData.weight);
  }

  /**
   * Function to get player season stats
   * @param {String} playerName - the name of the player
   * @return {Object}
   */
  async function getPlayerSeasonStats(playerName) {
    const playerStats = await _getPlayerStats(playerName, 'statsSingleSeason');

    const categories = categoriesModule.getCategories();

    const seasonStats = {};

    categories.forEach(function(category) {
      if (_supportedCategories.includes(category)) {
        const nhlApiCategory = _categoriesMap[category];
        seasonStats[category] = playerStats.stat[nhlApiCategory];
      }
    });

    return seasonStats;
  }

  /**
   * Function to get player pace stats
   * @param {String} playerName - the name of the player
   * @param {Number} numExpectedGames - the number of games to project for
   * @return {Object}
   */
  async function getPlayerStatsPace(playerName, numExpectedGames = 82) {
    const categories = categoriesModule.getCategories();

    const playerStats = await _getPlayerStats(playerName, 'statsSingleSeason');

    const paceStats = {};

    categories.forEach(function(category) {
      if (_supportedCategories.includes(category)) {
        const nhlApiCategory = _categoriesMap[category];
        paceStats[category] = playerStats.stat[nhlApiCategory] *
          numExpectedGames / playerStats.stat.games;
      }
    });

    return paceStats;
  }

  /**
   * Function to get player adjusted goals
   * @param {String} playerName - the name of the player
   * @param {Number} numExpectedGames - the number of games to adjust for
   * @return {Object}
   */
  async function getPlayerAdjustedGoals(playerName, numExpectedGames = 82) {
    const playerStats = await _getPlayerStats(playerName, 'statsSingleSeason');
    const playerCareerStats =
      await _getPlayerStats(playerName, 'careerRegularSeason');

    const adjustedGoals = playerStats.stat['goals'] *
      playerCareerStats.stat['shotPct'] / playerStats.stat['shotPct'];
    const projAdjustedGoals = playerStats.stat['shots'] *
      numExpectedGames / playerStats.stat.games *
      playerCareerStats.stat['shotPct'] / 100;

    return {
      adjustedGoals,
      projAdjustedGoals,
    };
  }

  /**
   * Function to get player breakout eligibility according to dobber's criteria
   * @param {String} playerName - the name of the player
   * @return {Object}
   */
  async function getBreakoutEligibility(playerName) {
    const careerPlayerStats =
      await _getPlayerStats(playerName, 'careerRegularSeason');
    const careerGamesPlayed = careerPlayerStats.stat['games'];

    const breakoutEligibility = {};

    const breakoutThreshold = await _getBreakoutThreshold(playerName);

    if (careerGamesPlayed > breakoutThreshold) {
      breakoutEligibility['isEligible'] = false;
      breakoutEligibility['gamesToEligibility'] = 0;
      breakoutEligibility['eligibleThisSeason'] = false;
    } else {
      breakoutEligibility['isEligible'] = true;
      const gamesToBreakout = breakoutThreshold - careerGamesPlayed;
      breakoutEligibility['gamesToBreakout'] = gamesToBreakout;
      breakoutEligibility['breakoutThisSeason'] = gamesToBreakout < 82;
    }

    return breakoutEligibility;
  }

  return {
    getPlayerSeasonStats: getPlayerSeasonStats,
    getPlayerStatsPace: getPlayerStatsPace,
    getPlayerAdjustedGoals: getPlayerAdjustedGoals,
    getBreakoutEligibility: getBreakoutEligibility,
  };
}());

module.exports = nhlApiModule;
