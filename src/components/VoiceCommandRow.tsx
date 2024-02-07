import React, { useState } from "react";
import {
    ButtonGroup,
    Button,
    Switch,
    Input,
    Select,
    Option
} from "@material-tailwind/react";
import {
    Add,
    PlayCircleOutline,
    Mic,
    Delete,
} from "@mui/icons-material";
import { CSSTransition } from "react-transition-group";
import KeybindSetter from './KeybindSetter.tsx';
import "./VoiceCommandRow.css";

import { Command } from "../types/CommandType";
import { RootState } from "../store/store";
import { useSelector, useDispatch } from "react-redux";
import { addVoiceCommand, updateVoiceCommandText, updateVoiceCommandTextAudioSelector} from "../features/voiceCommands/voiceCommandsSlice.ts";
import { CommandTypes } from "../types/CommandType.ts";

const VoiceCommandRow: React.FC<Command> = ({ id, ...otherProps }) => {
	const dispatch = useDispatch();
	const thisCommandType : CommandTypes = useSelector((state: RootState) => state.voiceCommands.cmds[id].commandType);

	const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(updateVoiceCommandTextAudioSelector({id: id, commandType: event.target.checked === true ? CommandTypes.VoiceCommand : CommandTypes.TextCommand, VoiceCommandList: [0]}));
	};

	const recordAudioAndSave = (event: React.MouseEvent<HTMLButtonElement>) => {
		const { ipcRenderer } = require('electron');

		// 请求开始录音
		ipcRenderer.invoke('start-recording');
		
		// 接收录音数据
		ipcRenderer.on('recording-data', (event, chunk) => {
		  // 处理录音数据...
		});
	}

	const [currentlySelectedVoiceLine, setCurrentlySelectedVoiceLine] = useState(-1);

	return (
		<div className="flex-col" id={id}>
			<div className="h-5"> </div>
			<div className="flex justify-center items-center space-x-4">
				<div className="flex items-center ml-2 mr-2 whitespace-nowrap">
					语音
				</div>
				<Switch
				color="cyan"
				ripple={true}
				onChange={handleSwitchChange}
				id={"VoiceLine" + id}
				crossOrigin={undefined}
				checked={otherProps.commandType === CommandTypes.VoiceCommand}
				/>
				<div className="flex items-center ml-2 mr-2 whitespace-nowrap">
					词汇
				</div>
				<div className="relative flex items-center space-x-4">
					<div className="flex relative flex-col items-center justify-center min-w-80">
						<CSSTransition
							in={otherProps.commandType === CommandTypes.VoiceCommand}
							timeout={500}
							classNames="fade-right"
							unmountOnExit
						>
							<div className="absolute w-40 items-center">
								<Input label="语音词汇" id={"Input" + id} crossOrigin={undefined} value={otherProps.TriggerWord} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {dispatch(updateVoiceCommandText({id: id, text: event.target.value}))}}></Input>
							</div>
						</CSSTransition>
						<CSSTransition
							in={!(otherProps.commandType === CommandTypes.VoiceCommand)}
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
										onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setCurrentlySelectedVoiceLine(parseInt(event.target.value))}
									>
										{otherProps.VoiceCommandList.length > 0 ? (
											otherProps.VoiceCommandList.map((id: number) => (
												<Option key={id.toString()} value={id.toString()}>{id.toString()}</Option>
											))
										) : (
											<Option value="-1" disabled>新增音频...</Option>
										)}
									</Select>
								</div>
								<div className="">
									<ButtonGroup className="flex lm-20" color="cyan" placeholder={undefined}>
										<Button
											color="cyan"
											ripple={true}
											id={"MicButton" + id}
											fullWidth
											onClick={recordAudioAndSave}
											placeholder={undefined}
										>
											<Mic />
										</Button>
										<Button color="cyan" ripple={true} id={"DeleteButtonSound" + id} placeholder={undefined}>
											<Delete />
										</Button>
									</ButtonGroup>
								</div>
							</div>
						</CSSTransition>
					</div>
					<ButtonGroup className="flex lm-20" color="cyan"  placeholder={undefined}>
						<Button color="cyan" ripple={true} id={"PlayButton" + id}  placeholder={undefined}>
							<PlayCircleOutline />
						</Button>
						<Button color="cyan" ripple={true} id={"AddButton" + id}  placeholder={undefined} onClick={() => {dispatch(addVoiceCommand({id: id}))}}>
							<Add />
						</Button>
						<Button color="cyan" ripple={true} id={"DeleteButton" + id}  placeholder={undefined}>
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