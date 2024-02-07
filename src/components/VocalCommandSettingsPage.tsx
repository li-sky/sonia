import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addVoiceCommand } from '../features/voiceCommands/voiceCommandsSlice.ts';
import { Command, CommandTypes, defaultCommand } from '../types/CommandType.ts';
import { RootState } from '../store/store';
import VoiceCommandRow  from "./VoiceCommandRow.tsx";


const VocalCommandSettingsPage = () => {
  const commands = useSelector((state: RootState) => state.voiceCommands.cmds);
  const dispatch = useDispatch();

  const addCommandWhenEmpty = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    dispatch(addVoiceCommand(defaultCommand));
  }
  

  return (
    <div>
      {commands.length === 0 ? (
        <div onClick={addCommandWhenEmpty} className="flex justify-center items-center h-20 bg-cyan-500 text-white text-2xl cursor-pointer">
          添加语音命令
        </div>
      ) : (
        commands.map((cmd) => <VoiceCommandRow key={cmd.id} {...cmd} />)
      )}
    </div>
  );
};

export default VocalCommandSettingsPage;
