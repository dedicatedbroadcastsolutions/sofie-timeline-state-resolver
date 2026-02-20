"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractDevice = void 0;
const device_1 = require("./../../devices/device");
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const device_2 = require("../../service/device");
/*
    This is a wrapper for an "Abstract" device

    An abstract device is just a test-device that doesn't really do anything, but can be used
    as a preliminary mock
*/
class AbstractDevice extends device_2.Device {
    constructor() {
        super(...arguments);
        this.actions = {
            [timeline_state_resolver_types_1.AbstractActions.TestAction]: async () => {
                // noop
                return { result: timeline_state_resolver_types_1.ActionExecutionResultCode.Ok };
            },
        };
        this.connected = false;
    }
    /**
     * Initiates the connection with CasparCG through the ccg-connection lib.
     */
    async init(_initOptions) {
        // This is where we would do initialization, but not connecting to the device
        return true;
    }
    /**
     * Dispose of the device so it can be garbage collected.
     */
    async terminate() {
        // Noop
    }
    /**
     * converts the timeline state into something we can use
     * @param state
     */
    convertTimelineStateToDeviceState(state) {
        return state;
    }
    getStatus() {
        return {
            statusCode: device_1.StatusCode.GOOD,
            messages: [],
        };
    }
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     * @param oldAbstractState
     * @param newAbstractState
     */
    diffStates(oldAbstractState, newAbstractState) {
        // in this abstract class, let's just cheat:
        const commands = [];
        for (const [layerKey, newLayer] of Object.entries(newAbstractState.layers)) {
            const oldLayer = oldAbstractState?.layers[layerKey];
            if (!oldLayer) {
                // added!
                commands.push({
                    command: 'addedAbstract',
                    timelineObjId: newLayer.id,
                    context: `added: ${newLayer.id}`,
                });
            }
            else {
                // changed?
                if (oldLayer.id !== newLayer.id) {
                    // changed!
                    commands.push({
                        command: 'changedAbstract',
                        timelineObjId: newLayer.id,
                        context: `changed: ${newLayer.id}`,
                    });
                }
            }
        }
        // removed
        for (const [layerKey, oldLayer] of Object.entries(oldAbstractState?.layers || {})) {
            const newLayer = newAbstractState.layers[layerKey];
            if (!newLayer) {
                // removed!
                commands.push({
                    command: 'removedAbstract',
                    timelineObjId: oldLayer.id,
                    context: `removed: ${oldLayer.id}`,
                });
            }
        }
        return commands;
    }
    async sendCommand({ command, context, timelineObjId }) {
        // emit the command to debug:
        this.context.logger.debug({ command, context, timelineObjId });
        // Note: In the Abstract case, the execution does nothing
        return null;
    }
}
exports.AbstractDevice = AbstractDevice;
//# sourceMappingURL=index.js.map