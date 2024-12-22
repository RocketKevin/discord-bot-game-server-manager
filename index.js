(async () => {
  try {
    const deployCommand = 'node ./Scripts/deploy-commands.js';
    const response = await execCommand(deployCommand);
    console.log(response);
    console.log('Bot Running...');
    const startBotCommand = 'node ./Scripts/bot.js';
    const botTmuxCommand = 'tmux new-session -d -s DiscordBot';
    await execCommand(botTmuxCommand);
    const botTmuxRunCommand = `tmux send-keys -t DiscordBot "${startBotCommand}" Enter`;
    await execCommand(botTmuxRunCommand);
    const stopCommand = 'tmux send-keys -t DiscordBot "exit" Enter';
    await execCommand(stopCommand);
  } catch (error) {
    console.error(`Error running script: ${error}`);
  }
})();
