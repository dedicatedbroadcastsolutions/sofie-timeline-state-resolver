"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffLawoStates = exports.LawoCommandType = void 0;
const lib_1 = require("../../lib");
var LawoCommandType;
(function (LawoCommandType) {
    LawoCommandType["FaderRamp"] = "FaderRamp";
    LawoCommandType["SetValue"] = "SetValue";
})(LawoCommandType = exports.LawoCommandType || (exports.LawoCommandType = {}));
function diffLawoStates(oldState, newState) {
    const commands = [];
    // changed triggerValue => reset all faders and nodes
    const changedTriggerValue = oldState?.triggerValue !== newState.triggerValue;
    // build an index of old faders and nodes
    const oldFaders = new Map(oldState?.faders.map((f) => [f.identifier, f]) ?? []);
    const oldNodes = new Map(oldState?.nodes.map((f) => [f.identifier, f]) ?? []);
    // diff faders
    for (const newFader of newState.faders) {
        const oldFader = oldFaders.get(newFader.identifier);
        if (changedTriggerValue || oldFader?.value !== newFader.value) {
            commands.push({
                command: (0, lib_1.literal)({
                    type: LawoCommandType.FaderRamp,
                    identifier: newFader.identifier,
                    value: newFader.value,
                    transitionDuration: newFader.transitionDuration,
                    from: oldFader?.value,
                    priority: newFader.priority,
                }),
                context: `Values: "${oldFader?.value}" !== "${newFader.value}", Changed TriggerValue: ${changedTriggerValue}`,
                timelineObjId: newFader.timelineObjId,
            });
        }
    }
    // diff nodes
    for (const newNode of newState.nodes) {
        const oldNode = oldNodes.get(newNode.identifier);
        if (changedTriggerValue || oldNode?.value !== newNode.value) {
            commands.push({
                command: (0, lib_1.literal)({
                    type: LawoCommandType.SetValue,
                    identifier: newNode.identifier,
                    value: newNode.value,
                    valueType: newNode.valueType,
                    priority: newNode.priority,
                }),
                context: `Values: "${oldNode?.value}" !== "${newNode.value}", Changed TriggerValue: ${changedTriggerValue}`,
                timelineObjId: newNode.timelineObjId,
            });
        }
    }
    // sort by priority
    commands.sort((a, b) => {
        if (a.command.priority < b.command.priority)
            return 1;
        if (a.command.priority > b.command.priority)
            return -1;
        if (a.command.identifier > b.command.identifier)
            return 1;
        if (a.command.identifier < b.command.identifier)
            return -1;
        return 0;
    });
    return commands;
}
exports.diffLawoStates = diffLawoStates;
//# sourceMappingURL=diff.js.map