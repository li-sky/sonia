const { ipcMain } = require('electron');
const recorder = require('node-record-lpcm16');

ipcMain.handle('start-recording', (event) => {
  // 开始录音
  recorder.record({
    sampleRate: 44100,
    channels: 2,
    closeOnSilence: 6,
  })
    .stream()
    .on('data', (chunk) => {
      // 将录音数据发送到渲染进程
      event.sender.send('recording-data', chunk);
    });

  // 5秒后停止录音
  setTimeout(() => {
    recorder.stop();
  }, 5000);
});