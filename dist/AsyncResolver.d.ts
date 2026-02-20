import { ResolvedTimeline } from 'superfly-timeline';
import { TimelineTriggerTimeResult } from './conductor';
import { TSRTimeline, TSRTimelineContent } from 'timeline-state-resolver-types';
import { EventEmitter } from 'eventemitter3';
export type AsyncResolverEvents = {
    error: [string];
};
export declare class AsyncResolver extends EventEmitter<AsyncResolverEvents> {
    private readonly onSetTimelineTriggerTime;
    private cache;
    constructor(onSetTimelineTriggerTime: (res: TimelineTriggerTimeResult) => void);
    resolveTimeline(resolveTime: number, timeline: TSRTimeline, limitTime: number, useCache: boolean): {
        resolvedTimeline: ResolvedTimeline<TSRTimelineContent & import("timeline-state-resolver-types").TimelineDatastoreReferencesContent>;
        objectsFixed: TimelineTriggerTimeResult;
    };
    private _resolveTimeline;
    private _fixNowObjects;
}
//# sourceMappingURL=AsyncResolver.d.ts.map