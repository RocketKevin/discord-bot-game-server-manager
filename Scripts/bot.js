const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Socket } = require('net');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { readConfig, writeConfig } = require('../Utils/configManager.js');
const execCommand = require('../Utils/execCommand.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ── Helpers ────────────────────────────────────────────────────────────────

const COLORS = { green: 0x57f287, red: 0xed4245, yellow: 0xfee75c, blue: 0x5865f2, gray: 0x99aab5 };

const embed = (color, title, description) =>
  new EmbedBuilder().setColor(color).setTitle(title).setDescription(description).setTimestamp();

const isOwner = (interaction) => interaction.guild.ownerId === interaction.user.id;

const hasPermission = (interaction) => {
  if (isOwner(interaction)) return true;
  const config = readConfig();
  if (!config.ALLOWED_ROLES.length) return false;
  return interaction.member.roles.cache.some(role => config.ALLOWED_ROLES.includes(role.name));
};

// ── Connection check ───────────────────────────────────────────────────────

const checkConnection = (ip, port) => {
  return new Promise((resolve) => {
    const socket = new Socket();
    socket.setTimeout(5000);
    socket.on('connect', () => { socket.end(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { socket.destroy(); resolve(false); });
    socket.connect(port, ip);
  });
};

const waitForServer = async (interaction, ip, port) => {
  const config = readConfig();
  let attempt = 0;
  let timer = 0;

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return [m && `${m}m`, sec && `${sec}s`].filter(Boolean).join(' ');
  };

  const followUpMessage = await interaction.followUp({
    embeds: [embed(COLORS.yellow, '⏳ Waiting for server...', 'Checking connection...')],
  });

  const tryConnect = async () => {
    const online = await checkConnection(ip, port);
    if (online) {
      return followUpMessage.edit({
        embeds: [embed(COLORS.green, '✅ Server is Online!', `Server came up after ${formatTimer(timer)}`)],
      });
    }

    attempt++;
    timer += config.RETRY_INTERVAL / 1000;

    if (attempt < config.MAX_RETRIES) {
      followUpMessage.edit({
        embeds: [embed(COLORS.yellow, '🔄 Still starting...', `Checked ${attempt}/${config.MAX_RETRIES} — elapsed: ${formatTimer(timer)}`)],
      });
      setTimeout(tryConnect, config.RETRY_INTERVAL);
    } else {
      followUpMessage.edit({
        embeds: [embed(COLORS.red, '❌ Server Unreachable', `Max retries reached after ${formatTimer(timer)}. Check the logs.`)],
      });
    }
  };

  setTimeout(tryConnect, config.RETRY_INTERVAL);
};

// ── Server control commands ────────────────────────────────────────────────

const startServer = async (interaction, serverName) => {
  if (!hasPermission(interaction)) {
    return interaction.reply({ embeds: [embed(COLORS.red, '🚫 Permission Denied', 'You do not have permission to start the server.')], ephemeral: true });
  }

  const config = readConfig();
  const serverEntry = config.SERVER_PATH_MAP[serverName];

  if (!serverEntry) {
    return interaction.reply({ embeds: [embed(COLORS.red, '❌ Unknown Server', `No server named \`${serverName}\` found. Use \`/listservers\` to see available servers.`)], ephemeral: true });
  }

  const { path: serverPath, port } = serverEntry;
  await interaction.reply({ embeds: [embed(COLORS.blue, '🚀 Starting Server...', `Starting \`${serverName}\`...`)] });

  try {
    await execCommand(`tmux kill-session -t ${serverName} 2>/dev/null || true`);
    await execCommand(`tmux new-session -d -s ${serverName} 'bash "${serverPath}"'`);
    await interaction.followUp({ embeds: [embed(COLORS.yellow, '⏳ Server Starting', 'The server process has started. Waiting for it to come online...')] });
    waitForServer(interaction, config.SERVER_IP, port || config.PORT);
  } catch (error) {
    console.error(`Error starting server: ${error}`);
    interaction.followUp({ embeds: [embed(COLORS.red, '❌ Start Failed', `Failed to start server: \`${error}\``)] });
  }
};

const stopServer = async (interaction, serverName) => {
  if (!hasPermission(interaction)) {
    return interaction.reply({ embeds: [embed(COLORS.red, '🚫 Permission Denied', 'You do not have permission to stop the server.')], ephemeral: true });
  }

  const config = readConfig();
  const serverEntry = config.SERVER_PATH_MAP[serverName];

  if (!serverEntry) {
    return interaction.reply({ embeds: [embed(COLORS.red, '❌ Unknown Server', `No server named \`${serverName}\` found. Use \`/listservers\` to see available servers.`)], ephemeral: true });
  }

  await interaction.reply({ embeds: [embed(COLORS.yellow, '🛑 Stopping Server...', `Stopping \`${serverName}\`...`)] });

  try {
    await execCommand(`tmux send-keys -t ${serverName} "stop" Enter`);
    setTimeout(async () => {
      try {
        await execCommand(`tmux send-keys -t ${serverName} C-c`);
        await execCommand(`tmux kill-session -t ${serverName} 2>/dev/null || true`);
        interaction.followUp({ embeds: [embed(COLORS.green, '✅ Server Stopped', `\`${serverName}\` has been shut down.`)] });
      } catch (error) {
        interaction.followUp({ embeds: [embed(COLORS.red, '❌ Stop Failed', `Could not force-stop server: \`${error}\``)] });
      }
    }, 5000);
  } catch (error) {
    console.error(`Error stopping server: ${error}`);
    interaction.followUp({ embeds: [embed(COLORS.red, '❌ Stop Failed', `Failed to send stop command: \`${error}\``)] });
  }
};

const restartServer = async (interaction, serverName) => {
  if (!hasPermission(interaction)) {
    return interaction.reply({ embeds: [embed(COLORS.red, '🚫 Permission Denied', 'You do not have permission to restart the server.')], ephemeral: true });
  }

  const config = readConfig();
  const serverEntry = config.SERVER_PATH_MAP[serverName];

  if (!serverEntry) {
    return interaction.reply({ embeds: [embed(COLORS.red, '❌ Unknown Server', `No server named \`${serverName}\` found. Use \`/listservers\` to see available servers.`)], ephemeral: true });
  }

  const { path: serverPath, port } = serverEntry;
  await interaction.reply({ embeds: [embed(COLORS.yellow, '🔁 Restarting Server...', `Stopping \`${serverName}\` first...`)] });

  try {
    await execCommand(`tmux send-keys -t ${serverName} "stop" Enter`);
    setTimeout(async () => {
      try {
        await execCommand(`tmux kill-session -t ${serverName} 2>/dev/null || true`);
        await execCommand(`tmux new-session -d -s ${serverName} 'bash "${serverPath}"'`);
        await interaction.followUp({ embeds: [embed(COLORS.blue, '🚀 Server Restarting', 'Server stopped and is starting back up...')] });
        waitForServer(interaction, config.SERVER_IP, port || config.PORT);
      } catch (error) {
        interaction.followUp({ embeds: [embed(COLORS.red, '❌ Restart Failed', `Failed during restart: \`${error}\``)] });
      }
    }, 8000);
  } catch (error) {
    console.error(`Error restarting server: ${error}`);
    interaction.followUp({ embeds: [embed(COLORS.red, '❌ Restart Failed', `Failed to send stop command: \`${error}\``)] });
  }
};

// ── Minecraft server list ping ─────────────────────────────────────────────
// Implements a minimal version of the Minecraft 1.7+ status ping protocol.
// Returns { version, players: { online, max }, description } or null if offline.

const minecraftPing = (ip, port) => {
  return new Promise((resolve) => {
    const socket = new Socket();
    socket.setTimeout(5000);

    const onFail = () => { socket.destroy(); resolve(null); };
    socket.on('timeout', onFail);
    socket.on('error', onFail);

    socket.connect(port, ip, () => {
      // Build handshake packet
      const host = Buffer.from(ip, 'utf8');
      const portBuf = Buffer.alloc(2);
      portBuf.writeUInt16BE(port);

      // Packet data: protocol version (-1), host, port, next state (1 = status)
      const packetData = Buffer.concat([
        Buffer.from([0xff, 0xff, 0xff, 0xff, 0x0f]), // VarInt: protocol version -1
        Buffer.from([host.length]),                   // host length
        host,                                         // host string
        portBuf,                                      // port
        Buffer.from([0x01]),                          // next state: status
      ]);

      // Packet ID 0x00 = handshake
      const handshake = Buffer.concat([
        Buffer.from([packetData.length + 1]), // packet length
        Buffer.from([0x00]),                  // packet ID
        packetData,
      ]);

      // Status request packet (ID 0x00, length 1)
      const statusRequest = Buffer.from([0x01, 0x00]);

      socket.write(Buffer.concat([handshake, statusRequest]));

      let data = Buffer.alloc(0);
      socket.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);

        // Look for JSON object in the response
        const str = data.toString('utf8');
        const jsonStart = str.indexOf('{');
        const jsonEnd = str.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
          try {
            const json = JSON.parse(str.slice(jsonStart, jsonEnd + 1));
            socket.destroy();
            resolve({
              version: json.version?.name || 'Unknown',
              online: json.players?.online ?? 0,
              max: json.players?.max ?? 0,
              motd: typeof json.description === 'string'
                ? json.description
                : json.description?.text || 'No description',
            });
          } catch {
            onFail();
          }
        }
      });
    });
  });
};

const checkServer = async (interaction, serverName) => {
  if (!hasPermission(interaction)) {
    return interaction.reply({ embeds: [embed(COLORS.red, '🚫 Permission Denied', 'You do not have permission to check the server.')], ephemeral: true });
  }

  const config = readConfig();
  const serverEntry = config.SERVER_PATH_MAP[serverName];

  if (!serverEntry) {
    return interaction.reply({ embeds: [embed(COLORS.red, '❌ Unknown Server', `No server named \`${serverName}\` found. Use \`/listservers\` to see available servers.`)], ephemeral: true });
  }

  const { port } = serverEntry;
  const effectivePort = port || config.PORT;

  await interaction.reply({ embeds: [embed(COLORS.blue, '🔍 Checking Server...', `Pinging \`${config.SERVER_IP}:${effectivePort}\`...`)] });

  // Try Minecraft ping first for rich info
  const mcInfo = await minecraftPing(config.SERVER_IP, effectivePort);

  if (mcInfo) {
    const description = [
      `**Game:** \`${serverName}\``,
      `**Version:** \`${mcInfo.version}\``,
      `**Players:** \`${mcInfo.online}/${mcInfo.max}\``,
      `**MOTD:** ${mcInfo.motd}`,
      `**Address:** \`${config.SERVER_IP}:${effectivePort}\``,
    ].join('\n');

    return interaction.followUp({ embeds: [embed(COLORS.green, '✅ Server Online', description)] });
  }

  // Fall back to plain TCP check (for non-Minecraft servers)
  const online = await checkConnection(config.SERVER_IP, effectivePort);
  if (online) {
    interaction.followUp({
      embeds: [embed(COLORS.green, '✅ Server Online', `**Game:** \`${serverName}\`\n**Address:** \`${config.SERVER_IP}:${effectivePort}\``)],
    });
  } else {
    interaction.followUp({
      embeds: [embed(COLORS.red, '❌ Server Offline', `**Game:** \`${serverName}\`\n**Address:** \`${config.SERVER_IP}:${effectivePort}\``)],
    });
  }
};

// ── Role management commands ───────────────────────────────────────────────

const addRole = async (interaction) => {
  if (!isOwner(interaction)) {
    return interaction.reply({ embeds: [embed(COLORS.red, '🚫 Owner Only', 'Only the server owner can manage roles.')], ephemeral: true });
  }

  const role = interaction.options.getRole('role');
  const config = readConfig();

  if (config.ALLOWED_ROLES.includes(role.name)) {
    return interaction.reply({ embeds: [embed(COLORS.yellow, '⚠️ Already Added', `\`${role.name}\` is already in the allowed roles list.`)], ephemeral: true });
  }

  config.ALLOWED_ROLES.push(role.name);
  writeConfig(config);

  interaction.reply({ embeds: [embed(COLORS.green, '✅ Role Added', `\`${role.name}\` can now control the server.`)] });
};

const removeRole = async (interaction) => {
  if (!isOwner(interaction)) {
    return interaction.reply({ embeds: [embed(COLORS.red, '🚫 Owner Only', 'Only the server owner can manage roles.')], ephemeral: true });
  }

  const role = interaction.options.getRole('role');
  const config = readConfig();

  if (!config.ALLOWED_ROLES.includes(role.name)) {
    return interaction.reply({ embeds: [embed(COLORS.yellow, '⚠️ Not Found', `\`${role.name}\` is not in the allowed roles list.`)], ephemeral: true });
  }

  config.ALLOWED_ROLES = config.ALLOWED_ROLES.filter(r => r !== role.name);
  writeConfig(config);

  interaction.reply({ embeds: [embed(COLORS.green, '✅ Role Removed', `\`${role.name}\` can no longer control the server.`)] });
};

const listRoles = async (interaction) => {
  const config = readConfig();
  const roles = config.ALLOWED_ROLES;

  if (!roles.length) {
    return interaction.reply({ embeds: [embed(COLORS.gray, '📋 Allowed Roles', 'No roles added yet. Only the server owner can control the server.')] });
  }

  interaction.reply({ embeds: [embed(COLORS.blue, '📋 Allowed Roles', roles.map(r => `• \`${r}\``).join('\n'))] });
};

// ── Server path management commands ───────────────────────────────────────

const addServer = async (interaction) => {
  if (!isOwner(interaction)) {
    return interaction.reply({ embeds: [embed(COLORS.red, '🚫 Owner Only', 'Only the server owner can register servers.')], ephemeral: true });
  }

  const name = interaction.options.getString('name');
  const path = interaction.options.getString('path');
  const port = interaction.options.getInteger('port') || 25565;
  const config = readConfig();

  if (config.SERVER_PATH_MAP[name]) {
    return interaction.reply({ embeds: [embed(COLORS.yellow, '⚠️ Already Exists', `A server named \`${name}\` is already registered. Remove it first with \`/removeserver\`.`)], ephemeral: true });
  }

  config.SERVER_PATH_MAP[name] = { path, port };
  writeConfig(config);

  interaction.reply({ embeds: [embed(COLORS.green, '✅ Server Added', `\`${name}\` registered.\n**Path:** \`${path}\`\n**Port:** \`${port}\``)] });
};

const removeServer = async (interaction) => {
  if (!isOwner(interaction)) {
    return interaction.reply({ embeds: [embed(COLORS.red, '🚫 Owner Only', 'Only the server owner can remove servers.')], ephemeral: true });
  }

  const name = interaction.options.getString('name');
  const config = readConfig();

  if (!config.SERVER_PATH_MAP[name]) {
    return interaction.reply({ embeds: [embed(COLORS.yellow, '⚠️ Not Found', `No server named \`${name}\` found.`)], ephemeral: true });
  }

  delete config.SERVER_PATH_MAP[name];
  writeConfig(config);

  interaction.reply({ embeds: [embed(COLORS.green, '✅ Server Removed', `\`${name}\` has been unregistered.`)] });
};

const listServers = async (interaction) => {
  const config = readConfig();
  const servers = Object.entries(config.SERVER_PATH_MAP);

  if (!servers.length) {
    return interaction.reply({ embeds: [embed(COLORS.gray, '📋 Registered Servers', 'No servers registered yet. Use `/addserver` to add one.')] });
  }

  const description = servers.map(([name, { path, port }]) =>
    `• \`${name}\` — port \`${port}\`\n  \`${path}\``
  ).join('\n\n');

  interaction.reply({ embeds: [embed(COLORS.blue, '📋 Registered Servers', description)] });
};

// ── Interaction handler ────────────────────────────────────────────────────

const handleInteractions = async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  try {
    switch (commandName) {
      case 'startserver':   await startServer(interaction, interaction.options.getString('server-name')); break;
      case 'stopserver':    await stopServer(interaction, interaction.options.getString('server-name')); break;
      case 'restartserver': await restartServer(interaction, interaction.options.getString('server-name')); break;
      case 'checkserver':   await checkServer(interaction, interaction.options.getString('server-name')); break;
      case 'addrole':       await addRole(interaction); break;
      case 'removerole':    await removeRole(interaction); break;
      case 'listroles':     await listRoles(interaction); break;
      case 'addserver':     await addServer(interaction); break;
      case 'removeserver':  await removeServer(interaction); break;
      case 'listservers':   await listServers(interaction); break;
      default:
        interaction.reply({ embeds: [embed(COLORS.red, '❓ Unknown Command', `Command \`${commandName}\` is not recognized.`)], ephemeral: true });
    }
  } catch (error) {
    console.error(`Unhandled error in command ${commandName}:`, error);
  }
};

// ── Bot startup ────────────────────────────────────────────────────────────

(async () => {
  try {
    client.once('ready', () => console.log(`✅ Bot online as ${client.user.tag}`));
    client.on('interactionCreate', handleInteractions);
    await client.login(process.env.BOT_TOKEN);
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
})();
