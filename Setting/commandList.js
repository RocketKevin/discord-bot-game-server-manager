const commands = [
  {
      name: 'startserver',
      description: 'Starts the server',
      options: [
        {
          name: 'serverName',
          type: 3,
          description: "The Server's Name",
          required: true,
        },
      ],
  },
  {
      name: 'stopserver',
      description: 'Stops the server',
  },
  {
    name: 'checkserver',
    description: 'Checks if the server is online',
  },
];

module.exports = commands;
