const winston = require('winston');
const express = require('express');
const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/database')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

const port = process.env.PORT || 3900;
const server = app.listen(port,()=>{winston.info(`Listening to port ${port}...`)});

// Graceful shutdown
process.on('SIGINT', () => {
  winston.info('Shutting down gracefully...');
  server.close(() => {
    winston.info('Server closed.');
    process.exit(0); // Exit the process with a success code (0)
  });
});

module.exports = server;