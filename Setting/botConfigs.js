const SERVER_IP = '10.0.0.56';
const PORT = 25565;
const TIMEOUT = 120000;
const RETRY_INTERVAL = 10000;
const MAX_RETRIES = Math.floor(TIMEOUT / RETRY_INTERVAL);
const TMUX_SESSION = 'GameServer';
// The word "Minecraft" is used as a key when a user types "/startserver Minecraft".
// Add the path to your start server script for Minecraft (or other servers) 
// in the format: 'Minecraft: "<path_to_start_server_script>"'.
const SERVER_PATH_MAP = {
  // Example: Minecraft: '~/Server/startserver.sh'
};

const constants = {
  SERVER_IP, PORT, TIMEOUT, RETRY_INTERVAL,
  MAX_RETRIES, TMUX_SESSION,
  SERVER_PATH_MAP,
};

module.exports = constants;
