const RPC = require('discord-rpc');
const chalk = require('chalk');
chalk.level = 3;

const clientId = '1464783948952633414';
const startTimestamp = new Date();

const rpc = new RPC.Client({ transport: 'ipc' });

rpc.on('ready', () => {
  rpc.setActivity({
    details: 'Navigue avec Mxlw Browser',
    state: 'Disponible sur Github',
    startTimestamp,
    instance: false
  });
  console.log(chalk.green('[RPC] Online...'));
});

rpc.login({ clientId }).catch(console.error);
