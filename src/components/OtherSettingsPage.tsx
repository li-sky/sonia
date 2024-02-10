import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setInitState, setCurrentVoiceCommandBackend, setRecognitionStarted } from '../features/otherSettings/otherSettingsSlice.ts';
import { RootState } from '../store/store';
import { portNumber, initPortNumber } from '../utils/pass-port-render.js';
import { Select, Switch, Typography } from '@material-tailwind/react';

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

  const changeBackend = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const backend = event.target.value;
    fetch('http://localhost:'+portNumber+'/setVoiceCommandBackend', {
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
            <Select color="cyan" size="lg" onChange={changeBackend} value={currentBackend}>
                {backends.length === 0 ?
                (<option value="无识别后端" key="-1" disabled>无识别后端</option>)
                : (backends.map(
                    (backend) => <option value={backend} key={backend}>
                        {backend}
                        </option>))}
            </Select>
        </div>
      </div>
    </div>
  );
};

export default OtherSettingsPage;
