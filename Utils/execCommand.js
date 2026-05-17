const { exec } = require('child_process');

const execCommand = (command, timeoutMs = 10000) => {
  return new Promise((resolve, reject) => {
    const child = exec(command, { timeout: timeoutMs }, (error, stdout, stderr) => {
      if (error) reject(stderr || error.message);
      else resolve(stdout.trim());
    });
  });
};

module.exports = execCommand;
