const readline = require('readline');
const execCommand = require('./Utils/execCommand.js');

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
    const selectedCommand = (() => {
      switch (choice) {
        case 1:
          return 'node ./Scripts/deploy-commands.js';
        case 2:
          return 'node ./Scripts/bot.js';
        case 3:
          return 'close';
        default:
          console.log('Invalid choice!');
          return '';
      }
    })();
    if (selectedCommand === '') return promptUser();
    if (selectedCommand === 'close') {
      console.log('Exiting ...');
      return terminalListener.close();
    }
  
    console.log(`You selected: ${optionList[choice - 1]}`);
    try {
      const response = await execCommand(selectedCommand);
      console.log(response);
    } catch (error) {
      console.error(`Error running script: ${error}`);
    }
    terminalListener.close();
  }
  terminalListener.question(myQuestion, userAnswer);
}

promptUser();
