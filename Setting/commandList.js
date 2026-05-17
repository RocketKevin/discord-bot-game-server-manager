const { SlashCommandBuilder } = require('discord.js');

const commands = [
  // ── Server control ──────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName('startserver')
    .setDescription('Starts the game server')
    .addStringOption((option) =>
      option
        .setName('server-name')
        .setDescription("The server's name (e.g. ATM10)")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('stopserver')
    .setDescription('Gracefully stops the running game server')
    .addStringOption((option) =>
      option
        .setName('server-name')
        .setDescription("The server's name (e.g. ATM10)")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('restartserver')
    .setDescription('Restarts the running game server')
    .addStringOption((option) =>
      option
        .setName('server-name')
        .setDescription("The server's name (e.g. ATM10)")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('checkserver')
    .setDescription('Checks if a game server is online and shows its info')
    .addStringOption((option) =>
      option
        .setName('server-name')
        .setDescription("The server's name (e.g. ATM10)")
        .setRequired(true)
    ),

  // ── Role management (owner only) ────────────────────────────────
  new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Add a role that can control the server (owner only)')
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('The role to add')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Remove a role from server control (owner only)')
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('The role to remove')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('listroles')
    .setDescription('List all roles that can control the server'),

  // ── Server path management (owner only) ─────────────────────────
  new SlashCommandBuilder()
    .setName('addserver')
    .setDescription('Register a new game server (owner only)')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription("Server name (e.g. ATM10)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('path')
        .setDescription("Full path to the start script (e.g. /home/user/Servers/ATM10/startserver.sh)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('port')
        .setDescription("Server port (default: 25565)")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('removeserver')
    .setDescription('Remove a registered game server (owner only)')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription("Server name to remove (e.g. ATM10)")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('listservers')
    .setDescription('List all registered game servers'),
];

module.exports = commands;
