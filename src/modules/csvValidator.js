const csv = require('csv-parser');
const fs = require('fs');
const Validator = require('fastest-validator');

const validator = new Validator();

const csvValidatorModule = (function() {
  const _playerObjSchema = {
    Name: {
      type: 'string',
      min: 3,
    },
    Team: {
      type: 'string',
    },
  };

  /**
   * Function to ensure player object types and values are valid
   * @param {Object} playerObj - query to use to get correct population for data
   * @return {Boolean}
   */
  function _playerObjIsValid(playerObj) {
    return validator.validate(playerObj, _playerObjSchema) === true;
  }

  /**
   * Function to ensure player projections csv is valid
   * @param {String} csvFilePath - path to csv file
   * @return {Boolean}
   */
  async function isValid(csvFilePath) {
    let isValid = true;

    const promise = new Promise((resolve) => {
      fs.createReadStream(csvFilePath)
          .pipe(csv())
          .on('data', function(player) {
            if (!_playerObjIsValid(player)) {
              isValid = false;
            }
          })
          .on('end', resolve);
    });

    await promise;

    return isValid;
  }

  return {
    isValid: isValid,
  };
}());

module.exports = csvValidatorModule;
