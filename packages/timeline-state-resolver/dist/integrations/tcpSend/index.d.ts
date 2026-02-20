import { CommandWithContext, Device } from '../../service/device';
import { ActionExecutionResult, DeviceStatus, TSRTimelineContent, Timeline, TcpSendCommandContent, TCPSendOptions, TcpSendActions } from 'timeline-state-resolver-types';
export type TcpSendDeviceState = Timeline.TimelineState<TSRTimelineContent>;
export interface TcpSendDeviceCommand extends CommandWithContext {
    command: {
        commandName: 'added' | 'changed' | 'removed' | 'manual';
        content: TcpSendCommandContent;
        layer: string;
    };
}
export declare class TcpSendDevice extends Device<TCPSendOptions, TcpSendDeviceState, TcpSendDeviceCommand> {
    private activeLayers;
    private _terminated;
    private tcpConnection;
    init(options: TCPSendOptions): Promise<boolean>;
    terminate(): Promise<void>;
    get connected(): boolean;
    getStatus(): Omit<DeviceStatus, 'active'>;
    readonly actions: {
        [id in TcpSendActions]: (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult>;
    };
    convertTimelineStateToDeviceState(state: Timeline.TimelineState<TSRTimelineContent>): TcpSendDeviceState;
    diffStates(oldState: TcpSendDeviceState | undefined, newState: TcpSendDeviceState): Array<TcpSendDeviceCommand>;
    sendCommand({ timelineObjId, context, command }: TcpSendDeviceCommand): Promise<void>;
    private actionSendTcpCommand;
    private actionResetState;
    private getActiveLayersHash;
}
//# sourceMappingURL=index.d.ts.map