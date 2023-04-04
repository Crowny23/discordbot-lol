const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const apiServiceLOL = require('../services/ApiServiceLOL');
const championService = require('../services/ChampionData');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lastestgames')
    .setDescription('Reponds avec les 10 dernieres games')
    .addStringOption(option =>
      option.setName('nomdujoueur')
        .setDescription('Entrer le nom du joueur')
        .setRequired(true)
    ),
  async execute(interaction) {
    let message = '';
    const summonerName = interaction.options.getString('nomdujoueur');
    const summoner = await apiServiceLOL.getSummonerByName(summonerName);
    const summonerInfo = await summoner.json();
    if (typeof(summonerInfo.status) !== 'undefined') {
      const summonerPuuid = await summonerInfo.puuid;
      const matches = await apiServiceLOL.get10LastestGameOfSummoner(summonerPuuid);
      const matchesInfo = await matches.json();
      const matchesList10 = await Promise.all(matchesInfo.map(matchId => apiServiceLOL.getMatchByMatchId(matchId)));
      const matchesList10Json = await Promise.all(matchesList10.map(matchInfo => matchInfo.json()));
      const matchesList10JsonInfo = await Promise.all(matchesList10Json.map(matchInfo => matchInfo.info));
      const championData = await championService.getChampionData();
      const championDataJson = await championData.json();
      const championList = championDataJson.data;
      matchesList10JsonInfo.forEach(match => {
        const gameDuration = match.gameDuration;
        const gameDurationMinutes = Math.floor(gameDuration / 60);
        const gameDurationSeconds = gameDuration % 60;
        const gameDurationString = `${gameDurationMinutes}min ${gameDurationSeconds}sec`;
        const gameCreation = match.gameCreation;
        const gameCreationDate = new Date(gameCreation);
        const gameCreationDateString = gameCreationDate.toLocaleString();
        const gameMode = match.gameMode;
        const gameType = match.gameType;
        const gameVersion = match.gameVersion;
        const teams = match.teams;
        const team1 = teams[0];
        const team2 = teams[1];
        const team1Win = team1.win === true ? 'Victoire' : 'Défaite';
        const team2Win = team2.win === true ? 'Victoire' : 'Défaite';
        const team1Bans = team1.bans;
        const team2Bans = team2.bans;
        team1Bans.forEach( ban => {
          for(const champion in championList) {
            if (championList[champion].key == ban.championId) {
              ban.championName = championList[champion].name;
            }
          }
        });
        const team1BansString = team1Bans.map(ban => ban.championName).join(', ');
        team2Bans.forEach(ban => {
          for(const champion in championList) {
            if (championList[champion].key == ban.championId) {
              ban.championName = championList[champion].name;
            }
          }
        });
        const team2BansString = team2Bans.map(ban => ban.championName).join(', ');
        const participants = match.participants;
        const team1Participants = participants.filter(participant => participant.teamId === 100);
        const team2Participants = participants.filter(participant => participant.teamId === 200);
        const team1ParticipantsString = team1Participants.map(participant => {
          return `- ${participant.summonerName} (${participant.championName}): ${participant.kills}/${participant.deaths}/${participant.assists} KDA, ${participant.totalMinionsKilled} CS, ${participant.totalDamageDealtToChampions} DMG, ${participant.goldEarned} GOLD, ${participant.visionScore} SCORE VISION, ${participant.wardsPlaced} WARDSPLACED, ${participant.wardsKilled} WARDSKILLED, Role: ${participant.role}, Lane: ${participant.lane}`;
        }).join('\n');
        const team2ParticipantsString = team2Participants.map(participant => {
          return `- ${participant.summonerName} (${participant.championName}): ${participant.kills}/${participant.deaths}/${participant.assists} KDA, ${participant.totalMinionsKilled} CS, ${participant.totalDamageDealtToChampions} DMG, ${participant.goldEarned} GOLD, ${participant.visionScore} SCORE VISION, ${participant.wardsPlaced} WARDSPLACED, ${participant.wardsKilled} WARDSKILLED, Role: ${participant.role}, Lane: ${participant.lane}`;
        }).join('\n');
        let max = 0;
        let mvp = '';
        participants.forEach(participant => {
          if(participant.totalDamageDealtToChampions > max) {
            max = participant.totalDamageDealtToChampions;
            mvp = participant.summonerName;
          }
        });
        message += `Game date: ${gameCreationDateString} \n`;
        message += `Game duration: ${gameDurationString} \n`;
        message += `Game mode: ${gameMode} \n`;
        message += `Game type: ${gameType} \n`;
        message += `Game version: ${gameVersion} \n`;
        message += `Team 1 win: ${team1Win} \n`;
        message += `Team 2 win: ${team2Win} \n`;
        message += `Team 1 bans: ${team1BansString} \n`;
        message += `Team 2 bans: ${team2BansString} \n`;
        message += `Team 1 participants: \n${team1ParticipantsString} \n`;
        message += `Team 2 participants: \n${team2ParticipantsString} \n`;
        message += `MVP: ${mvp} \n`;
        message += `---------------------------------------- \n`;
      });
      fs.writeFileSync('./storage/lastest.txt', message);
      const attachment = new AttachmentBuilder('./storage/lastest.txt');
      await interaction.reply({ content: 'Lastest games', files: [attachment] });
    } else if (summonerInfo.status.status_code === 404) {
      await interaction.reply(`Le joueur ${interaction.options.getString('nomdujoueur')} n'existe pas`);
    }
  }
};
