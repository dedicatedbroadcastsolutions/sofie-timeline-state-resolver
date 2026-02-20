"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpSendDevice = void 0;
const device_1 = require("../../service/device");
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const lib_1 = require("../../lib");
const _ = require("underscore");
const tcpConnection_1 = require("./tcpConnection");
class TcpSendDevice extends device_1.Device {
    constructor() {
        super(...arguments);
        this.activeLayers = new Map();
        this._terminated = false;
        this.tcpConnection = new tcpConnection_1.TcpConnection();
        this.actions = {
            [timeline_state_resolver_types_1.TcpSendActions.Reconnect]: async () => {
                await this.tcpConnection.reconnect();
                return { result: timeline_state_resolver_types_1.ActionExecutionResultCode.Ok };
            },
            [timeline_state_resolver_types_1.TcpSendActions.ResetState]: async () => {
                await this.actionResetState();
                return { result: timeline_state_resolver_types_1.ActionExecutionResultCode.Ok };
            },
            [timeline_state_resolver_types_1.TcpSendActions.SendTcpCommand]: async (_id, payload) => {
                return this.actionSendTcpCommand(payload);
            },
        };
    }
    async init(options) {
        this.tcpConnection.activate(options);
        return true;
    }
    async terminate() {
        this._terminated = true;
        this.activeLayers.clear();
        await this.tcpConnection.deactivate();
    }
    get connected() {
        return this.tcpConnection.connected;
    }
    getStatus() {
        return {
            statusCode: timeline_state_resolver_types_1.StatusCode.GOOD,
            messages: [],
        };
    }
    convertTimelineStateToDeviceState(state) {
        return state;
    }
    diffStates(oldState, newState) {
        const commands = [];
        for (const [layerKey, newLayer] of Object.entries(newState.layers)) {
            const oldLayer = oldState?.layers[layerKey];
            // added/changed
            if (newLayer.content) {
                if (!oldLayer) {
                    // added!
                    commands.push({
                        command: {
                            commandName: 'added',
                            content: newLayer.content,
                            layer: layerKey,
                        },
                        context: `added: ${newLayer.id}`,
                        timelineObjId: newLayer.id,
                    });
                }
                else {
                    // changed?
                    if (!_.isEqual(oldLayer.content, newLayer.content)) {
                        // changed!
                        commands.push({
                            command: {
                                commandName: 'changed',
                                content: newLayer.content,
                                layer: layerKey,
                            },
                            context: `changed: ${newLayer.id}`,
                            timelineObjId: newLayer.id,
                        });
                    }
                }
            }
        }
        // removed
        for (const [layerKey, oldLayer] of Object.entries(oldState?.layers ?? {})) {
            const newLayer = newState.layers[layerKey];
            if (!newLayer) {
                // removed!
                commands.push({
                    command: {
                        commandName: 'removed',
                        content: oldLayer.content,
                        layer: layerKey,
                    },
                    context: `removed: ${oldLayer.id}`,
                    timelineObjId: oldLayer.id,
                });
            }
        }
        commands.sort((a, b) => a.command.layer.localeCompare(b.command.layer));
        commands.sort((a, b) => {
            return (a.command.content.temporalPriority || 0) - (b.command.content.temporalPriority || 0);
        });
        return commands;
    }
    async sendCommand({ timelineObjId, context, command }) {
        if (command.commandName === 'added' || command.commandName === 'changed') {
            this.activeLayers.set(command.layer, this.getActiveLayersHash(command));
        }
        else if (command.commandName === 'removed') {
            this.activeLayers.delete(command.layer);
        }
        if (command.layer && command.commandName !== 'manual') {
            const hash = this.activeLayers.get(command.layer);
            if (this.getActiveLayersHash(command) !== hash)
                return Promise.resolve(); // command is no longer relevant to state
        }
        if (this._terminated) {
            return Promise.resolve();
        }
        this.context.logger.debug({ context, timelineObjId, command });
        await this.tcpConnection.sendTCPMessage(command.content.message);
    }
    async actionSendTcpCommand(cmd) {
        if (!cmd)
            return {
                result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error,
                response: (0, lib_1.t)('Failed to send command: Missing payload'),
            };
        if (!cmd.message) {
            return {
                result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error,
                response: (0, lib_1.t)('Failed to send command: Missing message'),
            };
        }
        try {
            await this.sendCommand({
                timelineObjId: '',
                context: 'makeReady',
                command: {
                    commandName: 'manual',
                    content: cmd,
                    layer: '',
                },
            });
        }
        catch (error) {
            this.context.logger.warning('Manual TCP command failed: ' + JSON.stringify(cmd));
            return {
                result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error,
                response: (0, lib_1.t)('Error when sending TCP command: {{errorMessage}}', { errorMessage: `${error}` }),
            };
        }
        return { result: timeline_state_resolver_types_1.ActionExecutionResultCode.Ok };
    }
    async actionResetState() {
        this.activeLayers.clear();
        await this.context.resetState();
    }
    getActiveLayersHash(command) {
        return JSON.stringify(command.content);
    }
}
exports.TcpSendDevice = TcpSendDevice;
//# sourceMappingURL=index.js.map