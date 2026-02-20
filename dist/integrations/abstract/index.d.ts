import { DeviceStatus } from './../../devices/device';
import { AbstractOptions, Timeline, TSRTimelineContent, ActionExecutionResult, DeviceOptionsAbstract, AbstractActions } from 'timeline-state-resolver-types';
import { Device } from '../../service/device';
export interface AbstractCommandWithContext {
    command: string;
    timelineObjId: string;
    context: string;
}
export type DeviceOptionsAbstractInternal = DeviceOptionsAbstract;
export type AbstractDeviceState = Timeline.TimelineState<TSRTimelineContent>;
export declare class AbstractDevice extends Device<AbstractOptions, AbstractDeviceState, AbstractCommandWithContext> {
    readonly actions: {
        [id in AbstractActions]: (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult>;
    };
    readonly connected = false;
    /**
     * Initiates the connection with CasparCG through the ccg-connection lib.
     */
    init(_initOptions: AbstractOptions): Promise<boolean>;
    /**
     * Dispose of the device so it can be garbage collected.
     */
    terminate(): Promise<void>;
    /**
     * converts the timeline state into something we can use
     * @param state
     */
    convertTimelineStateToDeviceState(state: Timeline.TimelineState<TSRTimelineContent>): Timeline.TimelineState<TSRTimelineContent>;
    getStatus(): Omit<DeviceStatus, 'active'>;
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     * @param oldAbstractState
     * @param newAbstractState
     */
    diffStates(oldAbstractState: AbstractDeviceState | undefined, newAbstractState: AbstractDeviceState): AbstractCommandWithContext[];
    sendCommand({ command, context, timelineObjId }: AbstractCommandWithContext): Promise<any>;
}
//# sourceMappingURL=index.d.ts.map