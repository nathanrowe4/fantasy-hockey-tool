const request = require('request-promise');
const cheerio = require('cheerio');

const icyDataModule = (function() {
  'use strict';

  const _url = 'http://www.naturalstattrick.com/playerteams.php?' +
    'fromseason=20192020&thruseason=20192020&stype=2&sit=all&score' +
    '=all&stdoi=std&rate=n&loc=B&toi=0&gpfilt=none&fd=&td=&tgp=410&lines' +
    '=single&draftteam=ALL';

  /**
     * Helper function to get adjusted assist projection
     * @param {Number} forecastedAssists - number of forecasted assists
     * @param {Number} assistsToDate - total number of assists this season
     * @param {Number} secondaryAssists - number of secondary assists
     * @param {Number} secondaryAssistRate - secondary assist rate
     * @return {Number}
     */
  function _getAdjustedAssists(forecastedAssists, assistsToDate,
      secondaryAssists, secondaryAssistRate) {
    return ((forecastedAssists / assistsToDate) *
        (assistsToDate - secondaryAssists) + 0.15 * secondaryAssists *
        (forecastedAssists / assistsToDate) / secondaryAssistRate);
  }

  /**
   * Helper function to get secondary assist rate
   * @param {String} playerName - the name of the player to query
   * @param {Number} forecastedAssists - number of forecasted assists
   * @param {Number} assistsToDate - total number of assists this season
   * @return {Object}
   */
  async function getPlayerAdjustedAssists(playerName, forecastedAssists,
      assistsToDate) {
    const data = await request.get({
      url: _url,
      headers: {'User-Agent': 'request'},
    }, (err, res, data) => {
      if (err) {
        console.log('Error: ' + err);
      } else if (res.statusCode !== 200) {
        console.log('Status: ' + res.statusCode);
      }
    });

    let tbody = {};
    let player = {};

    const $ = cheerio.load(data);
    $('#indreg')['0'].children.some(function(element) {
      if (element.type === 'tag') {
        if (element.name === 'tbody') {
          tbody = element;
        }
      }
    });

    // get player object
    tbody.children.some(function(element) {
      if (element.type === 'tag') {
        element.children.forEach(function(innerElement) {
          if (innerElement.type === 'text' && innerElement.data === '\n') {
            const nameElement = innerElement.next;
            if (nameElement.children[0].type === 'tag') {
              if (nameElement.children[0].children[0].data === playerName) {
                player = nameElement.children[0].children[0];
              }
            }
          }
        });
      }
    });

    // traverse to required data
    const secondaryAssists = parseInt(player.parent.parent.next.next.
        next.next.next.next.next.next.next.next.next.children[0].data, 10);
    const totalPoints = parseInt(player.parent.parent.next.next.next.
        next.next.next.next.next.next.next.next.next.children[0].data, 10);
    const secondaryAssistRate = secondaryAssists / totalPoints;
    const adjustedAssists = _getAdjustedAssists(forecastedAssists,
        assistsToDate, secondaryAssists, secondaryAssistRate);

    return {
      secondaryAssists,
      secondaryAssistRate,
      adjustedAssists,
    };
  }

  return {
    getPlayerAdjustedAssists: getPlayerAdjustedAssists,
  };
}());

module.exports = icyDataModule;
