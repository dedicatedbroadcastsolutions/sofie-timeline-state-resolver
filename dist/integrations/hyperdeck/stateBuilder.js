"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTimelineStateToHyperdeckState = exports.getDefaultHyperdeckState = void 0;
const hyperdeck_connection_1 = require("hyperdeck-connection");
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const DEFAULT_SPEED = 100; // 1x speed
const DEFAULT_LOOP = false;
const DEFAULT_SINGLE_CLIP = true;
const DEFAULT_CLIP_ID = null;
function getDefaultHyperdeckState() {
    const res = {
        notify: {
            // TODO - this notify block will want configuring per device or will the state lib always want it the same?
            remote: false,
            transport: false,
            slot: false,
            configuration: false,
            droppedFrames: false,
        },
        transport: {
            status: hyperdeck_connection_1.TransportStatus.STOPPED,
            speed: DEFAULT_SPEED,
            loop: DEFAULT_LOOP,
            singleClip: DEFAULT_SINGLE_CLIP,
            clipId: DEFAULT_CLIP_ID,
        },
        timelineObjId: '',
    };
    return res;
}
exports.getDefaultHyperdeckState = getDefaultHyperdeckState;
function convertTimelineStateToHyperdeckState(state, mappings) {
    // Convert the timeline state into something we can use easier:
    const deviceState = getDefaultHyperdeckState();
    const sortedLayers = Object.entries(state)
        .map(([layerName, tlObject]) => ({ layerName, tlObject }))
        .sort((a, b) => a.layerName.localeCompare(b.layerName));
    for (const { tlObject, layerName } of sortedLayers) {
        const content = tlObject.content;
        const mapping = mappings[layerName];
        if (!mapping || content.deviceType !== timeline_state_resolver_types_1.DeviceType.HYPERDECK)
            continue;
        if (mapping.options.mappingType === timeline_state_resolver_types_1.MappingHyperdeckType.Transport &&
            content.type === timeline_state_resolver_types_1.TimelineContentTypeHyperdeck.TRANSPORT) {
            if (!deviceState.transport) {
                switch (content.status) {
                    case hyperdeck_connection_1.TransportStatus.PREVIEW:
                    case hyperdeck_connection_1.TransportStatus.STOPPED:
                    case hyperdeck_connection_1.TransportStatus.FORWARD:
                    case hyperdeck_connection_1.TransportStatus.REWIND:
                    case hyperdeck_connection_1.TransportStatus.JOG:
                    case hyperdeck_connection_1.TransportStatus.SHUTTLE:
                        deviceState.transport = {
                            status: content.status,
                            speed: DEFAULT_SPEED,
                            loop: DEFAULT_LOOP,
                            singleClip: DEFAULT_SINGLE_CLIP,
                            clipId: DEFAULT_CLIP_ID,
                        };
                        break;
                    case hyperdeck_connection_1.TransportStatus.PLAY:
                        deviceState.transport = {
                            status: content.status,
                            speed: content.speed ?? DEFAULT_SPEED,
                            loop: content.loop ?? DEFAULT_LOOP,
                            singleClip: content.singleClip ?? DEFAULT_SINGLE_CLIP,
                            clipId: content.clipId,
                        };
                        break;
                    case hyperdeck_connection_1.TransportStatus.RECORD:
                        deviceState.transport = {
                            status: content.status,
                            speed: DEFAULT_SPEED,
                            loop: DEFAULT_LOOP,
                            singleClip: DEFAULT_SINGLE_CLIP,
                            clipId: DEFAULT_CLIP_ID,
                            recordFilename: content.recordFilename,
                        };
                        break;
                    default:
                        // @ts-ignore never
                        throw new Error(`Unsupported status "${content.status}"`);
                }
            }
            deviceState.transport.status = content.status;
            if (content.status === hyperdeck_connection_1.TransportStatus.RECORD) {
                deviceState.transport.recordFilename = content.recordFilename;
            }
            else if (content.status === hyperdeck_connection_1.TransportStatus.PLAY) {
                deviceState.transport.speed = content.speed ?? DEFAULT_SPEED;
                deviceState.transport.loop = content.loop ?? DEFAULT_LOOP;
                deviceState.transport.singleClip = content.singleClip ?? DEFAULT_SINGLE_CLIP;
                deviceState.transport.clipId = content.clipId;
            }
        }
    }
    return deviceState;
}
exports.convertTimelineStateToHyperdeckState = convertTimelineStateToHyperdeckState;
//# sourceMappingURL=stateBuilder.js.map