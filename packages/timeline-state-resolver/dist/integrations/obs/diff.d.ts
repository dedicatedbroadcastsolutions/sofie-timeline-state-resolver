import { OBSCommandWithContext } from '.';
import { OBSDeviceState } from './state';
export declare function diffStates(oldState: OBSDeviceState, newState: OBSDeviceState, getSceneItemId: (scene: string, source: string) => number | undefined): Array<OBSCommandWithContext>;
/**
 * Enum derived from keyof OBSRequestTypes in obs-websocket-js
 */
export declare enum OBSRequestName {
    SET_CURRENT_SCENE = "SetCurrentProgramScene",
    SET_PREVIEW_SCENE = "SetCurrentPreviewScene",
    SET_CURRENT_TRANSITION = "SetCurrentSceneTransition",
    START_RECORDING = "StartRecord",
    STOP_RECORDING = "StopRecord",
    START_STREAMING = "StartStream",
    STOP_STREAMING = "StopStream",
    SET_SCENE_ITEM_ENABLED = "SetSceneItemEnabled",
    SET_SCENE_ITEM_TRANSFORM = "SetSceneItemTransform",
    SET_MUTE = "SetInputMute",
    SET_SOURCE_SETTINGS = "SetInputSettings",
    SET_INPUT_VOLUME = "SetInputVolume",
    TRIGGER_MEDIA_INPUT_ACTION = "TriggerMediaInputAction",
    SET_MEDIA_INPUT_CURSOR = "SetMediaInputCursor"
}
//# sourceMappingURL=diff.d.ts.map