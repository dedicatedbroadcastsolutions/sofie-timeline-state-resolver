"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBSRequestName = exports.diffStates = void 0;
const _ = require("underscore");
const lib_1 = require("../../lib");
function diffStates(oldState, newState, getSceneItemId) {
    const commands = [
        ...resolveCurrentSceneState(oldState, newState),
        ...resolveCurrentTransitionState(oldState, newState),
        ...resolveRecordingStreaming(oldState, newState),
        ...resolveScenes(oldState, newState, getSceneItemId),
        ...resolveInputSettings(oldState, newState),
    ];
    return commands;
}
exports.diffStates = diffStates;
function resolveCurrentSceneState(oldState, newState) {
    const commands = [];
    const oldCurrentScene = oldState.currentScene;
    const newCurrentScene = newState.currentScene;
    if (newCurrentScene !== undefined) {
        if (oldCurrentScene !== newCurrentScene) {
            commands.push((0, lib_1.literal)({
                command: {
                    requestName: OBSRequestName.SET_CURRENT_SCENE,
                    args: {
                        sceneName: newCurrentScene,
                    },
                },
                context: `currentScene changed from "${oldCurrentScene}" to "${newCurrentScene}"`,
                timelineObjId: '',
            }));
        }
    }
    const oldPreviewScene = oldState.previewScene;
    const newPreviewScene = newState.previewScene;
    if (newPreviewScene !== undefined) {
        if (oldPreviewScene !== newPreviewScene) {
            commands.push((0, lib_1.literal)({
                command: {
                    requestName: OBSRequestName.SET_PREVIEW_SCENE,
                    args: {
                        sceneName: newPreviewScene,
                    },
                },
                context: `previewScene changed from "${oldPreviewScene}" to "${newPreviewScene}"`,
                timelineObjId: '',
            }));
        }
    }
    return commands;
}
function resolveCurrentTransitionState(oldState, newState) {
    const commands = [];
    const oldCurrentTransition = oldState.currentTransition;
    const newCurrentTransition = newState.currentTransition;
    if (newCurrentTransition !== undefined) {
        if (oldCurrentTransition !== newCurrentTransition) {
            commands.push((0, lib_1.literal)({
                command: {
                    requestName: OBSRequestName.SET_CURRENT_TRANSITION,
                    args: {
                        transitionName: newCurrentTransition,
                    },
                },
                context: 'currentTransition changed',
                timelineObjId: '',
            }));
        }
    }
    return commands;
}
function resolveRecordingStreaming(oldState, newState) {
    const commands = [];
    const oldRecording = oldState.recording;
    const newRecording = newState.recording;
    if (newRecording !== undefined) {
        if (oldRecording !== newRecording) {
            commands.push((0, lib_1.literal)({
                command: {
                    requestName: newRecording ? OBSRequestName.START_RECORDING : OBSRequestName.STOP_RECORDING,
                    args: undefined,
                },
                context: 'recording changed',
                timelineObjId: '',
            }));
        }
    }
    const oldStreaming = oldState.streaming;
    const newStreaming = newState.streaming;
    if (newStreaming !== undefined) {
        if (oldStreaming !== newStreaming) {
            commands.push((0, lib_1.literal)({
                command: {
                    requestName: newStreaming ? OBSRequestName.START_STREAMING : OBSRequestName.STOP_STREAMING,
                    args: undefined,
                },
                context: 'streaming changed',
                timelineObjId: '',
            }));
        }
    }
    return commands;
}
function resolveScenes(oldState, newState, getSceneItemId) {
    const commands = [];
    const oldScenes = oldState.scenes;
    const newScenes = newState.scenes;
    Object.entries(newScenes).forEach(([sceneName, scene]) => {
        Object.entries(scene.sceneItems).forEach(([source, newSceneItemProperties]) => {
            const oldSceneItemProperties = oldScenes[sceneName]?.sceneItems[source];
            const itemId = getSceneItemId(sceneName, source);
            if (!itemId)
                return; // can't do anything without it
            if (newSceneItemProperties.render !== undefined &&
                newSceneItemProperties.render !== oldSceneItemProperties?.render) {
                commands.push((0, lib_1.literal)({
                    command: {
                        requestName: OBSRequestName.SET_SCENE_ITEM_ENABLED,
                        args: {
                            sceneName: sceneName,
                            sceneItemId: itemId,
                            sceneItemEnabled: newSceneItemProperties.render,
                        },
                    },
                    context: `scene ${sceneName} item ${source} changed render`,
                    timelineObjId: '',
                }));
            }
            if (newSceneItemProperties.transform !== undefined &&
                newSceneItemProperties.transform !== oldSceneItemProperties?.transform) {
                commands.push((0, lib_1.literal)({
                    command: {
                        requestName: OBSRequestName.SET_SCENE_ITEM_TRANSFORM,
                        args: {
                            sceneName: sceneName,
                            sceneItemId: itemId,
                            sceneItemTransform: newSceneItemProperties.transform, // type assertion kind of mid - is there something typefest can fix?
                        },
                    },
                    context: `scene ${sceneName} item ${source} changed transform`,
                    timelineObjId: '',
                }));
            }
        });
    });
    return commands;
}
function resolveInputSettings(oldState, newState) {
    const commands = [];
    const oldSources = oldState.inputs;
    const newSources = newState.inputs;
    Object.entries(newSources).forEach(([sourceName, source]) => {
        // settings
        if (source.inputSettings?.settings &&
            !_.isEqual(source.inputSettings?.settings, oldSources[sourceName]?.inputSettings?.settings)) {
            commands.push((0, lib_1.literal)({
                command: {
                    requestName: OBSRequestName.SET_SOURCE_SETTINGS,
                    args: {
                        inputName: sourceName,
                        inputSettings: source.inputSettings?.settings,
                    },
                },
                context: `source ${sourceName} changed settings`,
                timelineObjId: '',
            }));
        }
        // audio
        if (!_.isEqual(source.audio, oldSources[sourceName]?.audio)) {
            if (source.audio?.muted !== undefined) {
                commands.push((0, lib_1.literal)({
                    command: {
                        requestName: OBSRequestName.SET_MUTE,
                        args: {
                            inputName: sourceName,
                            inputMuted: source.audio.muted,
                        },
                    },
                    context: `source ${sourceName} changed settings`,
                    timelineObjId: '',
                }));
            }
            if (source.audio?.volume !== undefined) {
                commands.push((0, lib_1.literal)({
                    command: {
                        requestName: OBSRequestName.SET_INPUT_VOLUME,
                        args: {
                            inputName: sourceName,
                            inputVolumeDb: source.audio.volume,
                        },
                    },
                    context: `source ${sourceName} changed settings`,
                    timelineObjId: '',
                }));
            }
        }
        // media
        const oldMedia = oldSources[sourceName]?.mediaSettings;
        if (!_.isEqual(source.mediaSettings, oldMedia)) {
            // changed playback state
            if (source.mediaSettings?.state !== oldMedia?.state) {
                switch (source.mediaSettings?.state) {
                    case 'paused':
                        commands.push((0, lib_1.literal)({
                            command: {
                                requestName: OBSRequestName.TRIGGER_MEDIA_INPUT_ACTION,
                                args: {
                                    inputName: sourceName,
                                    mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PAUSE',
                                },
                            },
                            context: `source ${sourceName} started playback`,
                            timelineObjId: '',
                        }));
                        break;
                    case 'playing':
                        commands.push((0, lib_1.literal)({
                            command: {
                                requestName: OBSRequestName.TRIGGER_MEDIA_INPUT_ACTION,
                                args: {
                                    inputName: sourceName,
                                    mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY',
                                },
                            },
                            context: `source ${sourceName} playing`,
                            timelineObjId: '',
                        }));
                        break;
                    case 'stopped':
                        commands.push((0, lib_1.literal)({
                            command: {
                                requestName: OBSRequestName.TRIGGER_MEDIA_INPUT_ACTION,
                                args: {
                                    inputName: sourceName,
                                    mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP',
                                },
                            },
                            context: `source ${sourceName} stopped`,
                            timelineObjId: '',
                        }));
                        break;
                }
            }
            // changed timing
            if (source.mediaSettings?.playTime !== oldMedia?.playTime || source.mediaSettings?.seek !== oldMedia?.seek) {
                if (!source.mediaSettings?.playTime &&
                    source.mediaSettings?.seek &&
                    source.mediaSettings?.seek !== oldMedia?.seek) {
                    // we don't know when we started so just use the seek
                    commands.push((0, lib_1.literal)({
                        command: {
                            requestName: OBSRequestName.SET_MEDIA_INPUT_CURSOR,
                            args: {
                                inputName: sourceName,
                                mediaCursor: source.mediaSettings.seek,
                            },
                        },
                        context: `source ${sourceName} changed seek position`,
                        timelineObjId: '',
                    }));
                }
                else if (source.mediaSettings?.playTime) {
                    // calculate the offset properly
                    const seek = source.mediaSettings?.seek ?? 0;
                    const offset = newState.time - source.mediaSettings?.playTime;
                    const cursor = seek + offset; // cursor in ms - is this correct???
                    commands.push((0, lib_1.literal)({
                        command: {
                            requestName: OBSRequestName.SET_MEDIA_INPUT_CURSOR,
                            args: {
                                inputName: sourceName,
                                mediaCursor: cursor,
                            },
                        },
                        context: `source ${sourceName} changed seek position or startTime`,
                        timelineObjId: '',
                    }));
                }
            }
        }
    });
    return commands;
}
/**
 * Enum derived from keyof OBSRequestTypes in obs-websocket-js
 */
var OBSRequestName;
(function (OBSRequestName) {
    OBSRequestName["SET_CURRENT_SCENE"] = "SetCurrentProgramScene";
    OBSRequestName["SET_PREVIEW_SCENE"] = "SetCurrentPreviewScene";
    OBSRequestName["SET_CURRENT_TRANSITION"] = "SetCurrentSceneTransition";
    OBSRequestName["START_RECORDING"] = "StartRecord";
    OBSRequestName["STOP_RECORDING"] = "StopRecord";
    OBSRequestName["START_STREAMING"] = "StartStream";
    OBSRequestName["STOP_STREAMING"] = "StopStream";
    OBSRequestName["SET_SCENE_ITEM_ENABLED"] = "SetSceneItemEnabled";
    OBSRequestName["SET_SCENE_ITEM_TRANSFORM"] = "SetSceneItemTransform";
    OBSRequestName["SET_MUTE"] = "SetInputMute";
    OBSRequestName["SET_SOURCE_SETTINGS"] = "SetInputSettings";
    OBSRequestName["SET_INPUT_VOLUME"] = "SetInputVolume";
    OBSRequestName["TRIGGER_MEDIA_INPUT_ACTION"] = "TriggerMediaInputAction";
    OBSRequestName["SET_MEDIA_INPUT_CURSOR"] = "SetMediaInputCursor";
})(OBSRequestName = exports.OBSRequestName || (exports.OBSRequestName = {}));
//# sourceMappingURL=diff.js.map