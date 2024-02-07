export enum CommandTypes {
    VoiceCommand,
    TextCommand
}

interface SingleVoiceCommand {
    id: number;
    commandStorage: string;
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