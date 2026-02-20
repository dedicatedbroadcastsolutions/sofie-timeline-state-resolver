"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiffOptions = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
/**
  Returns an option object to be passed into AtemState.diffStates().
  Based on the mappings, these options enables/disables certain areas-of-interest in the diff atem state.
*/
function createDiffOptions(mappings) {
    const auxMappings = [];
    const audioOutputs = [];
    const colorGenerators = [];
    for (const mapping of Object.values(mappings)) {
        if (mapping.options.mappingType === timeline_state_resolver_types_1.MappingAtemType.Auxilliary) {
            auxMappings.push(mapping.options.index);
        }
        else if (mapping.options.mappingType === timeline_state_resolver_types_1.MappingAtemType.AudioChannel) {
            audioOutputs.push(mapping.options.index);
        }
        else if (mapping.options.mappingType === timeline_state_resolver_types_1.MappingAtemType.ColorGenerator) {
            colorGenerators.push(mapping.options.index);
        }
    }
    const audioOutputsObj = {
        default: undefined,
    };
    for (const audioOutput of audioOutputs) {
        audioOutputsObj[audioOutput] = {
            name: false,
            sourceId: true,
        };
    }
    // Manually construct the tree of what to diff, to match the previous version of atem-state.
    // Future: this should be computed from the mappings
    return {
        colorGenerators: colorGenerators,
        settings: {
            multiviewer: undefined,
        },
        macros: {
            player: { player: true },
        },
        media: {
            players: {
                source: true,
                status: true,
            },
        },
        video: {
            auxiliaries: auxMappings,
            downstreamKeyers: {
                sources: true,
                onAir: true,
                properties: true,
                mask: true,
            },
            mixEffects: {
                programPreview: true,
                transitionStatus: true,
                transitionProperties: true,
                transitionSettings: {
                    dip: false,
                    DVE: false,
                    mix: true,
                    stinger: false,
                    wipe: true,
                },
                upstreamKeyers: {
                    sources: true,
                    onAir: true,
                    type: true,
                    mask: true,
                    flyKeyframes: 'all',
                    flyProperties: true,
                    dveSettings: true,
                    chromaSettings: false,
                    advancedChromaSettings: false,
                    lumaSettings: true,
                    patternSettings: true,
                },
            },
            superSources: {
                boxes: 'all',
                border: true,
                properties: true,
            },
        },
        audio: {
            classic: undefined,
            fairlight: {
                inputs: undefined,
                masterOutput: undefined,
                monitorOutput: undefined,
                crossfade: undefined,
                audioRouting: {
                    sources: undefined,
                    outputs: audioOutputsObj,
                },
            },
        },
    };
}
exports.createDiffOptions = createDiffOptions;
//# sourceMappingURL=diffState.js.map