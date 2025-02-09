// import installExtension, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-assembler';

import { app, BrowserWindow } from 'electron';
import path from 'path';
import { spawn } from 'child_process';

import portfinder from 'portfinder';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 800,
    minWidth: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  } 
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

global.python_port  = -1;

app.whenReady().then(() => {
  portfinder.getPort((err, port) => {
    if (err) {
      // raise electron error
      throw err;
    }
    global.python_port = port;
    global.endpoint_url = `http://localhost:${port}`;
    console.log(`Python server endpoint: ${global.endpoint_url}`);
    const venvPath = path.join(__dirname, "../../pyvenv/"); 
    let python_EXEC_CMD = app.isPackaged ? path.join(venvPath, 'Scripts', 'python.exe') : "python " + path.join(__dirname, "../../src-py/main.py");
    python_EXEC_CMD += ` --port ${port}`;
    const pythonProcess = spawn(python_EXEC_CMD, {
      shell: true,
    });
    pythonProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    pythonProcess.on('error', (error) => {
      console.error(`Failed to start Python process: ${error}`);
    });
    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
    });
  });
  // installExtension(REDUX_DEVTOOLS)
  //     .then((name) => console.log(`Added Extension:  ${name}`))
  //     .catch((err) => console.log('An error occurred: ', err));
  // installExtension(REACT_DEVELOPER_TOOLS)
  //     .then((name) => console.log(`Added Extension:  ${name}`))
  //     .catch((err) => console.log('An error occurred: ', err));
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
import './utils/record';
import './utils/pass-port';
import './utils/store';