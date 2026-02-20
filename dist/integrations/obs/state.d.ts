import { Mappings, OBSSceneItemTransform, TSRTimelineContent, Timeline } from 'timeline-state-resolver-types';
import { JsonObject } from 'type-fest';
export declare function convertStateToOBS(state: Timeline.TimelineState<TSRTimelineContent>, mappings: Mappings): OBSDeviceState;
export declare function getDefaultState(t: number): OBSDeviceState;
export interface OBSDeviceState {
    time: number;
    currentScene: string | undefined;
    previewScene: string | undefined;
    currentTransition: string | undefined;
    recording: boolean | undefined;
    streaming: boolean | undefined;
    scenes: {
        [key: string]: OBSScene;
    };
    inputs: {
        [key: string]: OBSInputState;
    };
}
export interface OBSScene {
    sceneItems: {
        [key: string]: OBSSceneItem;
    };
}
export interface OBSSceneItem {
    render?: boolean;
    transform?: OBSSceneItemTransform;
}
export interface OBSInputState {
    inputSettings?: {
        sourceType: string;
        settings?: JsonObject;
    };
    mediaSettings?: {
        playTime?: number;
        seek?: number;
        state?: 'playing' | 'paused' | 'stopped';
    };
    audio?: {
        muted?: boolean;
        volume?: number;
    };
}
//# sourceMappingURL=state.d.ts.map