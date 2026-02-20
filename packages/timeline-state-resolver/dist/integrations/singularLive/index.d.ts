import { SingularLiveOptions, SingularCompositionControlNode, Mappings, TSRTimelineContent, Timeline, DeviceStatus, ActionExecutionResult } from 'timeline-state-resolver-types';
import { Device } from '../../service/device';
export interface SingularLiveControlNodeCommandContent extends SingularLiveCommandContent {
    state?: string;
    payload?: {
        [controlNodeField: string]: string;
    };
}
export interface SingularLiveCommandContent {
    subCompositionName: string;
}
export interface SingularLiveCommandContext {
    command: Command;
    context: string;
    timelineObjId: string;
}
interface Command {
    commandName: 'added' | 'changed' | 'removed';
    content: SingularLiveCommandContent | SingularLiveControlNodeCommandContent;
    layer: string;
}
export interface SingularComposition {
    timelineObjId: string;
    controlNode: SingularCompositionControlNode;
}
export interface SingularLiveState {
    compositions: {
        [key: string]: SingularComposition;
    };
}
/**
 * This is a Singular.Live device, it talks to a Singular.Live App Instance using an Access Token
 */
export declare class SingularLiveDevice extends Device<SingularLiveOptions, SingularLiveState, SingularLiveCommandContext> {
    readonly actions: {
        [id: string]: (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult>;
    };
    private _accessToken;
    init(initOptions: SingularLiveOptions): Promise<boolean>;
    terminate(): Promise<void>;
    getStatus(): Omit<DeviceStatus, 'active'>;
    get connected(): boolean;
    private _getDefaultState;
    convertTimelineStateToDeviceState(state: Timeline.TimelineState<TSRTimelineContent>, newMappings: Mappings<unknown>): SingularLiveState;
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     */
    diffStates(oldSingularLiveState: SingularLiveState | undefined, newSingularLiveState: SingularLiveState, _mappings: Mappings<unknown>, _time: number): SingularLiveCommandContext[];
    sendCommand({ command, context, timelineObjId }: SingularLiveCommandContext): Promise<any>;
}
export {};
//# sourceMappingURL=index.d.ts.map