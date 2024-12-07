const { Client, GatewayIntentBits } = require('discord.js');
const { exec } = require('child_process');
const net = require('net');
require('dotenv').config();

const SERVER_IP = '10.0.0.56'; // Local Server IP
const PORT = 25565; // Default Minecraft port
const TIMEOUT = 60000; // Timeout in milliseconds
const RETRY_INTERVAL = 10000; // Interval between retries in milliseconds (1 second)
const MAX_RETRIES = Math.floor(TIMEOUT / RETRY_INTERVAL); // Maximum number of retries based on total timeout
const TMUX_SESSION = 'minecraft';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function testMinecraftConnectionWithRetry(interaction) {
    let attempt = 0;

    const tryConnect = () => {
	const socket = new net.Socket();

	const onConnect = () => {
       	   socket.end();
           interaction.followUp('Server is up');
    	};
    	const reconnect = () => {
           socket.destroy();
           interaction.followUp(`Attempt ${attempt + 1} failed: Timeout.`);
           attempt++;

           if (attempt < MAX_RETRIES) {
              interaction.followUp(`Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
              setTimeout(tryConnect, RETRY_INTERVAL);
           } else {
              interaction.followUp('Reached maximum retries. Server is not reachable.');
       	   }
    	};

        socket.setTimeout(RETRY_INTERVAL);
	socket.on('connect', onConnect);
	socket.on('timeout', reconnect);
        socket.on('error', reconnect);
        socket.connect(PORT, SERVER_IP);
    }

    tryConnect();
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'startserver') {
        await interaction.reply('Starting server...');
	const command = `tmux new-session -d -s ${TMUX_SESSION} 'bash ~/Servers/ATM10/startserver.sh'`
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error starting server: ${error.message}`);
                interaction.editReply('Failed to start the server.');
                return;
            }

            console.log(`Server output: ${stdout}`);
            interaction.followUp('Server is starting!');
	    (async () => {
		interaction.followUp('Checking for connection...');
            	testMinecraftConnectionWithRetry(interaction);
	    })();
        });
    }
    if (commandName === 'stopserver') {
	await interaction.reply('Stopping server...');
	exec(`tmux send-keys -t ${TMUX_SESSION} "stop" Enter`, async (error, stdout, stderr) => {
           if (error) {
              interaction.followUp(`Error stopping the server: ${stderr}`);
              return;
           }
 	   setTimeout(() => {
              exec(`tmux send-keys -t ${TMUX_SESSION} C-c`, async (ctrlCError, ctrlCStdout, ctrlCStderr) => {
                 if (ctrlCError) {
                    console.error(`Error sending Ctrl+C: ${ctrlCStderr}`);
                    interaction.followUp('Server failed to stop.');
		    return;
                 }
                 interaction.followUp('Server has been stopped successfully.');
		 return;
              });
           }, 5000);
    	});
    }
});

client.login(process.env.BOT_TOKEN);
