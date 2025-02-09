import React, { useState } from "react";
import {
    ButtonGroup,
    Button,
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

import { Command , CommandTypes } from "../types/CommandType";
import { RootState } from "../store/store";
import { useSelector, useDispatch } from "react-redux";
import { addVoiceCommand, deleteVoiceCommand, addVoiceCommandSound, deleteVoiceCommandSound, changeVoiceCommandLabel } from "../features/voiceCommands/voiceCommandsSlice";
import { ipcRenderer } from 'electron';
import { current } from "@reduxjs/toolkit";


const VoiceCommandRow: React.FC<Command> = ({ id, ...otherProps }) => {
	const dispatch = useDispatch();
	const thisCommandType: CommandTypes = CommandTypes.VoiceCommand;
		
	const [currentlySelectedVoiceLine, setCurrentlySelectedVoiceLine] = useState('');

	const recordAudioAndSave = (event: React.MouseEvent<HTMLButtonElement>) => {
		navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
			const mediaRecorder = new MediaRecorder(stream);
			let audioChunks: (ArrayBuffer)[] = [];

			mediaRecorder.addEventListener("dataavailable", event => {
				const reader = new FileReader();
				reader.readAsArrayBuffer(event.data);
				reader.onloadend = () => {
					audioChunks.push(reader.result as ArrayBuffer);
					const arrayBuffer = audioChunks[0];
					const audio_id = uuidv1();
					window.electron.sendAudioData(audio_id.toString(), arrayBuffer);
					dispatch(addVoiceCommandSound({ id: id, uuid: audio_id }));
					setCurrentlySelectedVoiceLine(otherProps.VoiceCommandList.length.toString());
				};
			});

			mediaRecorder.addEventListener("start", () => {
				audioChunks = [];
			});

			mediaRecorder.start();

			setTimeout(() => {
				mediaRecorder.stop();
			}, 3000);

		});
	};

	const playAudio = async (event: React.MouseEvent<HTMLButtonElement>) => {
		if (currentlySelectedVoiceLine !== '') {
			const ret = await window.electron.fetchAudioData(otherProps.VoiceCommandList[parseInt(currentlySelectedVoiceLine)].uuid);
			if (ret !== null) {
				const blob = new Blob([ret], { type: 'audio/mp3' });
				const url = URL.createObjectURL(blob);
				const audio = new Audio(url);
				audio.play();
			}
		}
	};

	return (
		<div className="flex-col" id={id.toString()}>
			<div className="h-5"> </div>
			<div className="flex justify-center items-center space-x-4">
				<div className="flex items-center ml-2 mr-2 whitespace-nowrap">
					<Input type="text" className="" id={"Name"+id} onChange={(event) => {dispatch(changeVoiceCommandLabel({ id: id, label: event.target.value }))}} value={otherProps.label}
					/>
				</div>
				<div className="flex items-center">
					<div className="flex flex-row items-center justify-center">
						<div className="flex items-center">
							<div className="flex items-center">
								<Select 
									label="选择音频" 
									className="!min-w-[100px]" 
									value={currentlySelectedVoiceLine}
									displayEmpty
									onChange={(event: SelectChangeEvent<string>) => setCurrentlySelectedVoiceLine(event.target.value)}
								>
									<MenuItem value="">
										<em>选择音频...</em>
									</MenuItem>
									{otherProps.VoiceCommandList.map(({ id, uuid }, index) => (
										<MenuItem key={uuid} value={index.toString()}>
											{`音频 ${index + 1}`}
										</MenuItem>
									))}
								</Select>
							</div>
							<div className="">
								<ButtonGroup className="flex ml-2" color="primary">
									<Button color="primary" id={"MicButton" + id} fullWidth onClick={recordAudioAndSave}>
										<Mic />
									</Button>
									<Button color="primary" id={"DeleteButtonSound" + id} onClick={() => {dispatch(deleteVoiceCommandSound({ id, soundid: currentlySelectedVoiceLine }))}}>
										<Delete />
									</Button>
								</ButtonGroup>
							</div>
						</div>
						<div className="ml-2">
							<ButtonGroup className="flex lm-20" color="primary">
								<Button color="primary" id={"PlayButton" + id} onClick={playAudio}>
									<PlayCircleOutline />
								</Button>
								<Button color="primary" id={"AddButton" + id} onClick={() => {dispatch(addVoiceCommand({ id }))}}>
									<Add />
								</Button>
								<Button color="primary" id={"DeleteButton" + id} onClick={() => {dispatch(deleteVoiceCommand(id))}}>
									<Delete />
								</Button>
							</ButtonGroup>
						</div>
						<KeybindSetter idNum={id}/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VoiceCommandRow;