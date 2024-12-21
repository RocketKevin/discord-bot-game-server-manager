const readline = require('readline');
const execCommand = require('./Utils/execCommand.js');

require('dotenv').config();

const { stdin: input, stdout: output } = process;
const terminalListener = readline.createInterface({ input, output });

const optionList = ['Update Commands', 'Force Delete Commands', 'Run Discord Bot', 'Exit'];
const displayOptions = (option, index) => {
  console.log(`${index + 1}. ${option}`);
}

const promptUser = () => {
  console.log('Please select an option:');

  optionList.forEach(displayOptions);

  const myQuestion = 'Enter the number of your choice: ';
  const userAnswer = async answer => {
    const choice = parseInt(answer, 10);
    let selectedCommand = '';
    console.log(`You selected: ${optionList[choice - 1]}`);
    switch (choice) {
      case 1:
        selectedCommand = 'node ./Scripts/deploy-commands.js';
        try {
          const response = await execCommand(selectedCommand);
          console.log(response);
        } catch (error) {
          console.error(`Error running script: ${error}`);
        }
        break;
      case 2:
        selectedCommand = 'node ./Scripts/delete-commands.js';
        try {
          const response = await execCommand(selectedCommand);
          console.log(response);
        } catch (error) {
          console.error(`Error running script: ${error}`);
        }
        break;
      case 3:
        console.log('Bot Running...');
        try {
          selectedCommand = 'node ./Scripts/bot.js';
          const botTmuxCommand = 'tmux new-session -d -s DiscordBot';
          await execCommand(botTmuxCommand);
          const botTmuxRunCommand = `tmux send-keys -t DiscordBot "${selectedCommand}" Enter`;
          await execCommand(botTmuxRunCommand);
          const stopCommand = 'tmux send-keys -t DiscordBot "exit" Enter';
          await execCommand(stopCommand);
        } catch (error) {
          console.error(`Error running script: ${error}`);
        }
        break;
      case 4:
        console.log('Exiting ...');
        break;
      default:
        console.log('Invalid choice!');
        return promptUser()
    }
    terminalListener.close();
  }
  terminalListener.question(myQuestion, userAnswer);
}

promptUser();
