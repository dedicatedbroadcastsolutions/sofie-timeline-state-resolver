import { ActionExecutionResult, DeviceStatus, OSCMessageCommandContent, OSCOptions, Timeline, TSRTimelineContent } from 'timeline-state-resolver-types';
import { Device } from '../../service/device';
export interface OscDeviceState {
    [address: string]: OSCDeviceStateContent;
}
interface OSCDeviceStateContent extends OSCMessageCommandContent {
    fromTlObject: string;
}
export interface OscCommandWithContext {
    command: any;
    context: string;
    timelineObjId: string;
}
export declare class OscDevice extends Device<OSCOptions, OscDeviceState, OscCommandWithContext> {
    /** Setup in init */
    private _oscClient;
    private _oscClientStatus;
    private transitions;
    private transitionInterval;
    private options;
    init(options: OSCOptions): Promise<boolean>;
    terminate(): Promise<void>;
    convertTimelineStateToDeviceState(state: Timeline.TimelineState<TSRTimelineContent>): OscDeviceState;
    diffStates(oldState: OscDeviceState | undefined, newState: OscDeviceState): Array<OscCommandWithContext>;
    sendCommand({ command, context, timelineObjId }: OscCommandWithContext): Promise<any>;
    get connected(): boolean;
    getStatus(): Omit<DeviceStatus, 'active'>;
    readonly actions: Record<string, (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult>>;
    private _oscSender;
    private runAnimation;
    private getMonotonicTime;
}
export {};
//# sourceMappingURL=index.d.ts.map