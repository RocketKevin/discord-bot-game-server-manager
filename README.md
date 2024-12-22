# Discord Bot Game Server Manager

A Discord bot built with JavaScript to manage game server directly from your Discord server.

## Features

- **Single Server Management**: Start, stop, and check one game server using Discord commands.
- **Simple Setup**: Game server files are co-located with the bot files for easy access.

## Requirements

- **System**: Linux
- **Software**:
  - Git
  - Node.js
  - npm (Node Package Manager)
  - Internet connection
  - A machine to host a bot
  - Server files must be in the same machine as discord bot files
- **Knowledge**: Experience in setting up game servers and Discord bots.

## Bot Setup on Discord

1. Go to [Discord Developer Portal](https://discord.com/developers).
2. Login with your Discord account.
3. Press *New Application* -> Give it a new name -> Click the checkbox -> Press *Create* button -> Verify that you are human.
4. Press *Bot* -> Change the *USERNAME* -> Press *Save Changes*.
5. In the left panel, click *OAuth2* -> Copy *Client Id* -> Save it in a text file.
6. In the left panel, click *Bot* -> Reset Token -> Login -> Copy the new token -> Save it in a text file.
7. In *OAuth2 URL Generator* -> *SCOPES* -> Click *bot* -> Click *applications.commands*.
8. In *OAuth2 URL Generator* -> *BOT PERMISSIONS* -> Click *Send Messages* -> Click *Manage Messages*.
9. Scroll down in *OAuth2 URL Generator* -> Click *Copy* in the *GENERATED URL* section.
10. Open the URL in your browser -> In *ADD TO SERVER* -> Select your Discord server that you want your bot in -> Press *Authorize* -> Verify that you are human.
11. You should see your Discord bot offline (The bot should have the name you set as *USERNAME*).

## Clone the Repository and Install Dependencies

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/RocketKevin/discord-bot-game-server-manager.git
    ```

2. **Navigate to the Project Directory**:
    ```bash
    cd discord-bot-game-server-manager
    ```

3. **Install Dependencies**:
    ```bash
    npm install
    ```

## Configure Bot Settings

1. **Navigate to the Settings Folder**:
    ```bash
    cd Setting
    ```

2. **Open the `botConfigs.js` File**:
    ```bash
    nano botConfigs.js
    ```

3. **Add Start Server File Path**:
    - Find or create your `.sh` file in your game server folder, ensure it's executable (`chmod +x yourscript.sh`), and follow the double slashes in `botConfigs.js` to configure the file path.

4. **Navigate back to the Project Directory**:
    ```bash
    cd ..
    ```

5. **Create Your `.env` File**:
    ```bash
    cp .env.example .env
    ```

6. **Open and Edit Your `.env`**:
    ```bash
    nano .env
    ```
    - Copy your *client id* from step 1.5 and paste it into the `CLIENT_ID` field.
    - Copy your *token* from step 1.6 and paste it into the `BOT_TOKEN` field.

## Running the Bot

1. **Start the Discord Bot**:
    ```bash
    node .
    ```

2. **Verify**:
    - Your Discord bot should now be online in your Discord server.

## Usage Instructions

- **/startserver [server_name]**: Start the specified game server (e.g., `/startserver minecraft`, `/startserver terraria`). The server name corresponds to the key in the `SERVER_PATH_MAP` object in `botConfigs.js`, where each game server's configuration is defined.
- **/stopserver**: Stop the running game server.
- **/checkserver**: Check the status of the game server.
