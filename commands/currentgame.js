const { SlashCommandBuilder } = require('discord.js');
const apiServiceLOL = require('../services/ApiServiceLOL');
const championService = require('../services/ChampionData');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('currentgame')
    .setDescription('Reponds avec le jeu en cours')
    .addStringOption(option =>
      option.setName('nomdujoueur')
        .setDescription('Entrer le nom du joueur')
        .setRequired(true)
    ),
  async execute(interaction) {
    const summonerName = interaction.options.getString('nomdujoueur');
    const championData = await championService.getChampionData();
    const dataInfo = await championData.json();
    const championList = dataInfo.data;
    const summoner = await apiServiceLOL.getSummonerByName(summonerName);
    const summonerInfo = await summoner.json();
    if (typeof (summonerInfo.status) === 'undefined') {
      const summonerId = await summonerInfo.id;
      const currentgame = await apiServiceLOL.getCurrentGameBySummonerId(summonerId);
      const currentgameInfo = await currentgame.json();
      if (typeof (currentgameInfo.status) === 'undefined') {
        const gameMode = currentgameInfo.gameMode;
        const gameType = currentgameInfo.gameType;
        const participants = currentgameInfo.participants;
        let gameMessage = `Le joueur ${summonerName} est en jeu ${gameMode} ${gameType} : \n`;
        const leaguesInfo = await apiServiceLOL.getLeagueBySummonerIdArray(participants.map(participant => participant.summonerId));
        participants.forEach(participant => {
          const championId = participant.championId;
          for (const key in championList) {
            if (championList[key].key == championId) {
              if (participant.teamId == 100) {
                gameMessage += `\`\`\`md\n# "${participant.summonerName}" joue ${championList[key].name} \n`;
                for (const league of leaguesInfo) {
                  if (league.length !== 1 && league[0].summonerName === participant.summonerName) {
                    const leagueSolo = league.find(league => league.queueType === 'RANKED_SOLO_5x5');
                    gameMessage += ` Soloqueue : ${leagueSolo.tier} ${leagueSolo.rank} ${leagueSolo.leaguePoints} points`;
                    const winrateSolo = Math.round((league[0].wins / (league[0].wins + league[0].losses)) * 100);
                    gameMessage += ` winrate : ${winrateSolo} % \n`;
                    const leagueFlex = league.find(league => league.queueType === 'RANKED_FLEX_SR');
                    gameMessage += ` Flexqueue : ${leagueFlex.tier} ${leagueFlex.rank} ${leagueFlex.leaguePoints} points`;
                    const winrateFlex = Math.round((league[0].wins / (league[0].wins + league[0].losses)) * 100);
                    gameMessage += ` winrate : ${winrateFlex} % \`\`\`\n`;
                  } else if (league[0].queueType === 'RANKED_SOLO_5x5' && league[0].summonerName === participant.summonerName) {
                    gameMessage += ` Soloqueue : ${league[0].tier} ${league[0].rank} ${league[0].leaguePoints} points`;
                    const winrate = Math.round((league[0].wins / (league[0].wins + league[0].losses)) * 100);
                    gameMessage += ` winrate : ${winrate} % \`\`\`\n`;
                  } else if (league[0].queueType === 'RANKED_FLEX_SR' && league[0].summonerName === participant.summonerName) {
                    gameMessage += ` Flexqueue : ${league[0].tier} ${league[0].rank} ${league[0].leaguePoints} points`;
                    const winrate = Math.round((league[0].wins / (league[0].wins + league[0].losses)) * 100);
                    gameMessage += ` winrate : ${winrate} % \`\`\`\n`;
                  }
                }
              } else {
                gameMessage += `\`\`\`diff\n- "${participant.summonerName}" joue ${championList[key].name} \n`;
                for (const league of leaguesInfo) {
                  if (league.length !== 1 && league[0].summonerName === participant.summonerName) {
                    const leagueSolo = league.find(league => league.queueType === 'RANKED_SOLO_5x5');
                    gameMessage += ` Soloqueue : ${leagueSolo.tier} ${leagueSolo.rank} ${leagueSolo.leaguePoints} points`;
                    const winrateSolo = Math.round((league[0].wins / (league[0].wins + league[0].losses)) * 100);
                    gameMessage += ` winrate : ${winrateSolo} % \n`;
                    const leagueFlex = league.find(league => league.queueType === 'RANKED_FLEX_SR');
                    gameMessage += ` Flexqueue : ${leagueFlex.tier} ${leagueFlex.rank} ${leagueFlex.leaguePoints} points`;
                    const winrateFlex = Math.round((league[0].wins / (league[0].wins + league[0].losses)) * 100);
                    gameMessage += ` winrate : ${winrateFlex} % \`\`\`\n`;
                  } else if (league[0].queueType === 'RANKED_SOLO_5x5' && league[0].summonerName === participant.summonerName) {
                    gameMessage += ` Soloqueue : ${league[0].tier} ${league[0].rank} ${league[0].leaguePoints} points`;
                    const winrate = Math.round((league[0].wins / (league[0].wins + league[0].losses)) * 100);
                    gameMessage += ` winrate : ${winrate} % \`\`\`\n`;
                  } else if (league[0].queueType === 'RANKED_FLEX_SR' && league[0].summonerName === participant.summonerName) {
                    gameMessage += ` Flexqueue : ${league[0].tier} ${league[0].rank} ${league[0].leaguePoints} points`;
                    const winrate = Math.round((league[0].wins / (league[0].wins + league[0].losses)) * 100);
                    gameMessage += ` winrate : ${winrate} % \`\`\`\n`;
                  }
                }
              }
            }
          }
        });
        await interaction.reply(gameMessage);
        return;
      } else if (currentgameInfo.status.status_code === 404) {
        await interaction.reply(`Le joueur ${interaction.options.getString('nomdujoueur')} n'est pas en jeu`);
      }
    } else if (summonerInfo.status.status_code === 404) {
      await interaction.reply(`Le joueur ${interaction.options.getString('nomdujoueur')} n'existe pas`);
      return;
    }
  },
};