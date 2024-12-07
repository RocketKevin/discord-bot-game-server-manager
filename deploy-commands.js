const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
    {
        name: 'startserver',
        description: 'Starts the server',
    },
    {
        name: 'stopserver',
        description: 'Stops the server',
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log('Refreshing application (/) commands...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
