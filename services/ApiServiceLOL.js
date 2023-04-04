const dotenv = require('dotenv');
dotenv.config();
const token = process.env.LOL_TOKEN;

const ApiServiceLOL = {
  // Get summoner by summoner name
  getSummonerByName(summonerName) {
    return fetch(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${token}`)
  },
  // Get summoner by summoner id
  getLeagueBySummonerId(summonerId) {
    return fetch(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${token}`)
  },
  // Get summoner in current game by summoner id
  getCurrentGameBySummonerId(summonerId) {
    return fetch(`https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}?api_key=${token}`)
  },
  // Get champion by champion id
  getChampionByChampionId(championId) {
    return fetch(`https://euw1.api.riotgames.com/lol/static-data/v4/champions/${championId}?api_key=${token}`)
  },
  // Get 10 lastest game of summoner by puuid
  get10LastestGameOfSummoner(puuid) {
    return fetch(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10&api_key=${token}`)
  },
  // Get match by match id
  getMatchByMatchId(matchId) {
    return fetch(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${token}`)
  },
  // Get League by summoner id array
  async getLeagueBySummonerIdArray(summonerIdArray) {
    let data = [];
    let datajson = [];
    for(let i = 0; i < summonerIdArray.length; i++) {
      data.push(await fetch(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerIdArray[i]}?api_key=${token}`))
    }
    for(let i = 0; i < data.length; i++) {
      datajson.push(await data[i].json())
    }
    return datajson;
  }
}

module.exports = ApiServiceLOL;