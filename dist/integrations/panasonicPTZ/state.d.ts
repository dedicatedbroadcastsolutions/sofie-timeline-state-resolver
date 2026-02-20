import { Mappings, TSRTimelineContent, Timeline } from 'timeline-state-resolver-types';
export interface PanasonicPtzState {
    speed?: {
        value: number;
        timelineObjId: string;
    };
    preset?: {
        value: number;
        timelineObjId: string;
    };
    zoomSpeed?: {
        value: number;
        timelineObjId: string;
    };
    zoom?: {
        value: number;
        timelineObjId: string;
    };
}
export declare function convertStateToPtz(state: Timeline.TimelineState<TSRTimelineContent>, mappings: Mappings): PanasonicPtzState;
export declare function getDefaultState(): PanasonicPtzState;
//# sourceMappingURL=state.d.ts.map