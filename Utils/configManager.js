const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.resolve(__dirname, '../Setting/botConfig.json');

const readConfig = () => {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw);
};

const writeConfig = (config) => {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
};

module.exports = { readConfig, writeConfig };
