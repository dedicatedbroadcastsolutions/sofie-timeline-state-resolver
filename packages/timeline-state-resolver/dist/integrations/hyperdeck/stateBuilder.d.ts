import { Commands as HyperdeckCommands, TransportStatus } from 'hyperdeck-connection';
import { Mappings, TSRTimelineContent, Timeline } from 'timeline-state-resolver-types';
export interface HyperdeckDeviceTransportState {
    status: TransportStatus;
    speed: number;
    singleClip: boolean;
    loop: boolean;
    clipId: number | null;
    recordFilename?: string;
}
export interface HyperdeckDeviceState {
    notify: HyperdeckCommands.NotifyCommandResponse;
    transport: HyperdeckDeviceTransportState;
    /** The timelineObject this state originates from */
    timelineObjId: string;
}
export declare function getDefaultHyperdeckState(): HyperdeckDeviceState;
export declare function convertTimelineStateToHyperdeckState(state: Timeline.StateInTime<TSRTimelineContent>, mappings: Mappings): HyperdeckDeviceState;
//# sourceMappingURL=stateBuilder.d.ts.map