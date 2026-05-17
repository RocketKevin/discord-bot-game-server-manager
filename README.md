# Discord Bot Game Server Manager (Improved)

A Discord bot to manage your game server directly from Discord.

## What's New vs Original
- **Bug fix**: Bot now actually stays running in tmux (original sent `exit` immediately after starting)
- **`/restartserver`**: New command to restart the server without SSH
- **Role-based permissions**: Only users with allowed Discord roles can start/stop/restart
- **Rich embeds**: Color-coded responses instead of plain text
- **Crash-safe**: Cleans up old tmux sessions before starting new ones
- **Socket timeout**: `checkserver` no longer hangs forever

## Requirements
- Linux
- Node.js + npm
- tmux
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers))

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the bot
```bash
cp .env.example .env
nano .env
```
Fill in:
```
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
```

### 3. Configure your server path
Edit `Setting/botConfigs.js`:
```js
const SERVER_PATH_MAP = {
  ATM10: '/home/youruser/Servers/ATM10/startserver.sh',
};
```

Optionally restrict commands to specific Discord roles:
```js
const ALLOWED_ROLES = ['Admin', 'Moderator'];
// Leave as [] to allow everyone
```

### 4. Deploy slash commands
```bash
node driver.js
# Select option 1: Deploy Commands
```

### 5. Start the bot
```bash
node driver.js
# Select option 3: Run Discord Bot
```

The bot runs in a tmux session called `DiscordBot`. To monitor it:
```bash
tmux attach -t DiscordBot
# Detach: Ctrl+B then D
```

## Commands

| Command | Description | Permission |
|---|---|---|
| `/startserver <name>` | Starts the named server | Allowed roles only |
| `/stopserver` | Gracefully stops the server | Allowed roles only |
| `/restartserver` | Restarts the server | Allowed roles only |
| `/checkserver` | Checks if server is online | Everyone |
