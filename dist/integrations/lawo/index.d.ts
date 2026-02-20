import { ActionExecutionResult, DeviceStatus, LawoOptions, Mappings, SomeMappingLawo, Timeline, TSRTimelineContent } from 'timeline-state-resolver-types';
import { Device } from '../../service/device';
import { LawoState } from './state';
import { LawoCommandWithContext } from './diff';
export declare class LawoDevice extends Device<LawoOptions, LawoState, LawoCommandWithContext> {
    private _lawo;
    init(options: LawoOptions): Promise<boolean>;
    terminate(): Promise<void>;
    convertTimelineStateToDeviceState(timelineState: Timeline.TimelineState<TSRTimelineContent>, mappings: Mappings<SomeMappingLawo>): LawoState;
    diffStates(oldState: LawoState | undefined, newState: LawoState): Array<LawoCommandWithContext>;
    sendCommand(cwc: LawoCommandWithContext): Promise<any>;
    get connected(): boolean;
    getStatus(): Omit<DeviceStatus, 'active'>;
    readonly actions: {
        [id: string]: (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult>;
    };
}
//# sourceMappingURL=index.d.ts.map