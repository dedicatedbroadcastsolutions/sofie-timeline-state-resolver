"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTimelineStateToLawoState = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const emberplus_connection_1 = require("emberplus-connection");
function convertTimelineStateToLawoState(state, mappings) {
    const lawoState = {
        faders: [],
        nodes: [],
    };
    // const attrName = this._rampMotorFunctionPath || !this._dbPropertyName ? 'Fader.Motor dB Value' : this._dbPropertyName
    // iterate over mappings
    //   multiple sources
    //     push faders
    //   source
    //   fullpath
    //   triggerValue
    for (const layer of Object.values(state.layers)) {
        const mapping = mappings[layer.layer];
        if (!mapping || mapping.device !== timeline_state_resolver_types_1.DeviceType.LAWO)
            continue;
        if (layer.content.deviceType !== timeline_state_resolver_types_1.DeviceType.LAWO)
            continue;
        switch (layer.content.type) {
            case timeline_state_resolver_types_1.TimelineContentTypeLawo.SOURCES:
                // push faders
                pushFaders(lawoState, layer.id, layer.content, mappings);
                break;
            case timeline_state_resolver_types_1.TimelineContentTypeLawo.SOURCE:
                // push fader
                pushFader(lawoState, layer.id, layer.content, mapping);
                break;
            case timeline_state_resolver_types_1.TimelineContentTypeLawo.EMBER_PROPERTY:
                // push node / fullpath
                pushNode(lawoState, layer.id, layer.content, mapping);
                break;
            case timeline_state_resolver_types_1.TimelineContentTypeLawo.TRIGGER_VALUE:
                // set trigger value
                lawoState.triggerValue = layer.content.triggerValue;
                break;
        }
    }
    return lawoState;
}
exports.convertTimelineStateToLawoState = convertTimelineStateToLawoState;
function pushFaders(state, timelineObjId, layer, mappings) {
    for (const source of layer.sources) {
        const mapping = mappings[source.mappingName];
        if (mapping.device !== timeline_state_resolver_types_1.DeviceType.LAWO)
            continue;
        pushFader(state, timelineObjId, {
            deviceType: timeline_state_resolver_types_1.DeviceType.LAWO,
            type: timeline_state_resolver_types_1.TimelineContentTypeLawo.SOURCE,
            ...source,
            overridePriority: layer.overridePriority,
        }, mapping);
    }
}
function pushFader(state, timelineObjId, layer, mapping) {
    const fader = {
        identifier: mapping.options.identifier,
        value: layer.faderValue,
        transitionDuration: layer.transitionDuration,
        priority: layer.overridePriority ?? 0,
        timelineObjId,
    };
    const found = state.faders.findIndex((fader) => fader.identifier === mapping.options.identifier);
    if (found === -1) {
        // insert new
        state.faders.push(fader);
    }
    else if (state.faders[found].priority <= fader.priority) {
        // replace existing
        state.faders[found] = fader;
    }
}
function pushNode(state, timelineObjId, layer, mapping) {
    if (!mapping.options.identifier)
        return;
    const emberType = mapping.options.emberType &&
        Object.values(emberplus_connection_1.Model.ParameterType).includes(mapping.options.emberType)
        ? mapping.options.emberType
        : emberplus_connection_1.Model.ParameterType.Real;
    const node = {
        identifier: mapping.options.identifier,
        value: layer.value,
        valueType: emberType,
        priority: mapping.options.priority ?? 0,
        timelineObjId,
    };
    const found = state.nodes.findIndex((node) => node.identifier === mapping.options.identifier);
    if (found === -1) {
        // insert new
        state.nodes.push(node);
    }
    else if (state.nodes[found].priority <= node.priority) {
        // replace existing
        state.nodes[found] = node;
    }
}
//# sourceMappingURL=state.js.map