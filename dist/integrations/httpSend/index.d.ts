import { CommandWithContext, Device } from '../../service/device';
import { ActionExecutionResult, DeviceStatus, HTTPSendCommandContent, HTTPSendOptions, HttpSendActions, SendCommandResult, TSRTimelineContent, Timeline } from 'timeline-state-resolver-types';
import CacheableLookup from 'cacheable-lookup';
export type HttpSendDeviceState = Timeline.TimelineState<TSRTimelineContent>;
export interface HttpSendDeviceCommand extends CommandWithContext {
    command: {
        commandName: 'added' | 'changed' | 'removed' | 'retry' | 'manual';
        content: HTTPSendCommandContent;
        layer: string;
    };
}
export declare class HTTPSendDevice extends Device<HTTPSendOptions, HttpSendDeviceState, HttpSendDeviceCommand> {
    /** Setup in init */
    protected options: HTTPSendOptions;
    /** Maps layers -> sent command-hashes */
    protected trackedState: Map<string, string>;
    protected readonly cacheable: CacheableLookup;
    protected _terminated: boolean;
    init(options: HTTPSendOptions): Promise<boolean>;
    terminate(): Promise<void>;
    get connected(): boolean;
    getStatus(): Omit<DeviceStatus, 'active'>;
    readonly actions: {
        [id in HttpSendActions]: (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult<any>>;
    };
    private executeResyncAction;
    private executeSendCommandAction;
    convertTimelineStateToDeviceState(state: Timeline.TimelineState<TSRTimelineContent>): HttpSendDeviceState;
    diffStates(oldState: HttpSendDeviceState | undefined, newState: HttpSendDeviceState): Array<HttpSendDeviceCommand>;
    sendCommand({ timelineObjId, context, command }: HttpSendDeviceCommand): Promise<void>;
    sendCommandWithResult({ timelineObjId, context, command, }: HttpSendDeviceCommand): Promise<ActionExecutionResult<SendCommandResult>>;
    private getTrackedStateHash;
}
//# sourceMappingURL=index.d.ts.map