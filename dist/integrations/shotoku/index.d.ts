import { ActionExecutionResult, DeviceStatus, Timeline, TimelineContentShotokuSequence, ShotokuCommandContent, TSRTimelineContent, ShotokuOptions } from 'timeline-state-resolver-types';
import { Device } from '../../service/device';
import { ShotokuCommand } from './connection';
export interface ShotokuDeviceState {
    shots: Record<string, ShotokuCommandContent & {
        fromTlObject: string;
    }>;
    sequences: Record<string, ShotokuSequence>;
}
interface ShotokuSequence {
    fromTlObject: string;
    shots: TimelineContentShotokuSequence['shots'];
}
export interface ShotokuCommandWithContext {
    command: ShotokuCommand;
    context: string;
    timelineObjId: string;
}
export declare class ShotokuDevice extends Device<ShotokuOptions, ShotokuDeviceState, ShotokuCommandWithContext> {
    private readonly _shotoku;
    init(options: ShotokuOptions): Promise<boolean>;
    terminate(): Promise<void>;
    convertTimelineStateToDeviceState(state: Timeline.TimelineState<TSRTimelineContent>): ShotokuDeviceState;
    diffStates(oldState: ShotokuDeviceState | undefined, newState: ShotokuDeviceState): Array<ShotokuCommandWithContext>;
    sendCommand({ command, context, timelineObjId }: ShotokuCommandWithContext): Promise<void>;
    get connected(): boolean;
    getStatus(): Omit<DeviceStatus, 'active'>;
    readonly actions: Record<string, (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult>>;
}
export {};
//# sourceMappingURL=index.d.ts.map