const breakoutModule = (function() {
  'use strict';

  const _breakoutByPosition = {
    'forward': 200,
    'exceptionalForward': 400,
    'defenseman': 400,
  };

  /**
   * Helper function to get number of games for player breakout
   * @param {String} position - player position
   * @param {Object} height - object containing feet and inches properties
   * @param {Number} weight - player weight
   * @return {Number}
   */
  function getPlayerBreakout(position, height, weight) {
    if (position === 'Forward') {
      if ((height.feet >= 6 && height.inches > 2) ||
        (height.feet <= 5 && height.inches < 10) ||
        weight < 171 || weight > 214) {
        return _breakoutByPosition['exceptionalForward'];
      } else {
        return _breakoutByPosition['forward'];
      }
    } else if (position === 'Defenseman') {
      return _breakoutByPosition['defenseman'];
    }

    return 0;
  }

  return {
    getPlayerBreakout: getPlayerBreakout,
  };
}());

module.exports = breakoutModule;
