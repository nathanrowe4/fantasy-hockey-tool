const request = require('request-promise')
const categoriesModule = require('./categories')

var nhlApiModule = (function () {
	'use strict'

	const _baseUrl = 'https://statsapi.web.nhl.com/api/v1'
	const _playerUrl = _baseUrl + '/people'
	const _teamUrl = _baseUrl + '/teams'

	const _categoriesMap = {
		'G': 'goals',
		'A': 'assists',
		'PLUSMINUS': 'plusMinus',
		'PIM': 'pim',
		'SOG': 'shots',
		'PPP': 'powerPlayPoints',
		'HITS': 'hits'
	}

	async function _getPlayerId(playerName) {
		var data = await request.get({
			url: _teamUrl + '?expand=team.roster',
			json: true,
			headers: {'User-Agent': 'request'}
		}, (err, res, data) => {
			if (err) {
				console.log('Error: ' + err)
			} else if (res.statusCode !== 200) {
				console.log('Status: ' + res.statusCode)
			}
		});

    var playerId = -1

    data.teams.some(function (team) {
      team.roster.roster.some(function (player) {
        if(player.person.fullName === playerName) {
          playerId = player.person['id']
          return true
        }
      })

      if(playerId !== -1) {
        return true
      }
    })

    return playerId
	}

	async function getPlayerStats(playerName, statType) {
		var playerId = await _getPlayerId(playerName)

		var requestUrl = _playerUrl + '/' + playerId + '/stats?stats=' + statType

		var data = await request.get({
			url: requestUrl,
			json: true,
			headers: {'User-Agent': 'request'}
		}, (err, res, data) => {
			if (err) {
				console.log('Error: ' + err)
			} else if (res.statusCode !== 200) {
				console.log('Status: ' + res.statusCode)
			}
		})

    return data.stats[0].splits[0]
	}

	async function getPlayerStatsPace(playerName, numExpectedGames = 82) {
		var categories = categoriesModule.getCategories()

		var playerStats = await getPlayerStats(playerName, 'statsSingleSeason')

		var paceStats = {}

		categories.forEach(function (category) {
			var nhlApiCategory = _categoriesMap[category]
			paceStats[category] = playerStats.stat[nhlApiCategory] * numExpectedGames / playerStats.stat.games
		})

		return paceStats
	}

	async function getPlayerAdjustedGoals(playerName, numExpectedGames = 82) {
		var playerStats = await getPlayerStats(playerName, 'statsSingleSeason')
		var playerCareerStats = await getPlayerStats(playerName, 'careerRegularSeason')

		var adjustedGoals = playerStats.stat['goals'] * playerCareerStats.stat['shotPct'] / playerStats.stat['shotPct']
		var projAdjustedGoals = playerStats.stat['shots'] * numExpectedGames / playerStats.stat.games * playerCareerStats.stat['shotPct'] / 100

		return {
			adjustedGoals,
			projAdjustedGoals
		}
	}

	return {
		getPlayerStats: getPlayerStats,
		getPlayerStatsPace: getPlayerStatsPace,
		getPlayerAdjustedGoals: getPlayerAdjustedGoals
	}
}())

module.exports = nhlApiModule
