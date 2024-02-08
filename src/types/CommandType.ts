export enum CommandTypes {
    VoiceCommand,
    TextCommand
}

export interface SingleVoiceCommand {
    id: number;
    uuid: string;
}

export interface Command {
    id: number;
    commandType: CommandTypes;
    action: string;
    VoiceCommandList: SingleVoiceCommand[];
    TriggerWord: string;
}

export const defaultCommand: Command = {
    id: -1,
    commandType: CommandTypes.VoiceCommand,
    action: '',
    VoiceCommandList: [],
    TriggerWord: ''
}

export const defaultSingleVoiceCommand: SingleVoiceCommand = {
    id: -1,
    uuid: ''
}