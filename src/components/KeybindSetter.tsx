import React, { useState } from "react";
import { Input } from "@mui/material";
import { RootState } from "../store/store";
import { updateVoiceCommandAction } from "../features/voiceCommands/voiceCommandsSlice";
import { useDispatch, useSelector } from "react-redux";

const KeybindSetter = ({ idNum }: { idNum: number }) => {
    const dispatch = useDispatch();
    const state = useSelector((state: RootState) => state.voiceCommands);

    const handleKeyDown = (event: { key: any; }) => {
        let key = event.key;
        if (state.cmds[idNum].action !== "") {
            const keys = state.cmds[idNum].action.split("+");
            if (!keys.includes(key)) {
                key = state.cmds[idNum].action + "+" + key;
            } else {
                key = state.cmds[idNum].action;
            }
        }
        dispatch(updateVoiceCommandAction({ id: idNum, action: key }));
    };

    const onClick = () => {
        dispatch(updateVoiceCommandAction({ id: idNum, action: "" }));
    };

    return (
        <div className="w-40">
            <Input
                type="text"
                value={state.cmds[idNum].action}
                onKeyDown={handleKeyDown}
                placeholder="Press any key to set keybind"
                id={"KeybindInput" + idNum}
                onClick={onClick}
                className="w-40"
                readOnly
            />
        </div>
    );
};

export default KeybindSetter;