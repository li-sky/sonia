import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addVoiceCommand, setInitState } from '../features/voiceCommands/voiceCommandsSlice';
import { Command, CommandTypes, defaultCommand } from '../types/CommandType';
import { RootState } from '../store/store';
import { portNumber, initPortNumber } from '../utils/pass-port-render';
import VoiceCommandRow  from "./VoiceCommandRow";

const VocalCommandSettingsPage = () => {
  const commands = useSelector((state: RootState) => state.voiceCommands.cmds);
  const dispatch = useDispatch();

  const addCommandWhenEmpty = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    dispatch(addVoiceCommand(defaultCommand));
  };

  useEffect(() => {
    initPortNumber();
    console.log(portNumber);
    window.electron.fetchState().then((state) => {
      dispatch(setInitState(state));
    });
  }, [dispatch]);

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
