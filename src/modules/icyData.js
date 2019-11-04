const request = require('request-promise');
const cheerio = require('cheerio');

const icyDataModule = (function() {
  'use strict';

  const _url = 'http://www.naturalstattrick.com/playerteams.php?' +
    'fromseason=20192020&thruseason=20192020&stype=2&sit=all&score' +
    '=all&stdoi=std&rate=n&loc=B&toi=0&gpfilt=none&fd=&td=&tgp=410&lines' +
    '=single&draftteam=ALL';

  /**
   * Helper function to get secondary assist rate
   * @param {String} playerName - the name of the player to query
   * @return {Number}
   */
  async function getSecondaryAssistRate(playerName) {
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
    const secondaryAssists = player.parent.parent.next.next.
        next.next.next.next.next.next.next.next.next.children[0].data;
    const totalPoints = player.parent.parent.next.next.next.
        next.next.next.next.next.next.next.next.next.children[0].data;

    return secondaryAssists / totalPoints;
  }

  return {
    getSecondaryAssistRate: getSecondaryAssistRate,
  };
}());

module.exports = icyDataModule;
