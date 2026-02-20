"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultState = exports.convertStateToPtz = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const _ = require("underscore");
function convertStateToPtz(state, mappings) {
    // convert the timeline state into something we can use
    const ptzState = getDefaultState();
    _.each(state.layers, (tlObject, layerName) => {
        const mapping = mappings[layerName];
        if (mapping &&
            mapping.device === timeline_state_resolver_types_1.DeviceType.PANASONIC_PTZ &&
            tlObject.content.deviceType === timeline_state_resolver_types_1.DeviceType.PANASONIC_PTZ
        // todo - filter for deviceId?
        ) {
            if (mapping.options.mappingType === timeline_state_resolver_types_1.MappingPanasonicPTZType.PresetMem &&
                tlObject.content.type === timeline_state_resolver_types_1.TimelineContentTypePanasonicPtz.PRESET) {
                ptzState.preset = {
                    value: tlObject.content.preset,
                    timelineObjId: tlObject.id,
                };
            }
            else if (mapping.options.mappingType === timeline_state_resolver_types_1.MappingPanasonicPTZType.PresetSpeed &&
                tlObject.content.type === timeline_state_resolver_types_1.TimelineContentTypePanasonicPtz.SPEED) {
                ptzState.speed = {
                    value: tlObject.content.speed,
                    timelineObjId: tlObject.id,
                };
            }
            else if (mapping.options.mappingType === timeline_state_resolver_types_1.MappingPanasonicPTZType.ZoomSpeed &&
                tlObject.content.type === timeline_state_resolver_types_1.TimelineContentTypePanasonicPtz.ZOOM_SPEED) {
                ptzState.zoomSpeed = {
                    value: tlObject.content.zoomSpeed,
                    timelineObjId: tlObject.id,
                };
            }
            else if (mapping.options.mappingType === timeline_state_resolver_types_1.MappingPanasonicPTZType.Zoom &&
                tlObject.content.type === timeline_state_resolver_types_1.TimelineContentTypePanasonicPtz.ZOOM) {
                ptzState.zoom = {
                    value: tlObject.content.zoom,
                    timelineObjId: tlObject.id,
                };
            }
        }
    });
    return ptzState;
}
exports.convertStateToPtz = convertStateToPtz;
function getDefaultState() {
    return {
        // preset: undefined,
        // speed: undefined,
        zoomSpeed: {
            value: 0,
            timelineObjId: 'default',
        },
        // zoom: undefined
    };
}
exports.getDefaultState = getDefaultState;
//# sourceMappingURL=state.js.map