// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import voiceCommandsReducer from '../features/voiceCommands/voiceCommandsSlice.ts';

const store =  configureStore({
  reducer: {
    voiceCommands: voiceCommandsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export default store;