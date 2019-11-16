const Redis = require('ioredis');
const pino = require('pino')();

const redisCacheModule = (function() {
  // Connect to redis docker container
  const cache = new Redis({
    host: 'fht-cache',
    db: 0,
  });

  cache.on('connect', function() {
    pino.info('Redis cache connected successfully.');
  });

  /**
  * Function to get Player ID for NHL API
  * @param {String} playerName - name of player
  * @return {String}
  */
  async function getPlayerId(playerName) {
    try {
      const keyExists = await cache.exists(playerName);

      // get player id if available in cache
      if (keyExists === 1) {
        return await cache.get(playerName);
      } else {
        return 0;
      }
    } catch (error) {
      pino.error(error);
    }
  }

  /**
   * function to set Player ID for NHL API
   * @param {String} playerName - name of player
   * @param {String} playerId - ID of player
   */
  function setPlayerId(playerName, playerId) {
    cache.set(playerName, playerId);
  }

  return {
    getPlayerId: getPlayerId,
    setPlayerId: setPlayerId,
  };
}());

module.exports = redisCacheModule;
