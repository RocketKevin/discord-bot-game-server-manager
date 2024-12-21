const { SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('startserver')
    .setDescription('Starts the server')
    .addStringOption((option) =>
      option
        .setName('ServerName')
        .setDescription("The Server's Name")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('stopserver')
    .setDescription('Stops the server'),

  new SlashCommandBuilder()
    .setName('checkserver')
    .setDescription('Checks if the server is online'),
];

module.exports = commands;
