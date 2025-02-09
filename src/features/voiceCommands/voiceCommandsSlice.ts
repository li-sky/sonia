import { createSlice } from '@reduxjs/toolkit';
import { CommandTypes, Command, SingleVoiceCommand  } from '../../types/CommandType';


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
        label: '',
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
      state.cmds[action.payload.id].VoiceCommandList = [...state.cmds[action.payload.id].VoiceCommandList, {id: state.cmds[action.payload.id].VoiceCommandList.length, uuid: action.payload.uuid}];
    },
    deleteVoiceCommandSound: (state, action) => {
      state.cmds[action.payload.id].VoiceCommandList = state.cmds[action.payload.id].VoiceCommandList.filter(sound => sound.id !== action.payload.soundid);
      // make sure ids are continuous
      for (let i = 0; i < state.cmds[action.payload.id].VoiceCommandList.length; i++) {
        state.cmds[action.payload.id].VoiceCommandList[i].id = i;
      }
    },
    updateVoiceCommandAction: (state, action) => {
      state.cmds[action.payload.id].action = action.payload.action;
    },
    setInitState(state, action) {
      return {...state, ...JSON.parse(JSON.stringify(action.payload))};
    },
    changeVoiceCommandLabel: (state, action) => {
      state.cmds[action.payload.id].label = action.payload.label;
    }
  }
});

export const {
  addVoiceCommand,
  deleteVoiceCommand,
  addVoiceCommandSound,
  deleteVoiceCommandSound,
  updateVoiceCommandAction,
  changeVoiceCommandLabel,
  setInitState
} = voiceCommandsSlice.actions;

export default voiceCommandsSlice.reducer;