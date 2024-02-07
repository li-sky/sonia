import { createSlice } from '@reduxjs/toolkit';
import { CommandTypes, Command } from '../../types/CommandType.ts';


const voiceCommandsSlice = createSlice({
  name: 'voiceCommands',
  initialState: {
    cmds: [] as Command[],
  },
  reducers: {
    addVoiceCommand: (state, action) => {
      for (let i = action.payload.id + 1; i < state.cmds.length; i++) {
        state.cmds[i].id++;
      }
      state.cmds.splice(action.payload.id + 1, 0, {
        id: action.payload.id + 1,
        TriggerWord: '',
        VoiceCommandList: [],
        action: '',
        commandType: CommandTypes.TextCommand
      });
    },
    deleteVoiceCommand: (state, action) => {
      state.cmds = state.cmds.filter(command => command.id !== action.payload);
      // make sure ids are continuous
      for (let i = 0; i < state.cmds.length; i++) {
        state.cmds[i].id = i;
      }
    },
    addVoiceCommandSound: (state, action) => {
      state.cmds[action.payload.id].VoiceCommandList = [...state.cmds[action.payload.id].VoiceCommandList, action.payload.sound];
    },
    deleteVoiceCommandSound: (state, action) => {
      state.cmds[action.payload.id].VoiceCommandList = state.cmds[action.payload.id].VoiceCommandList.filter(sound => sound.id !== action.payload.sound.id);
      // make sure ids are continuous
      for (let i = 0; i < state.cmds[action.payload.id].VoiceCommandList.length; i++) {
        state.cmds[action.payload.id].VoiceCommandList[i].id = i;
      }
    },
    updateVoiceCommandText: (state, action) => {
      state.cmds[action.payload.id].TriggerWord = action.payload.text;
    },
    updateVoiceCommandAction: (state, action) => {
      state.cmds[action.payload.id].action = action.payload.action;
    },
    updateVoiceCommandTextAudioSelector: (state, action) => {
      state.cmds[action.payload.id].commandType = action.payload.commandType;
    }
  }
});

export const {
  addVoiceCommand,
  deleteVoiceCommand,
  addVoiceCommandSound,
  deleteVoiceCommandSound,
  updateVoiceCommandText,
  updateVoiceCommandAction,
  updateVoiceCommandTextAudioSelector
} = voiceCommandsSlice.actions;

export default voiceCommandsSlice.reducer;