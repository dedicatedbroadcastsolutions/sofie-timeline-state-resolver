"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncResolver = void 0;
const superfly_timeline_1 = require("superfly-timeline");
const eventemitter3_1 = require("eventemitter3");
// This is a debug flag, to trace some helpful information when resolving fails.
// If should be set to false in production.
const TRACE_RESOLVING = true;
class AsyncResolver extends eventemitter3_1.EventEmitter {
    constructor(onSetTimelineTriggerTime) {
        super();
        this.cache = {};
        this.onSetTimelineTriggerTime = onSetTimelineTriggerTime;
    }
    resolveTimeline(resolveTime, timeline, limitTime, useCache) {
        try {
            const objectsFixed = this._fixNowObjects(timeline, resolveTime);
            const resolvedTimeline = this._resolveTimeline(timeline, {
                limitCount: 999,
                limitTime: limitTime,
                time: resolveTime,
                cache: useCache ? this.cache : undefined,
                traceResolving: TRACE_RESOLVING,
            });
            return {
                resolvedTimeline,
                objectsFixed,
            };
        }
        catch (e) {
            if (e instanceof superfly_timeline_1.ResolveError) {
                // Trace some helpful information related to the error:
                this.emit('error', 'Error resolveTrace: ' + JSON.stringify(e.resolvedTimeline.statistics.resolveTrace));
            }
            throw e;
        }
    }
    _resolveTimeline(timeline, options) {
        try {
            return (0, superfly_timeline_1.resolveTimeline)(timeline, options);
        }
        catch (e) {
            if (!options.traceResolving) {
                // Try again, but now with tracing:
                options.traceResolving = true;
                // Note, we expect this to throw again:
                const try2 = (0, superfly_timeline_1.resolveTimeline)(timeline, options);
                // Oh, this is weird, it worked on second try! Log the error:
                this.emit('error', 'Error when resolving timeline, but on second try with tracing, it worked! Original error:' + e);
                return try2;
            }
            throw e;
        }
    }
    _fixNowObjects(timeline, now) {
        const objectsFixed = [];
        const timeLineMap = new Map();
        const setObjectTime = (o, time) => {
            if (!Array.isArray(o.enable)) {
                o.enable.start = time; // set the objects to "now" so that they are resolved correctly temporarily
                const o2 = timeLineMap.get(o.id);
                if (o2 && !Array.isArray(o2.enable)) {
                    o2.enable.start = time;
                }
                objectsFixed.push({
                    id: o.id,
                    time: time,
                });
            }
        };
        for (const obj of timeline) {
            timeLineMap.set(obj.id, obj);
        }
        // First: fix the ones on the first level (i e not in groups), because they are easy (this also saves us one iteration time later):
        for (const o of timeLineMap.values()) {
            if (!Array.isArray(o.enable)) {
                if (o.enable.start === 'now') {
                    setObjectTime(o, now);
                }
            }
        }
        // Then, resolve the timeline to be able to set "now" inside groups, relative to parents:
        let dontIterateAgain = false;
        let wouldLikeToIterateAgain = false;
        let resolvedTimeline;
        const fixObjects = (objs, parentObject) => {
            for (const o of objs) {
                if (!Array.isArray(o.enable) && o.enable.start === 'now') {
                    // find parent, and set relative to that
                    if (parentObject) {
                        const resolvedParent = resolvedTimeline.objects[parentObject.id];
                        const parentInstance = resolvedParent.resolved.instances[0];
                        if (resolvedParent.resolved.resolvedReferences && parentInstance) {
                            dontIterateAgain = false;
                            setObjectTime(o, now - (parentInstance.originalStart ?? parentInstance.start));
                        }
                        else {
                            // the parent isn't found, it's probably not resolved (yet), try iterating once more:
                            wouldLikeToIterateAgain = true;
                        }
                    }
                    else {
                        // no parent object
                        dontIterateAgain = false;
                        setObjectTime(o, now);
                    }
                }
                if (o.isGroup && o.children) {
                    fixObjects(o.children, o);
                }
            }
        };
        for (let i = 0; i < 10; i++) {
            wouldLikeToIterateAgain = false;
            dontIterateAgain = true;
            resolvedTimeline = this._resolveTimeline(Array.from(timeLineMap.values()), {
                time: now,
            });
            fixObjects(Object.values(resolvedTimeline.objects));
            if (!wouldLikeToIterateAgain && dontIterateAgain)
                break;
        }
        if (objectsFixed.length) {
            this.onSetTimelineTriggerTime(objectsFixed);
        }
        return objectsFixed;
    }
}
exports.AsyncResolver = AsyncResolver;
//# sourceMappingURL=AsyncResolver.js.map