"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingularLiveDevice = void 0;
const _ = require("underscore");
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const got_1 = require("got");
const lib_1 = require("../../lib");
const device_1 = require("../../service/device");
const SINGULAR_LIVE_API = 'https://app.singular.live/apiv2/controlapps/';
/**
 * This is a Singular.Live device, it talks to a Singular.Live App Instance using an Access Token
 */
class SingularLiveDevice extends device_1.Device {
    constructor() {
        super(...arguments);
        this.actions = {};
    }
    async init(initOptions) {
        this._accessToken = initOptions.accessToken || '';
        if (!this._accessToken)
            throw new Error('Singular.Live bad connection option: accessToken. An accessToken is required.');
        return true; // This device doesn't have any initialization procedure
    }
    // TODO
    async terminate() {
        // Nothing to do
    }
    getStatus() {
        // Good, since this device has no status, really
        return {
            statusCode: timeline_state_resolver_types_1.StatusCode.GOOD,
            messages: [],
        };
    }
    get connected() {
        // Doesn't support connection status
        return false;
    }
    _getDefaultState() {
        return {
            compositions: {},
        };
    }
    convertTimelineStateToDeviceState(state, newMappings) {
        // convert the timeline state into something we can use
        // (won't even use this.mapping)
        const singularState = this._getDefaultState();
        _.each(state.layers, (tlObject, layerName) => {
            const mapping = newMappings[layerName];
            if (mapping &&
                mapping.device === timeline_state_resolver_types_1.DeviceType.SINGULAR_LIVE &&
                tlObject.content.deviceType === timeline_state_resolver_types_1.DeviceType.SINGULAR_LIVE) {
                const content = tlObject.content;
                if (content.type === timeline_state_resolver_types_1.TimelineContentTypeSingularLive.COMPOSITION) {
                    singularState.compositions[mapping.options.compositionName] = {
                        timelineObjId: tlObject.id,
                        controlNode: content.controlNode,
                    };
                }
            }
        });
        return singularState;
    }
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     */
    diffStates(oldSingularLiveState, newSingularLiveState, _mappings, _time) {
        const commands = [];
        _.each(newSingularLiveState.compositions, (composition, compositionName) => {
            const oldComposition = oldSingularLiveState?.compositions?.[compositionName];
            if (!oldComposition) {
                // added!
                commands.push({
                    timelineObjId: composition.timelineObjId,
                    context: `added: ${composition.timelineObjId}`,
                    command: {
                        commandName: 'added',
                        content: (0, lib_1.literal)({
                            subCompositionName: compositionName,
                            state: composition.controlNode.state,
                            payload: composition.controlNode.payload,
                        }),
                        layer: compositionName,
                    },
                });
            }
            else {
                // changed?
                if (!_.isEqual(oldComposition.controlNode, composition.controlNode)) {
                    // changed!
                    commands.push({
                        timelineObjId: composition.timelineObjId,
                        context: `changed: ${composition.timelineObjId}  (previously: ${oldComposition.timelineObjId})`,
                        command: {
                            commandName: 'changed',
                            content: (0, lib_1.literal)({
                                subCompositionName: compositionName,
                                state: composition.controlNode.state,
                                payload: composition.controlNode.payload,
                            }),
                            layer: compositionName,
                        },
                    });
                }
            }
        });
        // removed
        if (oldSingularLiveState) {
            _.each(oldSingularLiveState.compositions, (composition, compositionName) => {
                const newComposition = newSingularLiveState.compositions[compositionName];
                if (!newComposition) {
                    // removed!
                    commands.push({
                        timelineObjId: composition.timelineObjId,
                        context: `removed: ${composition.timelineObjId}`,
                        command: {
                            commandName: 'removed',
                            content: (0, lib_1.literal)({
                                subCompositionName: compositionName,
                                state: 'Out',
                            }),
                            layer: compositionName,
                        },
                    });
                }
            });
        }
        return commands
            .sort((a, b) => a.command.content.state && !b.command.content.state
            ? 1
            : !a.command.content.state && b.command.content.state
                ? -1
                : 0)
            .sort((a, b) => a.command.layer.localeCompare(b.command.layer));
    }
    async sendCommand({ command, context, timelineObjId }) {
        const cwc = {
            context,
            command,
            timelineObjId,
        };
        this.context.logger.debug(cwc);
        const url = SINGULAR_LIVE_API + this._accessToken + '/control';
        try {
            await got_1.default
                .patch(url, { json: [command.content] })
                .then((response) => {
                if (response.statusCode === 200) {
                    this.context.logger.debug(`SingularLive: ${command.content.subCompositionName}: Good statuscode response on url "${url}": ${response.statusCode} (${context})`);
                }
                else {
                    this.context.logger.warning(`SingularLive: ${command.content.subCompositionName}: Bad statuscode response on url "${url}": ${response.statusCode} (${context})`);
                }
            })
                .catch((error) => {
                this.context.logger.error(`SingularLive.response error ${command.content.subCompositionName} (${context}`, error);
                throw error;
            });
        }
        catch (error) {
            this.context.commandError(error, cwc);
        }
    }
}
exports.SingularLiveDevice = SingularLiveDevice;
//# sourceMappingURL=index.js.map