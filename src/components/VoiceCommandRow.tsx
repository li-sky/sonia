import React, { useState } from "react";
import {
    ButtonGroup,
    Button,
    Switch,
    Input,
    Select,
	MenuItem,
	SelectChangeEvent
} from "@mui/material";
import {
    Add,
    PlayCircleOutline,
    Mic,
    Delete,
} from "@mui/icons-material";
import { CSSTransition } from "react-transition-group";
import { v1 as uuidv1 } from "uuid";

import KeybindSetter from './KeybindSetter';

import { Command } from "../types/CommandType";
import { RootState } from "../store/store";
import { useSelector, useDispatch } from "react-redux";
import { addVoiceCommand, deleteVoiceCommand, updateVoiceCommandText, updateVoiceCommandTextAudioSelector, addVoiceCommandSound, deleteVoiceCommandSound} from "../features/voiceCommands/voiceCommandsSlice";
import { CommandTypes } from "../types/CommandType";
import { ipcRenderer } from 'electron';
import { current } from "@reduxjs/toolkit";


const VoiceCommandRow: React.FC<Command> = ({ id, ...otherProps }) => {
	const dispatch = useDispatch();
	const thisCommandType : CommandTypes = useSelector((state: RootState) => state.voiceCommands.cmds[id].commandType);

	const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(updateVoiceCommandTextAudioSelector({id: id, commandType: event.target.checked === true ? CommandTypes.TextCommand : CommandTypes.VoiceCommand, VoiceCommandList: [0]}));
	};
		
	const [currentlySelectedVoiceLine, setCurrentlySelectedVoiceLine] = useState(-1);

	const recordAudioAndSave = (event: React.MouseEvent<HTMLButtonElement>) => {
		navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
			const mediaRecorder = new MediaRecorder(stream);
			let audioChunks: (ArrayBuffer)[] = [];

			mediaRecorder.addEventListener("dataavailable", event => {
				const reader = new FileReader();
				reader.readAsArrayBuffer(event.data);
				reader.onloadend = () => {
					audioChunks.push(reader.result as ArrayBuffer);
					console.log(audioChunks);
					const arrayBuffer = audioChunks[0];
					let audio_id = uuidv1();
					console.log(audio_id, arrayBuffer);
					window.electron.sendAudioData(audio_id.toString(), arrayBuffer);
					
					dispatch(addVoiceCommandSound({id: id, uuid: audio_id}));
					setCurrentlySelectedVoiceLine(otherProps.VoiceCommandList.length);
				};
			});

			mediaRecorder.addEventListener("start", () => {
				audioChunks = [];
			});

			mediaRecorder.addEventListener("stop", () => {
				
			});

			mediaRecorder.start();

			setTimeout(() => {
				mediaRecorder.stop();
			}, 3000);

		});
	};


	const playAudio = async (event: React.MouseEvent<HTMLButtonElement>) => {
		if (otherProps.commandType === CommandTypes.VoiceCommand) {
			if (currentlySelectedVoiceLine !== -1) {
				let ret = await window.electron.fetchAudioData(otherProps.VoiceCommandList[currentlySelectedVoiceLine].uuid);
				console.log(ret);
				if (ret !== null) {
					// ret is an array. We need to convert it to a buffer
					const blob = new Blob([ret], { type: 'audio/mp3' });
					const url = URL.createObjectURL(blob);
					const audio = new Audio(url);
					audio.play();
				}
			}
		} else {
			speechSynthesis.speak(new SpeechSynthesisUtterance(otherProps.TriggerWord));
		}
	};


	return (
		<div className="flex-col" id={id.toString()}>
			<div className="h-5"> </div>
			<div className="flex justify-center items-center space-x-4">
				<div className="flex items-center ml-2 mr-2 whitespace-nowrap">
					语音
				</div>
				<Switch
				color="primary"
				onChange={handleSwitchChange}
				id={"VoiceLine" + id}
				checked={otherProps.commandType === CommandTypes.TextCommand}
				/>
				<div className="flex items-center ml-2 mr-2 whitespace-nowrap">
					词汇
				</div>
				<div className="relative flex items-center space-x-4">
					<div className="flex relative flex-col items-center justify-center min-w-80">
						<CSSTransition
							in={otherProps.commandType === CommandTypes.TextCommand}
							timeout={500}
							classNames="fade-right"
							unmountOnExit
						>
							<div className="absolute w-40 items-center">
								<Input placeholder="语音词汇" id={"Input" + id} value={otherProps.TriggerWord} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {dispatch(updateVoiceCommandText({id: id, text: event.target.value}))}}></Input>
							</div>
						</CSSTransition>
						<CSSTransition
							in={!(otherProps.commandType === CommandTypes.TextCommand)}
							timeout={500}
							classNames="fade-left"
							unmountOnExit
						>
							<div className="flex space-x-5 items-center">
								<div className="">
									<Select 
										label="选择音频" 
										className="!min-w-[100px]" 
										placeholder={undefined} 
										value={currentlySelectedVoiceLine.toString()} 
										onChange={(event: SelectChangeEvent<string>) => setCurrentlySelectedVoiceLine(parseInt(event.target.value))}
									>
										{otherProps.VoiceCommandList.length > 0 ? (
											otherProps.VoiceCommandList.map(({id, uuid}) => (
												<MenuItem key={uuid} id={id.toString()} value={id.toString()}>{id.toString()}</MenuItem>
											))
										) : (
											<MenuItem value="-1" disabled>新增音频...</MenuItem>
										)}
									</Select>
								</div>
								<div className="">
									<ButtonGroup className="flex lm-20" color="primary">
										<Button
											color="primary"
											id={"MicButton" + id}
											fullWidth
											onClick={recordAudioAndSave}
										>
											<Mic />
										</Button>
										<Button color="primary" id={"DeleteButtonSound" + id} onClick={() => {dispatch(deleteVoiceCommandSound({id:id ,soundid: currentlySelectedVoiceLine}))}}>
											<Delete />
										</Button>
									</ButtonGroup>
								</div>
							</div>
						</CSSTransition>
					</div>
					<ButtonGroup className="flex lm-20" color="primary" >
						<Button color="primary" id={"PlayButton" + id}  onClick={playAudio}>
							<PlayCircleOutline />
						</Button>
						<Button color="primary" id={"AddButton" + id}  onClick={() => {dispatch(addVoiceCommand({id: id}))}}>
							<Add />
						</Button>
						<Button color="primary" id={"DeleteButton" + id}  onClick={() => {dispatch(deleteVoiceCommand(id))}}>
							<Delete />
						</Button>
					</ButtonGroup>
					<KeybindSetter idNum={id} />
				</div>
			</div>
		</div>
	);
};

export default VoiceCommandRow;