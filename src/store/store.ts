// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import voiceCommandsReducer from '../features/voiceCommands/voiceCommandsSlice.ts';
import otherSettingsReducer from '../features/otherSettings/otherSettingsSlice.ts';
import { portNumber } from '../utils/pass-port-render.js';


const pythonMiddleware = store => next => action => {
  const result = next(action);
  if (action.type === 'voiceCommands/setInitState' || action.type === 'otherSettings/setInitState') {
    console.log(action.type);
  } else {
    const state = store.getState();
    // send state to python
    // fetch('http://localhost:'+toString(portNumber), {
    fetch('http://localhost:'+ portNumber + '/updateState', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });
  }
  return result;
}

const store =  configureStore({
  reducer: {
    voiceCommands: voiceCommandsReducer,
    otherSettings: otherSettingsReducer,
  }, 
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(pythonMiddleware)
});

export type RootState = ReturnType<typeof store.getState>;
export default store;