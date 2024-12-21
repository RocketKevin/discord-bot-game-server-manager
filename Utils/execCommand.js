const { exec } = require('child_process');

const execCommand = command => {
  const handleCommandResult = (resolve, reject) => (error, stdout, stderr) => {
    if (error) reject(stderr || error.message);
    else resolve(stdout.trim());
  };
  const runCommand = (resolve, reject) => exec(command, handleCommandResult(resolve, reject));
  const commandPromise = new Promise(runCommand);
  return commandPromise;
};

module.exports = execCommand;
