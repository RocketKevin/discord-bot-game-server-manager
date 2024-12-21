const SERVER_IP = '10.0.0.56';
const PORT = 25565;
const TIMEOUT = 120000;
const RETRY_INTERVAL = 10000;
const MAX_RETRIES = Math.floor(TIMEOUT / RETRY_INTERVAL);
const TMUX_SESSION = 'GameServer';
const SERVER_PATH_MAP = {
  ATM9: '~/Servers/ATM9/startserver.sh',
  ATM10: '~/Servers/ATM10/startserver.sh',
}

const constants = {
  SERVER_IP, PORT, TIMEOUT, RETRY_INTERVAL,
  MAX_RETRIES, TMUX_SESSION,
  SERVER_PATH_MAP,
};

module.exports = constants;
