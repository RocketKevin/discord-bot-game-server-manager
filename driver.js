const readline = require('readline');
const execCommand = require('./Utils/execCommand.js');

require('dotenv').config();

const { stdin: input, stdout: output } = process;
const terminalListener = readline.createInterface({ input, output });

const optionList = [
  'Deploy Commands',
  'Delete Commands',
  'Run Discord Bot',
  'Exit',
];

const promptUser = () => {
  console.log('\nPlease select an option:');
  optionList.forEach((option, index) => console.log(`  ${index + 1}. ${option}`));

  terminalListener.question('\nEnter the number of your choice: ', async (answer) => {
    const choice = parseInt(answer, 10);
    console.log(`\nYou selected: ${optionList[choice - 1] ?? 'Invalid'}\n`);

    switch (choice) {
      case 1:
        try {
          const response = await execCommand('node ./Scripts/deploy-commands.js');
          console.log(response);
        } catch (error) {
          console.error(`❌ Error deploying commands: ${error}`);
        }
        break;

      case 2:
        try {
          const response = await execCommand('node ./Scripts/delete-commands.js');
          console.log(response);
        } catch (error) {
          console.error(`❌ Error deleting commands: ${error}`);
        }
        break;

      case 3:
        try {
          // Kill any existing DiscordBot session first
          await execCommand('tmux kill-session -t DiscordBot 2>/dev/null || true');
          // Start a new detached tmux session running the bot
          await execCommand('tmux new-session -d -s DiscordBot "node ./Scripts/bot.js"');
          console.log('✅ Bot is running in tmux session "DiscordBot".');
          console.log('   Attach with: tmux attach -t DiscordBot');
          console.log('   Detach with: Ctrl+B then D');
        } catch (error) {
          console.error(`❌ Error starting bot: ${error}`);
        }
        break;

      case 4:
        console.log('Exiting...');
        terminalListener.close();
        return;

      default:
        console.log('❌ Invalid choice, please try again.');
        return promptUser();
    }

    terminalListener.close();
  });
};

promptUser();
