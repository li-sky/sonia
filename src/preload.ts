// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';


contextBridge.exposeInMainWorld('electron', {
  sendAudioData: (id: string, arrayBuffer: ArrayBuffer) => {
    const array = Array.from(new Uint8Array(arrayBuffer));
    ipcRenderer.send('push-audio-data', { id : id, array : array });
  },
  fetchAudioData: async (id: string) => {
    return await ipcRenderer.invoke('fetch-audio-data', { id : id });
  },
  speak: (text: string) => {
    ipcRenderer.send('speak', { text: text });
  },
  fetchPort: async () => {
    return await ipcRenderer.invoke('fetch-port');
  },
  fetchState: async () => {
    return await ipcRenderer.invoke('fetch-state');
  },
  updateState: (state: any) => {
    ipcRenderer.send('update-state', state);
  },
  // 新增事件订阅接口，用于接收 Python 日志
  onPythonLog: (callback: (log: string) => void) => {
    ipcRenderer.on('python-log', (event, data) => callback(data));
  },
  // 新增接口用于获取缓存的日志
  fetchPythonLog: () => ipcRenderer.invoke('fetch-python-log')
});
