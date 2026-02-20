import { DeviceStatus } from '../../devices/device';
import { HyperdeckOptions, Mappings, TSRTimelineContent, Timeline, HyperdeckActions, ActionExecutionResult } from 'timeline-state-resolver-types';
import { HyperdeckCommandWithContext } from './diffState';
import { HyperdeckDeviceState } from './stateBuilder';
import { Device } from '../../service/device';
/**
 * This is a wrapper for the Hyperdeck Device. Commands to any and all hyperdeck devices will be sent through here.
 */
export declare class HyperdeckDevice extends Device<HyperdeckOptions, HyperdeckDeviceState, HyperdeckCommandWithContext> {
    readonly actions: {
        [id in HyperdeckActions]: (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult>;
    };
    private readonly _hyperdeck;
    private _connected;
    private _recordingTime;
    private _minRecordingTime;
    private _recTimePollTimer;
    private _slotCount;
    private _slotStatus;
    private _transportStatus;
    private _expectedTransportStatus;
    private _suppressEmptySlotWarnings;
    /**
     * Initiates the connection with the Hyperdeck through the hyperdeck-connection lib.
     */
    init(initOptions: HyperdeckOptions): Promise<boolean>;
    /**
     * Makes this device ready for garbage collection.
     */
    terminate(): Promise<void>;
    private resyncState;
    /**
     * Sends commands to the HyperDeck to format disks. Afterwards,
     * calls this._queryRecordingTime
     */
    private formatDisks;
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     * @param oldHyperdeckState The assumed current state
     * @param newHyperdeckState The desired state of the device
     */
    diffStates(oldHyperdeckState: HyperdeckDeviceState | undefined, newHyperdeckState: HyperdeckDeviceState): Array<HyperdeckCommandWithContext>;
    sendCommand({ command, context, timelineObjId }: HyperdeckCommandWithContext): Promise<void>;
    get connected(): boolean;
    /**
     * Convert a timeline state into an hyperdeck state.
     * @param timelineState The state to be converted
     */
    convertTimelineStateToDeviceState(timelineState: Timeline.TimelineState<TSRTimelineContent>, mappings: Mappings): HyperdeckDeviceState;
    getStatus(): Omit<DeviceStatus, 'active'>;
    /**
     * Gets the current state of the device
     */
    private _queryCurrentState;
    /**
     * Queries the recording time left in seconds of the device and mutates
     * this._recordingTime
     * This is public for the unit tests
     */
    _queryRecordingTime(): Promise<void>;
    private _querySlotNumber;
    private _connectionChanged;
}
//# sourceMappingURL=index.d.ts.map