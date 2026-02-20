import { HTTPWatcherOptions, ActionExecutionResult, DeviceStatus } from 'timeline-state-resolver-types';
import { CommandWithContext, Device } from '../../service/device';
type HTTPWatcherDeviceState = Record<string, never>;
/**
 * This is a HTTPWatcherDevice, requests a uri on a regular interval and watches
 * it's response.
 */
export declare class HTTPWatcherDevice extends Device<HTTPWatcherOptions, HTTPWatcherDeviceState, CommandWithContext> {
    readonly actions: Record<string, (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult>>;
    private uri?;
    /** Setup in init */
    private httpMethod;
    private expectedHttpResponse;
    private headers?;
    private keyword;
    /** Setup in init */
    private intervalTime;
    private interval;
    private status;
    private statusReason;
    private onInterval;
    private stopInterval;
    private startInterval;
    private handleResponse;
    init(options: HTTPWatcherOptions): Promise<boolean>;
    terminate(): Promise<void>;
    getStatus(): Omit<DeviceStatus, 'active'>;
    private _setStatus;
    get connected(): boolean;
    convertTimelineStateToDeviceState(): HTTPWatcherDeviceState;
    diffStates(): Array<CommandWithContext>;
    sendCommand(): Promise<void>;
}
export {};
//# sourceMappingURL=index.d.ts.map