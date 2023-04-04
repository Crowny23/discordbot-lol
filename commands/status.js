const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Replies welcome message! with message')
    .addStringOption(option =>  
      option.setName('statusmessage')
        .setDescription('Enter your status message')
        .setRequired(true)
    ),
	async execute(interaction) {
		await interaction.reply('Welcome to the server! ' + interaction.options.getString('statusmessage'));
	},
};