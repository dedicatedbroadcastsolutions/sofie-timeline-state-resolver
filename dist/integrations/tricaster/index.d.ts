import { Mappings, TriCasterOptions, DeviceOptionsTriCaster, Timeline, TSRTimelineContent, ActionExecutionResult, DeviceStatus } from 'timeline-state-resolver-types';
import { WithContext, TriCasterState } from './triCasterStateDiffer';
import { TriCasterCommandWithContext } from './triCasterCommands';
import { Device } from '../../service/device';
export type DeviceOptionsTriCasterInternal = DeviceOptionsTriCaster;
export declare class TriCasterDevice extends Device<TriCasterOptions, WithContext<TriCasterState>, TriCasterCommandWithContext> {
    readonly actions: {
        [id: string]: (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult>;
    };
    private _connected;
    private _initialized;
    private _isTerminating;
    private _connection?;
    private _stateDiffer?;
    init(options: TriCasterOptions): Promise<boolean>;
    private _setInitialState;
    private _setConnected;
    /**
     * Convert a timeline state into an Tricaster state.
     * @param timelineState The state to be converted
     */
    convertTimelineStateToDeviceState(timelineState: Timeline.TimelineState<TSRTimelineContent>, mappings: Mappings): WithContext<TriCasterState>;
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     * @param oldAtemState
     * @param newAtemState
     */
    diffStates(oldTriCasterState: WithContext<TriCasterState> | undefined, newTriCasterState: WithContext<TriCasterState>, _mappings: Mappings): Array<TriCasterCommandWithContext>;
    private filterTriCasterMappings;
    terminate(): Promise<void>;
    getStatus(): Omit<DeviceStatus, 'active'>;
    get connected(): boolean;
    sendCommand(commandWithContext: TriCasterCommandWithContext): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map