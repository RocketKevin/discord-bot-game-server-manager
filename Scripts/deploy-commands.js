const { REST, Routes } = require('discord.js');
require('dotenv').config();
const commands = require('../Setting/commandList.js');

const { BOT_TOKEN, CLIENT_ID } = process.env;

if (!BOT_TOKEN || !CLIENT_ID) {
  console.error('❌ Missing BOT_TOKEN or CLIENT_ID in .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log('🔄 Refreshing application (/) commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('❌ Failed to deploy commands:', error);
    process.exit(1);
  }
})();
