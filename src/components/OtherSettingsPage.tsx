import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setInitState, setCurrentVoiceCommandBackend, setRecognitionStarted } from '../features/otherSettings/otherSettingsSlice';
import { RootState } from '../store/store';
import { portNumber, initPortNumber } from '../utils/pass-port-render';
import { Select, Switch, Typography, Option } from '@material-tailwind/react';

const OtherSettingsPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    initPortNumber().then(() => {
      fetch('http://localhost:'+portNumber+'/getOtherSettingsState', {
        method: 'GET',
      }).then(response => response.json()).then(data => {
        dispatch(setInitState(data));
      })});    
  }, [dispatch]);

  const backends =  useSelector((state: RootState) => state.otherSettings.voiceCommandBackends);
  const started = useSelector((state: RootState) => state.otherSettings.isRecognitionStarted);
  const currentBackend = useSelector((state: RootState) => state.otherSettings.currentVoiceCommandBackend);
  
  const [backendOption, setBackendOPtion] = useState<string>("");

  const changeBackend = (backend: string) => {
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
            <Switch color="cyan" size="lg" checked={started} onChange={changeSwitch}/>
        </div>
        <div className="flex justify-center items-center h-20 bg-cyan-500 text-white text-2xl cursor-pointer">
            <label>选择识别后端</label>
            <Select color="cyan" size="lg" onChange={changeBackend} label="Backend">
                {backends.length === 0 ?
                (<Option value="无识别后端" key="-1" disabled>无识别后端</Option>)
                : backends.map((backend, index) => (
                    <Option value={backend}>{backend}</Option>
                ))}
            </Select>
        </div>
      </div>
    </div>
  );
};

export default OtherSettingsPage;
