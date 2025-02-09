import { createSlice } from "@reduxjs/toolkit";

const otherSettingsSlice = createSlice({
  name: "otherSettings",
  initialState: {
    language: "zh-cn",
    theme: "light",
    isRecognitionStarted: false,
    voiceCommandBackends: [],
    currentVoiceCommandBackend: "",
    voiceCommandBackendSettings: {},
  },
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setRecognitionStarted: (state, action) => {
      state.isRecognitionStarted = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setVoiceCommandBackends: (state, action) => {
      state.voiceCommandBackends = action.payload;
    },
    setCurrentVoiceCommandBackend: (state, action) => {
      state.currentVoiceCommandBackend = action.payload;
    },
    setVoiceCommandBackendSettings: (state, action) => {
      state.voiceCommandBackendSettings = action.payload;
    },
    setInitState: (state, action) => {
      console.log(action.payload);
      state.language = action.payload.language;
      state.theme = action.payload.theme;
      state.voiceCommandBackends = action.payload.voiceCommandBackends;
      state.currentVoiceCommandBackend = action.payload.currentVoiceCommandBackend;
      state.voiceCommandBackendSettings = action.payload.voiceCommandBackendSettings;
    }
  }
});

export const {
  setLanguage,
  setTheme,
  setVoiceCommandBackends,
  setCurrentVoiceCommandBackend,
  setVoiceCommandBackendSettings,
  setRecognitionStarted,
  setInitState
} = otherSettingsSlice.actions;

export default otherSettingsSlice.reducer;