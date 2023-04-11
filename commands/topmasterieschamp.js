const { SlashCommandBuilder } = require('discord.js');
const apiServiceLOL = require('../services/ApiServiceLOL');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('topmasterieschamp')
    .setDescription('Reponds avec le top 5 des champions avec la mastery le plus élevé')
    .addStringOption(option =>
      option.setName('nomdujoueur')
        .setDescription('Entrer le nom du joueur')
        .setRequired(true)
    ),
  async execute(interaction) {
    const summonerName = interaction.options.getString('nomdujoueur');
    const summoner = await apiServiceLOL.getSummonerByName(summonerName);
    const summonerInfo = await summoner.body.json();
    const championData = await apiServiceLOL.getChampionData();
    const championDataInfo = await championData.body.json();
    const championList = championDataInfo.data;
    if (typeof (summonerInfo.status) === 'undefined') {
      const summonerId = await summonerInfo.id;
      const masteries = await apiServiceLOL.getChampionMasteriesBySummonerId(summonerId);
      const masteriesInfo = await masteries.body.json();
      let message = "Le joueur " + summonerName + " a les 5 champions avec la mastery la plus élevé: \n";
      masteriesInfo.map(mastery => {
        const championId = mastery.championId;
        for(const key in championList){
          if(championList[key].key == championId){
            mastery.championName = championList[key].name;
          }
        }
        const championName = mastery.championName;
        const championLevel = mastery.championLevel;
        const championPoints = mastery.championPoints;
        const lastPlayTime = mastery.lastPlayTime;
        const lastPlayTimeHours = Math.floor((Date.now() - lastPlayTime) / 1000 / 60 / 60);
        const lastPlayTimeDays = Math.floor(lastPlayTimeHours / 24);
        message += `${championName} - Niveau ${championLevel} - ${championPoints} points - Joué il y a ${lastPlayTimeDays} jour \n`;
      })
      await interaction.reply(message);
    } else if (summonerInfo.status.status_code === 404) {
      await interaction.reply(`Le joueur ${interaction.options.getString('nomdujoueur')} n'existe pas`);
    }
  }
};