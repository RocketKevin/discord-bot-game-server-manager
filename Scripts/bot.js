const { Client, GatewayIntentBits } = require('discord.js');
const { Socket } = require('net');
require('dotenv').config({ path: '../.env' });
const {
  SERVER_IP, PORT, RETRY_INTERVAL,
  MAX_RETRIES, TMUX_SESSION, SERVER_PATH_MAP,
} = require('../Setting/botConfigs.js');
const execCommand = require('../Utils/execCommand.js');

const intents = [
  GatewayIntentBits.Guilds,
]
const client = new Client({ intents });

const testServerConnection = interaction => {
  const socket = new Socket();

  const onSocketConnection = () => {
    socket.end();
    interaction.followUp('Server is up');
  };
  const onSocketError = () => {
    socket.end();
    interaction.followUp('Error. Server Closing...');
  };

  socket.on('connect', onSocketConnection);
  socket.on('error', onSocketError);
  socket.connect(PORT, SERVER_IP);

  return socket;
};
const testServerConnectionWithRetry = interaction => {
  let attempt = 0;

  const handleSocketReconnection = socket => {
    socket.destroy();
    attempt++;
    interaction.followUp(`Attempt ${attempt} failed. Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
    if (attempt < MAX_RETRIES) setTimeout(tryConnect, RETRY_INTERVAL);
    else interaction.followUp('Maximum retries reached. Server is not reachable.');
  };
  const retryServerConnection = socket => {
    const reconnect = () => handleSocketReconnection(socket);
    socket.setTimeout(RETRY_INTERVAL);
    socket.on('timeout', reconnect);
    socket.on('error', reconnect);
  };
  const tryConnect = () => {
    const socket = testServerConnection(interaction);
    retryServerConnection(socket);
  }

  tryConnect();
}
const onReady = () => {
  console.log('Bot Online!');
}

const startServer = async (interaction, serverName) => {
  await interaction.reply(`Starting ${serverName} server...`);
  const serverPath = SERVER_PATH_MAP[serverName];
  if (serverPath === undefined) {
    interaction.followUp('No Server Found!');
    return;
  }
  const startCommand = `tmux new-session -d -s ${TMUX_SESSION} 'bash ${serverPath}'`;
  try {
    await execCommand(startCommand);
    interaction.followUp('Server is starting! 🚀 Checking for connection...');
    testServerConnectionWithRetry(interaction);
  } catch (error) {
    interaction.followUp('Failed to start the server. Please check the logs for details.');
    console.error(`Error starting server: ${error}`);
  }
}
const forceCloseServer = async interaction => {
  const ctrlCCommand = `tmux send-keys -t ${TMUX_SESSION} C-c`;
  try {
    await execCommand(ctrlCCommand);
    interaction.followUp('Server has been stopped successfully. 👌');
  } catch (error) {
    interaction.followUp('Failed to terminate the server session.');
    console.error(`Error sending Ctrl+C: ${error}`);
  }
}
const stopServer = async interaction => {
  await interaction.reply('Stopping the server...');
  const stopCommand = `tmux send-keys -t ${TMUX_SESSION} "stop" Enter`;
  const forceCloseServerHelper = () => forceCloseServer(interaction);
  try {
    await execCommand(stopCommand);
    setTimeout(forceCloseServerHelper, 5000);
  } catch (error) {
    interaction.followUp('Failed to send stop command to the server.');
    console.error(`Error sending stop command: ${error}`);
  }
}
const checkServer = async interaction => {
  await interaction.reply('Checking server connection...');
  const socket = testServerConnection(interaction);

  const onException = () => {
    socket.destroy();
    interaction.followUp('Fail to connect to server.');
  };

  socket.on('timeout', onException);
  socket.on('error', onException);
}
const handleInteractions = async interaction => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;
  switch (commandName) {
    case 'startserver':
      const serverName = interaction.options.get('server-name').value
      await startServer(interaction, serverName);
      break;
    case 'stopserver':
      await stopServer(interaction);
      break;
    case 'checkserver':
      await checkServer(interaction);
      break;
    default:
      interaction.reply('Unknown command!');
  }
}

(async () => {
  try {
    await client.login(process.env.BOT_TOKEN);
    client.once('ready', onReady);
    client.on('interactionCreate', handleInteractions);
  } catch (error) {
    console.error(error);
  }
})();
