const { REST, Routes } = require('discord.js');

const { BOT_TOKEN, CLIENT_ID } = process.env;

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log('Deleting all commands...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID), { body: [] });
    console.log('Successfully deleted all commands.');
  } catch (error) {
    console.error(error);
  }
})();
