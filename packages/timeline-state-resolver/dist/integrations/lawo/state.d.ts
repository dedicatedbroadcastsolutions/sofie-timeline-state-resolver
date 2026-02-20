import { Mappings, TSRTimelineContent, Timeline } from 'timeline-state-resolver-types';
import { EmberValue } from 'emberplus-connection/dist/types';
import { Model as EmberModel } from 'emberplus-connection';
export interface LawoState {
    faders: {
        identifier: string;
        value: EmberValue;
        transitionDuration?: number;
        priority: number;
        timelineObjId: string;
    }[];
    nodes: {
        identifier: string;
        value: EmberValue;
        valueType?: EmberModel.ParameterType;
        priority: number;
        timelineObjId: string;
    }[];
    triggerValue?: string;
}
export declare function convertTimelineStateToLawoState(state: Timeline.TimelineState<TSRTimelineContent>, mappings: Mappings): LawoState;
//# sourceMappingURL=state.d.ts.map