import { ActionExecutionResult, DeviceStatus, Mappings, PanasonicPTZOptions, TSRTimelineContent, Timeline } from 'timeline-state-resolver-types';
import { Device } from '../../service/device';
import { PanasonicPtzState } from './state';
import { PanasonicPtzCommandWithContext } from './diff';
import { PanasonicPtzHttpInterface } from './connection';
export declare class PanasonicPtzDevice extends Device<PanasonicPTZOptions, PanasonicPtzState, PanasonicPtzCommandWithContext> {
    _device: PanasonicPtzHttpInterface | undefined;
    init(options: PanasonicPTZOptions): Promise<boolean>;
    terminate(): Promise<void>;
    convertTimelineStateToDeviceState(state: Timeline.TimelineState<TSRTimelineContent>, newMappings: Mappings): PanasonicPtzState;
    diffStates(oldState: PanasonicPtzState | undefined, newState: PanasonicPtzState): Array<PanasonicPtzCommandWithContext>;
    sendCommand(command: PanasonicPtzCommandWithContext): Promise<void>;
    get connected(): boolean;
    getStatus(): Omit<DeviceStatus, 'active'>;
    actions: Record<string, (id: string, payload?: Record<string, any> | undefined) => Promise<ActionExecutionResult<undefined>>>;
}
//# sourceMappingURL=index.d.ts.map