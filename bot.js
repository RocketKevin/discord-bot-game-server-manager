const { Client, GatewayIntentBits } = require('discord.js');
const { exec } = require('child_process');
const net = require('net');
require('dotenv').config();
const {
    SERVER_IP, PORT, RETRY_INTERVAL,
    MAX_RETRIES, TMUX_SESSION, START_SERVER_SCRIPT_PATH,
} = require('./constants.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const execCommand = command => {
    const handleCommandResult = (resolve, reject) => (error, stdout, stderr) => {
        if (error) reject(stderr || error.message);
        else resolve(stdout.trim());
    };
    const runCommand = (resolve, reject) => exec(command, handleCommandResult  (resolve, reject));
    const commandPromise = new Promise(runCommand );
    return commandPromise;
};
const testServerConnectionWithRetry = interaction => {
    let attempt = 0;
    const tryConnect = () => {
        const socket = new net.Socket();
        const onConnect = () => {
            socket.end();
            interaction.followUp('Server is up');
        };
        const reconnect = () => {
            socket.destroy();
            attempt++;
            interaction.followUp(`Attempt ${attempt} failed. Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
            if (attempt < MAX_RETRIES) setTimeout(tryConnect, RETRY_INTERVAL);
            else interaction.followUp('Maximum retries reached. Server is not reachable.');
        };
        socket.setTimeout(RETRY_INTERVAL);
        socket.on('connect', onConnect);
        socket.on('timeout', reconnect);
        socket.on('error', reconnect);
        socket.connect(PORT, SERVER_IP);
    }
    tryConnect();
}
const onReady = () => {
    console.log(`Logged in as ${client.user.tag}!`);
}

const startServer = async interaction => {
    await interaction.reply('Starting the server...');
    const startCommand = `tmux new-session -d -s ${TMUX_SESSION} 'bash ${START_SERVER_SCRIPT_PATH}'`;
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
        console.error(`Error sending Ctrl+C: ${ctrlCError.message}`);
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
const handleInteractions = async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;
    switch (commandName) {
        case 'startserver':
            await startServer(interaction);
            break;
        case 'stopserver':
            await stopServer(interaction);
            break;
        default:
            interaction.reply('Unknown command!');
    }
}

client.once('ready', onReady);
client.on('interactionCreate', handleInteractions);
client.login(process.env.BOT_TOKEN);
