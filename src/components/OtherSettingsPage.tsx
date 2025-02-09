import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setInitState, setCurrentVoiceCommandBackend, setRecognitionStarted } from '../features/otherSettings/otherSettingsSlice';
import { RootState } from '../store/store';
import { portNumber, initPortNumber } from '../utils/pass-port-render';
import { Select, Switch, Typography, MenuItem, SelectChangeEvent } from '@mui/material'

const OtherSettingsPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    initPortNumber().then(() => {

      window.electron.fetchState().then((state) => {
        dispatch(setInitState(state.otherSettings === undefined ? { voiceCommandBackends: [], currentVoiceCommandBackend: "", isRecognitionStarted: false } : state.otherSettings));
      })});    
  }, [dispatch]);

  const backends =  useSelector((state: RootState) => state.otherSettings.voiceCommandBackends);
  const started = useSelector((state: RootState) => state.otherSettings.isRecognitionStarted);
  const currentBackend = useSelector((state: RootState) => state.otherSettings.currentVoiceCommandBackend);
  
  const [backendOption, setBackendOPtion] = useState<string>("");

  const changeBackend = (event: SelectChangeEvent<string>) => {
    const backend = event.target.value as string;
    console.log(backend);
    setBackendOPtion(backend);
    fetch('http://localhost:'+portNumber+'/setRecognitionBackend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({"currentVoiceCommandBackend" : backend}),
    });
    dispatch(setCurrentVoiceCommandBackend(backend));
  }

  const changeSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    fetch('http://localhost:'+portNumber+'/setRecognitionState', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({"recognitionState": value}),
    });
    dispatch(setRecognitionStarted(value));
  }
  

  return (
    <div>
      <Typography>其他设置</Typography>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-center items-center h-20 bg-cyan-500 text-white text-2xl cursor-pointer" >
            <label>开关识别</label>
            <Switch color="primary" size="medium" checked={started} onChange={changeSwitch}/>
        </div>
        <div className="flex justify-center items-center h-20 bg-cyan-500 text-white text-2xl cursor-pointer">
            <Select color="primary" size="medium" onChange={changeBackend} label="Backend" value={backendOption}>
                {backends.length === 0 ?
                (<MenuItem value="无识别后端" key="-1" disabled>无识别后端</MenuItem>)
                : backends.map((backend, index) => (
                    <MenuItem value={backend} key={index}>{backend}</MenuItem>
                ))}
            </Select>
        </div>
      </div>
    </div>
  );
};

export default OtherSettingsPage;
