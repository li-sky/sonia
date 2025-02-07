import { ipcMain } from 'electron';

ipcMain.on('speak', (event, data) => {

    // Create a new SpeechSynthesisUtterance object
    const utterance = new SpeechSynthesisUtterance();

    // Set the text to be spoken
    utterance.text = data.text;

    // Set the voice to be used (optional)
    // utterance.voice = speechSynthesis.getVoices().find(voice => voice.name === "Microsoft Zira Desktop");

    // Speak the text
    speechSynthesis.speak(utterance);
});