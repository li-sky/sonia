import Store from 'electron-store';
import { ipcMain } from 'electron';

const store = new Store();

ipcMain.on('update-state', (event, state) => {
        store.set('state', state);
        event.reply('state-updated');
    }
);

ipcMain.handle('fetch-state', (event, data) => {
    return store.get('state');
});

// when app is initializing, check if state is empty, if so, set it to default
console.log(store.get('state'));
if (!store.has('state')) {
    store.set('state', {
        voiceCommands: {
            cmds: [],
        },
        otherSettings: {
            voiceCommandBackends: [],
            currentVoiceCommandBackend: "",
            isRecognitionStarted: false,
        }
    });
}
