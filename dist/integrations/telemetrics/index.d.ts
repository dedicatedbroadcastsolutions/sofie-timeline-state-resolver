import { ActionExecutionResult, DeviceStatus, Mappings, TelemetricsOptions, Timeline, TSRTimelineContent } from 'timeline-state-resolver-types';
import { Device } from '../../service/device';
interface TelemetricsState {
    presetShotIdentifiers: number[];
}
interface TelemetricsCommandWithContext {
    command: {
        presetShotIdentifier: number;
    };
    context: string;
    timelineObjId: string;
}
/**
 * Connects to a Telemetrics Device on port 5000 using a TCP socket.
 * This class uses a fire and forget approach.
 */
export declare class TelemetricsDevice extends Device<TelemetricsOptions, TelemetricsState, TelemetricsCommandWithContext> {
    readonly actions: {
        [id: string]: (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult>;
    };
    private socket;
    private statusCode;
    private errorMessage;
    private retryConnectionTimer;
    get connected(): boolean;
    getStatus(): Omit<DeviceStatus, 'active'>;
    diffStates(oldState: TelemetricsState | undefined, newState: TelemetricsState, _mappings: Mappings<unknown>, _time: number): TelemetricsCommandWithContext[];
    convertTimelineStateToDeviceState(state: Timeline.TimelineState<TSRTimelineContent>, _newMappings: Mappings<unknown>): TelemetricsState;
    sendCommand({ command, context, timelineObjId }: TelemetricsCommandWithContext): Promise<void>;
    init(options: TelemetricsOptions): Promise<boolean>;
    private connectToDevice;
    private setupSocket;
    private updateStatus;
    private reconnect;
    terminate(): Promise<void>;
}
export {};
//# sourceMappingURL=index.d.ts.map