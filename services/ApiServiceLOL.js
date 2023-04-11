const dotenv = require('dotenv');
const { request } = require('undici');
dotenv.config();
const token = process.env.LOL_TOKEN;

const ApiServiceLOL = {
  // Get summoner by summoner name
  getSummonerByName(summonerName) {
    return request(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${token}`)
  },
  // Get summoner by summoner id
  getLeagueBySummonerId(summonerId) {
    return request(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${token}`)
  },
  // Get summoner in current game by summoner id
  getCurrentGameBySummonerId(summonerId) {
    return request(`https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerId}?api_key=${token}`)
  },
  // Get champion by champion id
  getChampionByChampionId(championId) {
    return request(`https://euw1.api.riotgames.com/lol/static-data/v4/champions/${championId}?api_key=${token}`)
  },
  // Get 10 lastest game of summoner by puuid
  get10LastestGameOfSummoner(puuid) {
    return request(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10&api_key=${token}`)
  },
  // Get match by match id
  getMatchByMatchId(matchId) {
    return request(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${token}`)
  },
  // Get champion masteries by summoner id
  getChampionMasteriesBySummonerId(summonerId) {
    return request(`https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}/top?count=5&api_key=${token}`)
  },
  // Get League by summoner id array
  async getLeagueBySummonerIdArray(summonerIdArray) {
    let data = [];
    let datajson = [];
    for(let i = 0; i < summonerIdArray.length; i++) {
      data.push(await request(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerIdArray[i]}?api_key=${token}`))
    }
    for(let i = 0; i < data.length; i++) {
      datajson.push(await data[i].body.json())
    }
    return datajson;
  },
  async getChampionData() {
    const data = await ApiServiceLOL.getVersions();
    const dataInfo = await data.body.json();
    return request(`http://ddragon.leagueoflegends.com/cdn/${dataInfo[0]}/data/fr_FR/champion.json`)
  },
  async getVersions() {
    return request('http://ddragon.leagueoflegends.com/api/versions.json')
  }
}

module.exports = ApiServiceLOL;