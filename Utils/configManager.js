const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.resolve(__dirname, '../Setting/botConfig.json');
const DEFAULT_CONFIG_PATH = path.resolve(__dirname, '../Setting/botConfig.default.json');

const ensureConfig = () => {
  if (!fs.existsSync(CONFIG_PATH)) {
    if (!fs.existsSync(DEFAULT_CONFIG_PATH)) {
      throw new Error('Neither botConfig.json nor botConfig.default.json found. Please create one.');
    }
    fs.copyFileSync(DEFAULT_CONFIG_PATH, CONFIG_PATH);
    console.log('✅ botConfig.json created from botConfig.default.json');
  }
};

const readConfig = () => {
  ensureConfig();
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw);
};

const writeConfig = (config) => {
  ensureConfig();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
};

module.exports = { readConfig, writeConfig };
