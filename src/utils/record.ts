import { ipcMain } from 'electron';
import { app } from 'electron';
// const fs = require('fs');
// const ffmpeg = require("fluent-ffmpeg");
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const TMP_DIR = app.getPath('temp')+'/sonia/';
const USER_DIR = app.getPath('userData')+'/sonia/';
fs.mkdirSync(TMP_DIR, { recursive: true });
fs.mkdirSync(USER_DIR, { recursive: true });
fs.mkdirSync(USER_DIR+'audiorecordings/', { recursive: true });
fs.mkdirSync(TMP_DIR+'audio_tmp/', { recursive: true });


ipcMain.on('push-audio-data', (event, data) => {
  const id = data.id;
  const array = data.array;
  const arrayBuffer = new Uint8Array(array).buffer;

  fs.writeFileSync(TMP_DIR+`audio_tmp/${id}.wav`, Buffer.from(arrayBuffer));
  ffmpeg(TMP_DIR+`audio_tmp/${id}.wav`)
    .audioFrequency(16000)
    .audioChannels(1)
    .on('end', () => {
      event.reply('audio-data-converted', { id });
    })
    .save(USER_DIR+"audiorecordings/"+`${id}.wav`)
});

ipcMain.handle('fetch-audio-data', async (event, data) =>  {
  console.log("fetching audio data, id: ", data.id);
  const id = data.id;
  try {
    const arrayBuffer = await fs.promises.readFile(USER_DIR+"audiorecordings/"+`${id}.wav`);
    console.log("arrayBuffer: ", arrayBuffer.byteLength);
    return arrayBuffer;
  } catch (error) {
    console.error("Failed to read file: ", error);
    return null;
  }
});