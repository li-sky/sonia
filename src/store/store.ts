import { configureStore } from '@reduxjs/toolkit';
import voiceCommandsReducer from '../features/voiceCommands/voiceCommandsSlice';
import otherSettingsReducer from '../features/otherSettings/otherSettingsSlice';

const electronMiddleware = store => next => action => {
  const result = next(action);
  if (action.type === 'voiceCommands/setInitState' || action.type === 'otherSettings/setInitState') {
    console.log(action.type);
  } else {
    const state = store.getState();
    window.electron.updateState(state);
    console.log(state);
  }
  return result;
};

const store = configureStore({
  reducer: {
    voiceCommands: voiceCommandsReducer,
    otherSettings: otherSettingsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(electronMiddleware)
});

export type RootState = ReturnType<typeof store.getState>;
export default store;