const ApiServiceDataDragon = {
  async getChampionData() {
    const data = await ApiServiceDataDragon.getVersions();
    const dataInfo = await data.json();
    return fetch(`http://ddragon.leagueoflegends.com/cdn/${dataInfo[0]}/data/fr_FR/champion.json`)
  },
  async getVersions() {
    return fetch('http://ddragon.leagueoflegends.com/api/versions.json')
  },
}

module.exports = ApiServiceDataDragon;
