const { SlashCommandBuilder } = require('discord.js');
const apiServiceLOL = require('../services/ApiServiceLOL');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rankflex')
		.setDescription('Reponds avec le rank Flex')
    .addStringOption(option =>  
      option.setName('nomdujoueur')
        .setDescription('Entrer le nom du joueur')
        .setRequired(true)
    ),
	async execute(interaction) {
    const summonerName = interaction.options.getString('nomdujoueur');
    const summoner = await apiServiceLOL.getSummonerByName(summonerName);
    const summonerInfo = await summoner.body.json();
    if (typeof(summonerInfo.status) === 'undefined') {
      const summonerId = await summonerInfo.id;
      const leagues = await apiServiceLOL.getLeagueBySummonerId(summonerId);
      const leaguesInfo = await leagues.body.json();
      console.log(leaguesInfo);
      if (leaguesInfo.length !== 1) {
        const leagueFlex = leaguesInfo.find(league => league.queueType === 'RANKED_FLEX_SR');
        const leagueName = leagueFlex.tier;
        const leagueRank = leagueFlex.rank;
        const leaguePoints = leagueFlex.leaguePoints;
        const wins = leagueFlex.wins;
        const losses = leagueFlex.losses;
        const winrate = Math.round((wins / (wins + losses)) * 100);
        const leagueMessage = `Le joueur ${summonerName} est ${leagueName} ${leagueRank} avec ${leaguePoints} points, ${wins} wins et ${losses} losses. Winrate est ${winrate}%`;
        await interaction.reply(leagueMessage);
      } else if (leaguesInfo[0].queueType === 'RANKED_SOLO_5x5') {
        await interaction.reply(`Le joueur ${interaction.options.getString('nomdujoueur')} n'a pas de rank Flex`);
      } else if (leaguesInfo[0].queueType === 'RANKED_FLEX_SR') {
        const leagueFlex = leaguesInfo[0];
        const leagueName = leagueFlex.tier;
        const leagueRank = leagueFlex.rank;
        const leaguePoints = leagueFlex.leaguePoints;
        const wins = leagueFlex.wins;
        const losses = leagueFlex.losses;
        const winrate = Math.round((wins / (wins + losses)) * 100);
        const leagueMessage = `Le joueur ${summonerName} est ${leagueName} ${leagueRank} avec ${leaguePoints} points, ${wins} wins et ${losses} losses. Winrate est ${winrate}%`;
        await interaction.reply(leagueMessage); 
      } else {
        await interaction.reply(`Le joueur ${interaction.options.getString('nomdujoueur')} n'a pas de rank Flex`);
      }
    } else if (summonerInfo.status.status_code === 404) {
      await interaction.reply(`Le joueur ${interaction.options.getString('nomdujoueur')} n'existe pas`);
    }
	},
};