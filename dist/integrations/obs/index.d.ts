import { DeviceStatus, Mappings, OBSOptions, TSRTimelineContent, Timeline } from 'timeline-state-resolver-types';
import { Device } from '../../service/device';
import { OBSDeviceState } from './state';
import { OBSRequestTypes } from 'obs-websocket-js';
export type OBSCommandWithContext = OBSCommandWithContextTyped<keyof OBSRequestTypes>;
export interface OBSCommandWithContextTyped<Type extends keyof OBSRequestTypes> {
    command: {
        requestName: Type;
        args?: OBSRequestTypes[Type];
    };
    context: string;
    timelineObjId: string;
}
export declare class OBSDevice extends Device<OBSOptions, OBSDeviceState, OBSCommandWithContext> {
    private _options;
    private _obs;
    init(options: OBSOptions): Promise<boolean>;
    terminate(): Promise<void>;
    get connected(): boolean;
    getStatus(): Omit<DeviceStatus, 'active'>;
    actions: {};
    convertTimelineStateToDeviceState(state: Timeline.TimelineState<TSRTimelineContent>, newMappings: Mappings): OBSDeviceState;
    diffStates(oldState: OBSDeviceState | undefined, newState: OBSDeviceState): Array<OBSCommandWithContext>;
    sendCommand(command: OBSCommandWithContext): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map