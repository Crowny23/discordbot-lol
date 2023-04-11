const { SlashCommandBuilder} = require('discord.js');
const apiServiceLOL = require('../services/ApiServiceLOL');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lastestplaychamp')
    .setDescription('Reponds avec les derniers champions joués durant les 10 dernières parties')
    .addStringOption(option =>
      option.setName('nomdujoueur')
        .setDescription('Entrer le nom du joueur')
        .setRequired(true)
    ),
  async execute(interaction) {
    const summonerName = interaction.options.getString('nomdujoueur');
    const summoner = await apiServiceLOL.getSummonerByName(summonerName);
    const summonerInfo = await summoner.body.json();
    if (typeof (summonerInfo.status) === 'undefined') {
      const summonerPuuid = await summonerInfo.puuid;
      const matchInfo = await apiServiceLOL.get10LastestGameOfSummoner(summonerPuuid);
      const matchList = await matchInfo.body.json();
      const matchesList10 = await Promise.all(matchList.map(matchId => apiServiceLOL.getMatchByMatchId(matchId)));
      const matchesList10Json = await Promise.all(matchesList10.map(matchInfo => matchInfo.body.json()));
      const matchesList10JsonInfo = await Promise.all(matchesList10Json.map(matchInfo => matchInfo.info));
      const versionData = await apiServiceLOL.getVersions();
      const versionDataInfo = await versionData.body.json();
      let message = `Les 10 derniers champions joués par ${summonerName} sont : \n`;
      let messageChampionArray = [];
      matchesList10JsonInfo.forEach(match => {
        const participants = match.participants;
        participants.forEach(participant => {
          if (participant.summonerName === summonerName) {
            const imageChampion = `http://ddragon.leagueoflegends.com/cdn/${versionDataInfo[0]}/img/champion/${participant.championName}.png`;
            const championName = participant.championName;
            const kda = `${participant.kills}/${participant.deaths}/${participant.assists}`;
            const championImageString = `[${championName}](${imageChampion})`;
            const championKdaString = `KDA : ${kda}`;
            const doubleKill = participant.doubleKills;
            const tripleKill = participant.tripleKills;
            const quadraKill = participant.quadraKills;
            const pentaKill = participant.pentaKills;
            const win = participant.win ? 'Victoire' : 'Défaite';
            const lane = participant.lane;
            const championString = `${championImageString} ${championKdaString} \n Game : ${win} \n Lane : ${lane} \n Double Kill : ${doubleKill} \n Triple Kill : ${tripleKill} \n Quadra Kill : ${quadraKill} \n Penta Kill : ${pentaKill} \n`;
            messageChampionArray.push(championString);
          }
        });
      });
      await interaction.reply(message);
      await interaction.followUp(messageChampionArray[0]);
      await interaction.followUp(messageChampionArray[1]);
      await interaction.followUp(messageChampionArray[2]);
      await interaction.followUp(messageChampionArray[3]);
      await interaction.followUp(messageChampionArray[4]);
      await interaction.followUp(messageChampionArray[5]);
      await interaction.followUp(messageChampionArray[6]);
      await interaction.followUp(messageChampionArray[7]);
      await interaction.followUp(messageChampionArray[8]);
      await interaction.followUp(messageChampionArray[9]);
      return;
    } else if (summonerInfo.status.status_code === 404) {
      await interaction.reply(`Le joueur ${interaction.options.getString('nomdujoueur')} n'existe pas`);
    }
  }
};