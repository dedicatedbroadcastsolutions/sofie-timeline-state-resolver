"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffStates = void 0;
const api_1 = require("./api");
function diffStates(oldSofieChefState, newSofieChefState, _mappings) {
    const commands = [];
    // Added / Changed things:
    for (const [windowId, window] of Object.entries(newSofieChefState.windows)) {
        const oldWindow = oldSofieChefState?.windows?.[windowId];
        if (!oldWindow) {
            // Added
            commands.push({
                context: 'added',
                timelineObjId: window.urlTimelineObjId,
                command: {
                    msgId: 0,
                    type: api_1.ReceiveWSMessageType.PLAYURL,
                    windowId: windowId,
                    url: window.url,
                },
            });
        }
        else {
            // item is not new, but maybe it has changed:
            if (oldWindow.url !== window.url) {
                commands.push({
                    context: 'changed',
                    timelineObjId: window.urlTimelineObjId,
                    command: {
                        msgId: 0,
                        type: api_1.ReceiveWSMessageType.PLAYURL,
                        windowId: windowId,
                        url: window.url,
                    },
                });
            }
        }
    }
    // Removed things
    if (oldSofieChefState) {
        for (const [windowId, oldWindow] of Object.entries(oldSofieChefState.windows)) {
            const newWindow = newSofieChefState.windows[windowId];
            if (!newWindow) {
                // Removed
                commands.push({
                    context: 'removed',
                    timelineObjId: oldWindow.urlTimelineObjId,
                    command: {
                        msgId: 0,
                        type: api_1.ReceiveWSMessageType.STOP,
                        windowId: windowId,
                    },
                });
            }
        }
    }
    return commands;
}
exports.diffStates = diffStates;
//# sourceMappingURL=diffStates.js.map