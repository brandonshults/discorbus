const fetch = require('node-fetch');
const { INVALID_RESPONSE } = require('../constants');

const BASE_URL = 'https://api-game.orbusvr.com/public/';
const LEADERBOARD_BASE_URL = `${BASE_URL}leaderboard/`;

const LEADERBOARD_URLS = Object.freeze({
  runemage: `${LEADERBOARD_BASE_URL}contest_runemage`,
  fish: `${LEADERBOARD_BASE_URL}fish_totalweight`,
  potions: `${LEADERBOARD_BASE_URL}potions_brewed`,
  kills: `${LEADERBOARD_BASE_URL}monsters_killed`,
  gathering: `${LEADERBOARD_BASE_URL}gathers`,
  arena: `${LEADERBOARD_BASE_URL}arenas_won`
});

function getResponse(url) {
  return fetch(url)
    .then(res => res.json());
}

function getLeaderBoard(board) {
  if(board in LEADERBOARD_URLS) {
    return getResponse(LEADERBOARD_URLS[board])
      .then(leaderboard => leaderboard.map(({name, record}) => ({name, record: parseInt(record, 10)})))
      .catch(err => INVALID_RESPONSE);
  }

  return Promise.resolve(INVALID_RESPONSE)
}

module.exports = {
  LEADERBOARD_URLS,
  getLeaderBoard
};