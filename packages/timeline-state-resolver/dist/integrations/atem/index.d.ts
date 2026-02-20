import { DeviceStatus } from './../../devices/device';
import { AtemOptions, Mappings, Timeline, TSRTimelineContent, ActionExecutionResult, AtemActions } from 'timeline-state-resolver-types';
import { State as DeviceState } from 'atem-state';
import { Commands as AtemCommands } from 'atem-connection';
import { Device } from '../../service/device';
export interface AtemCommandWithContext {
    command: AtemCommands.ISerializableCommand[];
    context: string;
    timelineObjId: string;
}
type AtemDeviceState = DeviceState;
/**
 * This is a wrapper for the Atem Device. Commands to any and all atem devices will be sent through here.
 */
export declare class AtemDevice extends Device<AtemOptions, AtemDeviceState, AtemCommandWithContext> {
    readonly actions: {
        [id in AtemActions]: (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult>;
    };
    private readonly _atem;
    private _protocolVersion;
    private _connected;
    private _atemStatus;
    /**
     * Initiates the connection with the ATEM through the atem-connection lib
     * and initiates Atem State lib.
     */
    init(options: AtemOptions): Promise<boolean>;
    /**
     * Safely terminate everything to do with this device such that it can be
     * garbage collected.
     */
    terminate(): Promise<void>;
    private resyncState;
    get connected(): boolean;
    /**
     * Convert a timeline state into an Atem state.
     * @param timelineState The state to be converted
     */
    convertTimelineStateToDeviceState(timelineState: Timeline.TimelineState<TSRTimelineContent>, mappings: Mappings): AtemDeviceState;
    /**
     * Check status and return it with useful messages appended.
     */
    getStatus(): Omit<DeviceStatus, 'active'>;
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     * @param oldAtemState
     * @param newAtemState
     */
    diffStates(oldAtemState: AtemDeviceState | undefined, newAtemState: AtemDeviceState, mappings: Mappings): Array<AtemCommandWithContext>;
    sendCommand({ command, context, timelineObjId }: AtemCommandWithContext): Promise<void>;
    private _onAtemStateChanged;
    private _connectionChanged;
}
export {};
//# sourceMappingURL=index.d.ts.map