const ipcMain = require('electron').ipcMain;

ipcMain.handle('fetch-port', async (event) => {
  return global.python_port;
});