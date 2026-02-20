import { PharosOptions, Mappings, TSRTimelineContent, Timeline, ActionExecutionResult, DeviceStatus } from 'timeline-state-resolver-types';
import { Pharos } from './connection';
import { Device, DeviceContextAPI } from '../../service/device';
export interface PharosCommandWithContext {
    command: CommandContent;
    context: string;
    timelineObjId: string;
}
export type PharosState = Timeline.StateInTime<TSRTimelineContent>;
interface CommandContent {
    fcn: (pharos: Pharos) => Promise<unknown>;
}
/**
 * This is a wrapper for a Pharos-devices,
 * https://www.pharoscontrols.com/downloads/documentation/application-notes/
 */
export declare class PharosDevice extends Device<PharosOptions, PharosState, PharosCommandWithContext> {
    readonly actions: {
        [id: string]: (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult>;
    };
    private _pharos;
    constructor(context: DeviceContextAPI<PharosState>);
    /**
     * Initiates the connection with Pharos through the PharosAPI.
     */
    init(initOptions: PharosOptions): Promise<boolean>;
    terminate(): Promise<void>;
    get connected(): boolean;
    convertTimelineStateToDeviceState(timelineState: Timeline.TimelineState<TSRTimelineContent>, _mappings: Mappings): PharosState;
    getStatus(): Omit<DeviceStatus, 'active'>;
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     * @param oldAtemState
     * @param newAtemState
     */
    diffStates(oldPharosState: PharosState | undefined, newPharosState: PharosState, mappings: Mappings): Array<PharosCommandWithContext>;
    sendCommand({ command, context, timelineObjId }: PharosCommandWithContext): Promise<void>;
    private _connectionChanged;
}
export {};
//# sourceMappingURL=index.d.ts.map