const { ApplicationCommandOptionType } = require('discord.js');

const commands = [
  {
    name: 'startserver',
    description: 'Starts the server',
    options: [
      {
        name: 'serverName',
        description: "The Server's Name",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  {
    name: 'stopserver',
    description: 'Stops the server',
  },
  {
    name: 'checkserver',
    description: 'Checks if the server is online',
  },
];

module.exports = commands;
