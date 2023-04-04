const { SlashCommandBuilder } = require('discord.js');
const apiServiceLOL = require('../services/ApiServiceLOL');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranksolo')
    .setDescription('Reponds avec le rank Soloqueue')
    .addStringOption(option =>
      option.setName('nomdujoueur')
        .setDescription('Entrer le nom du joueur')
        .setRequired(true)
    ),
  async execute(interaction) {
    const summonerName = interaction.options.getString('nomdujoueur');
    //get summoner by name
    const summoner = await apiServiceLOL.getSummonerByName(summonerName);
    const summonerInfo = await summoner.json();
    if (typeof (summonerInfo.status) === 'undefined') {
      const summonerId = await summonerInfo.id;
      const leagues = await apiServiceLOL.getLeagueBySummonerId(summonerId);
      const leaguesInfo = await leagues.json();
      if (leaguesInfo.length !== 1) {
        const leagueSolo = leaguesInfo.find(league => league.queueType === 'RANKED_SOLO_5x5');
        const leagueName = leagueSolo.tier;
        const leagueRank = leagueSolo.rank;
        const leaguePoints = leagueSolo.leaguePoints;
        const wins = leagueSolo.wins;
        const losses = leagueSolo.losses;
        const winrate = Math.round((wins / (wins + losses)) * 100);
        const leagueMessage = `Le joueur ${summonerName} est ${leagueName} ${leagueRank} avec ${leaguePoints} points, ${wins} wins et ${losses} losses. Winrate est ${winrate}%`;
        await interaction.reply(leagueMessage);
      } else if (leaguesInfo[0].queueType === 'RANKED_FLEX_SR') {
        await interaction.reply(`Le joueur ${interaction.options.getString('nomdujoueur')} n'a pas de rank Soloqueue`);
      } else if (leaguesInfo[0].queueType === 'RANKED_SOLO_5x5') {
        const leagueSolo = leaguesInfo[0];
        const leagueName = leagueSolo.tier;
        const leagueRank = leagueSolo.rank;
        const leaguePoints = leagueSolo.leaguePoints;
        const wins = leagueSolo.wins;
        const losses = leagueSolo.losses;
        const winrate = Math.round((wins / (wins + losses)) * 100);
        const leagueMessage = `Le joueur ${summonerName} est ${leagueName} ${leagueRank} avec ${leaguePoints} points, ${wins} wins et ${losses} losses. Winrate est ${winrate}%`;
        await interaction.reply(leagueMessage);
      }
    } else if (summonerInfo.status.status_code === 404) {
      await interaction.reply(`Le joueur ${interaction.options.getString('nomdujoueur')} n'existe pas`);
    }
  },
};