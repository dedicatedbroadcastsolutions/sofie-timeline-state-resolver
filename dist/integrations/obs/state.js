"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultState = exports.convertStateToOBS = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const _ = require("underscore");
function convertStateToOBS(state, mappings) {
    const deviceState = getDefaultState(state.time);
    // Sort layer based on Mapping type (to make sure audio is after inputs) and Layer name
    const sortedLayers = _.sortBy(_.map(state.layers, (tlObject, layerName) => {
        const tlObjectExt = tlObject;
        let mapping = mappings[layerName];
        if (!mapping && tlObjectExt.isLookahead && tlObjectExt.lookaheadForLayer) {
            mapping = mappings[tlObjectExt.lookaheadForLayer];
        }
        return {
            layerName,
            tlObject,
            mapping,
        };
    }).sort((a, b) => a.layerName.localeCompare(b.layerName)), (o) => o.mapping?.options?.mappingType);
    _.each(sortedLayers, ({ tlObject, mapping }) => {
        if (mapping && tlObject.content.deviceType === timeline_state_resolver_types_1.DeviceType.OBS) {
            switch (mapping.options.mappingType) {
                case timeline_state_resolver_types_1.MappingObsType.CurrentScene:
                    if (tlObject.content.type === timeline_state_resolver_types_1.TimelineContentTypeOBS.CURRENT_SCENE) {
                        if (tlObject.isLookahead) {
                            deviceState.previewScene = tlObject.content.sceneName;
                        }
                        else {
                            deviceState.currentScene = tlObject.content.sceneName;
                        }
                    }
                    break;
                case timeline_state_resolver_types_1.MappingObsType.CurrentTransition:
                    if (tlObject.content.type === timeline_state_resolver_types_1.TimelineContentTypeOBS.CURRENT_TRANSITION) {
                        if (tlObject.isLookahead) {
                            // CurrentTransiton can't be looked ahead, same below
                            break;
                        }
                        deviceState.currentTransition = tlObject.content.transitionName;
                    }
                    break;
                case timeline_state_resolver_types_1.MappingObsType.Recording:
                    if (tlObject.content.type === timeline_state_resolver_types_1.TimelineContentTypeOBS.RECORDING) {
                        if (tlObject.isLookahead) {
                            // CurrentTransiton can't be looked ahead, same below
                            break;
                        }
                        deviceState.recording = tlObject.content.on;
                    }
                    break;
                case timeline_state_resolver_types_1.MappingObsType.Streaming:
                    if (tlObject.content.type === timeline_state_resolver_types_1.TimelineContentTypeOBS.STREAMING) {
                        if (tlObject.isLookahead) {
                            // CurrentTransiton can't be looked ahead, same below
                            break;
                        }
                        deviceState.streaming = tlObject.content.on;
                    }
                    break;
                case timeline_state_resolver_types_1.MappingObsType.InputAudio:
                    if (tlObject.content.type === timeline_state_resolver_types_1.TimelineContentTypeOBS.INPUT_AUDIO) {
                        if (tlObject.isLookahead) {
                            // InputAudio can't be looked ahead, same below
                            break;
                        }
                        const input = mapping.options.input;
                        const audioProps = deviceState.inputs[input]?.audio;
                        if (!deviceState.inputs[input])
                            deviceState.inputs[input] = {};
                        deviceState.inputs[input].audio = {
                            muted: tlObject.content.mute ?? audioProps?.muted,
                            volume: tlObject.content.volume ?? audioProps?.volume,
                        };
                    }
                    break;
                case timeline_state_resolver_types_1.MappingObsType.InputSettings:
                    if (tlObject.content.type === timeline_state_resolver_types_1.TimelineContentTypeOBS.INPUT_SETTINGS) {
                        if (tlObject.isLookahead) {
                            // InputSettings can't be looked ahead, same below
                            break;
                        }
                        const input = mapping.options.input;
                        if (!deviceState.inputs[input]) {
                            deviceState.inputs[input] = {};
                        }
                        deviceState.inputs[input].inputSettings = {
                            sourceType: tlObject.content.sourceType,
                            settings: tlObject.content.sourceSettings,
                        };
                    }
                    break;
                case timeline_state_resolver_types_1.MappingObsType.InputMedia:
                    if (tlObject.content.type === timeline_state_resolver_types_1.TimelineContentTypeOBS.INPUT_MEDIA) {
                        if (tlObject.isLookahead) {
                            // InputMedia can't be looked ahead, same below
                            break;
                        }
                        const input = mapping.options.input;
                        if (!deviceState.inputs[input])
                            deviceState.inputs[input] = {};
                        deviceState.inputs[input].mediaSettings = {
                            playTime: tlObject.instance.originalStart ?? tlObject.instance.start,
                            seek: tlObject.content.seek,
                            state: tlObject.content.state,
                        };
                    }
                    break;
                case timeline_state_resolver_types_1.MappingObsType.SceneItem:
                    if (tlObject.content.type === timeline_state_resolver_types_1.TimelineContentTypeOBS.SCENE_ITEM) {
                        if (tlObject.isLookahead) {
                            // SceneItem can't be looked ahead, same below
                            break;
                        }
                        const source = mapping.options.source;
                        const sceneName = mapping.options.sceneName;
                        if (!deviceState.scenes[sceneName])
                            deviceState.scenes[sceneName] = { sceneItems: {} };
                        deviceState.scenes[sceneName].sceneItems[source] = {
                            render: tlObject.content.on,
                            transform: tlObject.content.transform,
                        };
                    }
                    break;
            }
        }
    });
    return deviceState;
}
exports.convertStateToOBS = convertStateToOBS;
function getDefaultState(t) {
    return {
        time: t,
        currentScene: undefined,
        previewScene: undefined,
        currentTransition: undefined,
        recording: undefined,
        streaming: undefined,
        scenes: {},
        inputs: {},
    };
}
exports.getDefaultState = getDefaultState;
//# sourceMappingURL=state.js.map