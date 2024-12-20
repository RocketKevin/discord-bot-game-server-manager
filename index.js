const readline = require('readline');
const execCommand = require('./Utils/execCommand.js');

require('dotenv').config();

const { stdin: input, stdout: output } = process;
const terminalListener = readline.createInterface({ input, output });

const optionList = ['Update Commands', 'Run Discord Bot', 'Exit'];
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
        terminalListener.close();
      case 2:
        selectedCommand = 'node ./Scripts/bot.js';
        console.log('Bot Running...');
        try {
          const botTmuxCommand = `tmux new-session -d -s DiscordBot 'bash ${selectedCommand}'`;
          await execCommand(botTmuxCommand);
          const stopCommand = `tmux send-keys -t DiscordBot "exit" Enter`;
          await execCommand(stopCommand);
        } catch (error) {
          console.error(`Error running script: ${error}`);
        }
        terminalListener.close();
      case 3:
        console.log('Exiting ...');
        terminalListener.close();
      default:
        console.log('Invalid choice!');
        return promptUser()
    }
  }
  terminalListener.question(myQuestion, userAnswer);
}

promptUser();
