"use strict";
var _AtemStateBuilder_deviceState;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtemStateBuilder = void 0;
const tslib_1 = require("tslib");
const atem_connection_1 = require("atem-connection");
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const _ = require("underscore");
const atem_state_1 = require("atem-state");
const lib_1 = require("../../lib");
class AtemStateBuilder {
    constructor() {
        // Start out with default state:
        _AtemStateBuilder_deviceState.set(this, atem_connection_1.AtemStateUtil.Create());
    }
    static fromTimeline(timelineState, mappings) {
        const builder = new AtemStateBuilder();
        // Sort layer based on Layer name
        const sortedLayers = _.map(timelineState, (tlObject, layerName) => ({ layerName, tlObject })).sort((a, b) => a.layerName.localeCompare(b.layerName));
        // For every layer, augment the state
        _.each(sortedLayers, ({ tlObject, layerName }) => {
            const content = tlObject.content;
            const mapping = mappings[layerName];
            if (mapping && content.deviceType === timeline_state_resolver_types_1.DeviceType.ATEM) {
                switch (mapping.options.mappingType) {
                    case timeline_state_resolver_types_1.MappingAtemType.MixEffect:
                        if (content.type === timeline_state_resolver_types_1.TimelineContentTypeAtem.ME) {
                            builder._applyMixEffect(mapping.options, content);
                        }
                        break;
                    case timeline_state_resolver_types_1.MappingAtemType.DownStreamKeyer:
                        if (content.type === timeline_state_resolver_types_1.TimelineContentTypeAtem.DSK) {
                            builder._applyDownStreamKeyer(mapping.options, content);
                        }
                        break;
                    case timeline_state_resolver_types_1.MappingAtemType.SuperSourceBox:
                        if (content.type === timeline_state_resolver_types_1.TimelineContentTypeAtem.SSRC) {
                            builder._applySuperSourceBox(mapping.options, content);
                        }
                        break;
                    case timeline_state_resolver_types_1.MappingAtemType.SuperSourceProperties:
                        if (content.type === timeline_state_resolver_types_1.TimelineContentTypeAtem.SSRCPROPS) {
                            builder._applySuperSourceProperties(mapping.options, content);
                        }
                        break;
                    case timeline_state_resolver_types_1.MappingAtemType.Auxilliary:
                        if (content.type === timeline_state_resolver_types_1.TimelineContentTypeAtem.AUX) {
                            builder._applyAuxilliary(mapping.options, content);
                        }
                        break;
                    case timeline_state_resolver_types_1.MappingAtemType.MediaPlayer:
                        if (content.type === timeline_state_resolver_types_1.TimelineContentTypeAtem.MEDIAPLAYER) {
                            builder._applyMediaPlayer(mapping.options, content);
                        }
                        break;
                    case timeline_state_resolver_types_1.MappingAtemType.AudioChannel:
                        if (content.type === timeline_state_resolver_types_1.TimelineContentTypeAtem.AUDIOCHANNEL) {
                            builder._applyAudioChannel(mapping.options, content);
                        }
                        break;
                    case timeline_state_resolver_types_1.MappingAtemType.AudioRouting:
                        if (content.type === timeline_state_resolver_types_1.TimelineContentTypeAtem.AUDIOROUTING) {
                            builder._applyAudioRouting(mapping.options, content);
                        }
                        break;
                    case timeline_state_resolver_types_1.MappingAtemType.MacroPlayer:
                        if (content.type === timeline_state_resolver_types_1.TimelineContentTypeAtem.MACROPLAYER) {
                            builder._applyMacroPlayer(mapping.options, content);
                        }
                        break;
                    case timeline_state_resolver_types_1.MappingAtemType.ColorGenerator:
                        if (content.type === timeline_state_resolver_types_1.TimelineContentTypeAtem.COLORGENERATOR) {
                            builder._applyColorGenerator(mapping.options, content);
                        }
                        break;
                    default:
                        (0, lib_1.assertNever)(mapping.options);
                        break;
                }
            }
        });
        return tslib_1.__classPrivateFieldGet(builder, _AtemStateBuilder_deviceState, "f");
    }
    _isAssignableToNextStyle(transition) {
        return (transition !== undefined && transition !== timeline_state_resolver_types_1.AtemTransitionStyle.DUMMY && transition !== timeline_state_resolver_types_1.AtemTransitionStyle.CUT);
    }
    _applyMixEffect(mapping, content) {
        if (typeof mapping.index !== 'number' || mapping.index < 0)
            return;
        const stateMixEffect = (0, lib_1.deepMerge)(atem_connection_1.AtemStateUtil.getMixEffect(tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f"), mapping.index), _.omit(content.me, 'upstreamKeyers', 'transitionPosition'));
        tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").video.mixEffects[mapping.index] = stateMixEffect;
        if (content.me.transitionPosition !== undefined) {
            stateMixEffect.transitionPosition = {
                handlePosition: content.me.transitionPosition,
                // Readonly properties
                inTransition: false,
                remainingFrames: 0,
            };
        }
        const objectTransition = content.me.transition;
        if (this._isAssignableToNextStyle(objectTransition)) {
            stateMixEffect.transitionProperties.nextStyle = objectTransition;
        }
        const objectKeyers = content.me.upstreamKeyers;
        if (objectKeyers) {
            for (const objKeyer of objectKeyers) {
                const fixedObjKeyer = {
                    ...objKeyer,
                    flyKeyframes: [undefined, undefined],
                    flyProperties: undefined,
                };
                delete fixedObjKeyer.flyProperties;
                delete fixedObjKeyer.flyKeyframes;
                if (objKeyer.flyProperties) {
                    fixedObjKeyer.flyProperties = {
                        isASet: false,
                        isBSet: false,
                        isAtKeyFrame: objKeyer.flyProperties.isAtKeyFrame,
                        runToInfiniteIndex: objKeyer.flyProperties.runToInfiniteIndex,
                    };
                }
                stateMixEffect.upstreamKeyers[objKeyer.upstreamKeyerId] = (0, lib_1.deepMerge)(atem_connection_1.AtemStateUtil.getUpstreamKeyer(stateMixEffect, objKeyer.upstreamKeyerId), fixedObjKeyer);
                const keyer = stateMixEffect.upstreamKeyers[objKeyer.upstreamKeyerId];
                if (objKeyer.flyKeyframes && keyer) {
                    keyer.flyKeyframes = [keyer.flyKeyframes[0] ?? undefined, keyer.flyKeyframes[1] ?? undefined];
                    if (objKeyer.flyKeyframes[0]) {
                        keyer.flyKeyframes[0] = (0, lib_1.literal)({
                            ...atem_state_1.Defaults.Video.flyKeyframe(0),
                            ...objKeyer.flyKeyframes[0],
                        });
                    }
                    if (objKeyer.flyKeyframes[1]) {
                        keyer.flyKeyframes[1] = (0, lib_1.literal)({
                            ...atem_state_1.Defaults.Video.flyKeyframe(1),
                            ...objKeyer.flyKeyframes[1],
                        });
                    }
                }
            }
        }
    }
    _applyDownStreamKeyer(mapping, content) {
        if (typeof mapping.index !== 'number' || mapping.index < 0)
            return;
        tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").video.downstreamKeyers[mapping.index] = (0, lib_1.deepMerge)(atem_connection_1.AtemStateUtil.getDownstreamKeyer(tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f"), mapping.index), content.dsk);
    }
    _applySuperSourceBox(mapping, content) {
        if (typeof mapping.index !== 'number' || mapping.index < 0)
            return;
        const stateSuperSource = atem_connection_1.AtemStateUtil.getSuperSource(tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f"), mapping.index);
        content.ssrc.boxes.forEach((objBox, i) => {
            stateSuperSource.boxes[i] = (0, lib_1.deepMerge)(stateSuperSource.boxes[i] ?? (0, lib_1.cloneDeep)(atem_state_1.Defaults.Video.SuperSourceBox), objBox);
        });
    }
    _applySuperSourceProperties(mapping, content) {
        const stateSuperSource = atem_connection_1.AtemStateUtil.getSuperSource(tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f"), mapping.index);
        const borderKeys = [
            'borderEnabled',
            'borderBevel',
            'borderOuterWidth',
            'borderInnerWidth',
            'borderOuterSoftness',
            'borderInnerSoftness',
            'borderBevelSoftness',
            'borderBevelPosition',
            'borderHue',
            'borderSaturation',
            'borderLuma',
            'borderLightSourceDirection',
            'borderLightSourceAltitude',
        ];
        stateSuperSource.properties = (0, lib_1.deepMerge)(stateSuperSource.properties ?? (0, lib_1.cloneDeep)(atem_state_1.Defaults.Video.SuperSourceProperties), _.omit(content.ssrcProps, ...borderKeys));
        stateSuperSource.border = (0, lib_1.deepMerge)(stateSuperSource.border ?? (0, lib_1.cloneDeep)(atem_state_1.Defaults.Video.SuperSourceBorder), _.pick(content.ssrcProps, ...borderKeys));
    }
    _applyAuxilliary(mapping, content) {
        if (typeof mapping.index !== 'number' || mapping.index < 0)
            return;
        tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").video.auxilliaries[mapping.index] = content.aux.input;
    }
    _applyMediaPlayer(mapping, content) {
        if (typeof mapping.index !== 'number' || mapping.index < 0)
            return;
        tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").media.players[mapping.index] = (0, lib_1.deepMerge)(atem_connection_1.AtemStateUtil.getMediaPlayer(tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f"), mapping.index), content.mediaPlayer);
    }
    _applyAudioChannel(mapping, content) {
        if (typeof mapping.index !== 'number' || mapping.index < 0)
            return;
        if (!tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").audio)
            tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").audio = { channels: {} };
        const stateAudioChannel = tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").audio.channels[mapping.index] ?? atem_state_1.Defaults.ClassicAudio.Channel;
        tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").audio.channels[mapping.index] = {
            ...(0, lib_1.cloneDeep)(stateAudioChannel),
            ...content.audioChannel,
        };
    }
    _applyAudioRouting(mapping, content) {
        if (typeof mapping.index !== 'number' || mapping.index < 0)
            return;
        // lazily generate the state properties, to make this be opt in per-mapping
        if (!tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").fairlight)
            tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").fairlight = { inputs: {} };
        if (!tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").fairlight.audioRouting)
            tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").fairlight.audioRouting = {
                sources: {},
                outputs: {},
            };
        tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").fairlight.audioRouting.outputs[mapping.index] = {
            // readonly props, they won't be diffed
            audioOutputId: mapping.index,
            audioChannelPair: 0,
            externalPortType: 0,
            internalPortType: 0,
            // mutable props
            name: `Output ${mapping.index}`,
            ...content.audioRouting,
        };
    }
    _applyMacroPlayer(_mapping, content) {
        tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").macro.macroPlayer = (0, lib_1.deepMerge)(tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").macro.macroPlayer, content.macroPlayer);
    }
    _applyColorGenerator(mapping, content) {
        if (!tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").colorGenerators)
            tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").colorGenerators = {};
        tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").colorGenerators[mapping.index] = {
            ...atem_state_1.Defaults.Color.ColorGenerator,
            ...tslib_1.__classPrivateFieldGet(this, _AtemStateBuilder_deviceState, "f").colorGenerators[mapping.index],
            ...content.colorGenerator,
        };
    }
}
exports.AtemStateBuilder = AtemStateBuilder;
_AtemStateBuilder_deviceState = new WeakMap();
//# sourceMappingURL=stateBuilder.js.map