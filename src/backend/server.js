require('dotenv').config();
const core = require('./src/core/app');
const logs = require('./src/log-app/app');

const corePort = process.env.PORT || 3000;
const logPort = process.env.PORT_LOG || 3001;

const args = process.argv.slice(2);

if (args.includes('dev')) {
  core.listen(corePort, '0.0.0.0', () => {
    console.info('API Claus is running!');
  });

  logs.listen(logPort, '0.0.0.0', () => {
    console.info('API Log is running!');
  });
} else if (args.includes('core')) {
  core.listen(corePort, '0.0.0.0', () => {
    console.info('API Claus is running!');
  });
} else if (args.includes('logs')) {
  logs.listen(logPort, '0.0.0.0', () => {
    console.info('API Log is running!');
  });
} else {
  console.error('Nenhum parâmetro válido fornecido. Use "core" ou "logs".');
  process.exit(1);
}
