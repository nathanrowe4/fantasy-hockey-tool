var queryModule = (function() {
  'use strict'
  var _availablePlayers = { Team: "" }

  function getAvailablePlayersQuery() {
    return _availablePlayers
  }

  return {
    getAvailablePlayersQuery: getAvailablePlayersQuery
  }
}())

module.exports = queryModule
