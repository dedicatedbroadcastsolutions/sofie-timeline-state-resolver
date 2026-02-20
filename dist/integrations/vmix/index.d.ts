import { DeviceWithState, DeviceStatus } from './../../devices/device';
import { DeviceType, DeviceOptionsVMix, VMixOptions, Mappings, Timeline, TSRTimelineContent, ActionExecutionResult, VmixActions, VmixActionExecutionPayload, VmixActionExecutionResult } from 'timeline-state-resolver-types';
import { VMixStateExtended } from './vMixStateDiffer';
import { CommandContext, VMixStateCommandWithContext } from './vMixCommands';
export interface DeviceOptionsVMixInternal extends DeviceOptionsVMix {
    commandReceiver?: CommandReceiver;
}
export type CommandReceiver = (time: number, cmd: VMixStateCommandWithContext, context: CommandContext, timelineObjId: string) => Promise<any>;
export type EnforceableVMixInputStateKeys = 'duration' | 'loop' | 'transform' | 'layers' | 'listFilePaths';
/**
 * This is a VMixDevice, it sends commands when it feels like it
 */
export declare class VMixDevice extends DeviceWithState<VMixStateExtended, DeviceOptionsVMixInternal> {
    private _doOnTime;
    private _commandReceiver;
    /** Setup in init */
    private _vMixConnection;
    private _vMixCommandSender;
    private _connected;
    private _initialized;
    private _stateDiffer;
    private _timelineStateConverter;
    private _xmlStateParser;
    private _stateSynchronizer;
    private _expectingStateAfterConnecting;
    private _expectingPolledState;
    private _pollingTimer;
    constructor(deviceId: string, deviceOptions: DeviceOptionsVMixInternal, getCurrentTime: () => Promise<number>);
    init(options: VMixOptions): Promise<boolean>;
    private _onDataReceived;
    private _connectionChanged;
    private _setConnected;
    /**
     * Updates the entire state when we (re)connect
     * @param realState State as reported by vMix itself.
     */
    private _setFullState;
    /**
     * Runs when we receive XML state from vMix,
     * generally as the result a poll (if polling/enforcement is enabled).
     * @param realState State as reported by vMix itself.
     */
    private _setPartialInputState;
    /** Called by the Conductor a bit before a .handleState is called */
    prepareForHandleState(newStateTime: number): void;
    handleState(newState: Timeline.TimelineState<TSRTimelineContent>, newMappings: Mappings): void;
    clearFuture(clearAfterTime: number): void;
    terminate(): Promise<void>;
    getStatus(): DeviceStatus;
    makeReady(okToDestroyStuff?: boolean): Promise<void>;
    executeAction<A extends VmixActions>(actionId: A, payload: VmixActionExecutionPayload<A>): Promise<VmixActionExecutionResult<A>>;
    _checkPresetAction(payload?: any, payloadRequired?: boolean): ActionExecutionResult | undefined;
    private _lastPreset;
    private _openPreset;
    private _savePreset;
    get canConnect(): boolean;
    get connected(): boolean;
    get deviceType(): DeviceType;
    get deviceName(): string;
    get queue(): {
        id: string;
        queueId: string;
        time: number;
        args: any[];
    }[];
    private addToQueue;
    private _defaultCommandReceiver;
    /**
     * Request vMix's XML status.
     */
    private _requestVMixState;
}
//# sourceMappingURL=index.d.ts.map