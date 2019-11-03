const queryModule = (function() {
  'use strict';
  const _availablePlayers = {Team: ''};

  /**
   * Helper function to get available players query
   * @return {Object}
   */
  function getAvailablePlayersQuery() {
    return _availablePlayers;
  }

  return {
    getAvailablePlayersQuery: getAvailablePlayersQuery,
  };
}());

module.exports = queryModule;
