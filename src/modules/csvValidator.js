const csv = require('csv-parser');
const fs = require('fs');

const csvValidatorModule = (function() {
  /**
   * Function to ensure player object types and values are valid
   * @param {Object} playerObj - query to use to get correct population for data
   * @return {Boolean}
   */
  function _playerObjIsValid(playerObj) {
    return false;
  }

  /**
   * Function to ensure player projections csv is valid
   * @param {String} csvFilePath - path to csv file
   * @return {Boolean}
   */
  async function isValid(csvFilePath) {
    let isValid = true;

    await fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', function(player) {
          if (!_playerObjIsValid(player)) {
            isValid = false;
          }
        });

    return isValid;
  }

  return {
    isValid: isValid,
  };
}());

module.exports = csvValidatorModule;
