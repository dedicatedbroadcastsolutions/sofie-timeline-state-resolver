"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffStates = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const _ = require("underscore");
const COMMAND_PRIORITY = {
    presetSpeed: 0,
    zoomSpeed: 1,
    zoom: 2,
    presetMem: 3,
};
function diffStates(oldPtzState, newPtzState) {
    const commands = [];
    const addCommands = (newNode, oldValue) => {
        if (newNode.preset &&
            getValue(newNode.preset) !== getValue(oldValue.preset) &&
            getValue(newNode.preset) !== undefined) {
            commands.push({
                command: {
                    type: timeline_state_resolver_types_1.TimelineContentTypePanasonicPtz.PRESET,
                    preset: getValue(newNode.preset),
                },
                context: `preset differ (${getValue(newNode.preset)}, ${getValue(oldValue.preset)})`,
                timelineObjId: newNode.preset.timelineObjId,
            });
        }
        if (newNode.speed &&
            getValue(newNode.speed) !== getValue(oldValue.speed) &&
            getValue(newNode.speed) !== undefined) {
            commands.push({
                command: {
                    type: timeline_state_resolver_types_1.TimelineContentTypePanasonicPtz.SPEED,
                    speed: getValue(newNode.speed),
                },
                context: `speed differ (${getValue(newNode.speed)}, ${getValue(oldValue.speed)})`,
                timelineObjId: newNode.speed.timelineObjId,
            });
        }
        if (newNode.zoomSpeed &&
            getValue(newNode.zoomSpeed) !== getValue(oldValue.zoomSpeed) &&
            getValue(newNode.zoomSpeed) !== undefined) {
            commands.push({
                command: {
                    type: timeline_state_resolver_types_1.TimelineContentTypePanasonicPtz.ZOOM_SPEED,
                    speed: getValue(newNode.zoomSpeed),
                },
                context: `zoom speed differ (${getValue(newNode.zoomSpeed)}, ${getValue(oldValue.zoomSpeed)})`,
                timelineObjId: newNode.zoomSpeed.timelineObjId,
            });
        }
        if (newNode.zoom && getValue(newNode.zoom) !== getValue(oldValue.zoom) && getValue(newNode.zoom) !== undefined) {
            commands.push({
                command: {
                    type: timeline_state_resolver_types_1.TimelineContentTypePanasonicPtz.ZOOM,
                    zoom: getValue(newNode.zoom),
                },
                context: `zoom differ (${getValue(newNode.zoom)}, ${getValue(oldValue.zoom)})`,
                timelineObjId: newNode.zoom.timelineObjId,
            });
        }
    };
    if (!_.isEqual(newPtzState, oldPtzState)) {
        addCommands(newPtzState, oldPtzState);
    }
    const sortedCommandsToAchieveState = commands.sort((a, b) => COMMAND_PRIORITY[a.command.type] - COMMAND_PRIORITY[b.command.type]);
    return sortedCommandsToAchieveState;
}
exports.diffStates = diffStates;
function getValue(a) {
    if (a)
        return a.value;
    return undefined;
}
//# sourceMappingURL=diff.js.map