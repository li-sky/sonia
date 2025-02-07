import { ipcMain } from 'electron';

ipcMain.handle('fetch-port', async (event) => {
  return global.python_port;
});