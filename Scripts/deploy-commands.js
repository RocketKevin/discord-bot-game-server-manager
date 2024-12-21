const { REST, Routes } = require('discord.js');
require('dotenv').config();
const commands = require('../Setting/commandList.js');

const { BOT_TOKEN, CLIENT_ID } = process.env;

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log('Refreshing application (/) commands...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
