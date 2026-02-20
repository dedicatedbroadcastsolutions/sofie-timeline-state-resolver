"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPSendDevice = void 0;
const device_1 = require("../../service/device");
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const _ = require("underscore");
const got_1 = require("got");
const lib_1 = require("../../lib");
const hpagent_1 = require("hpagent");
const cacheable_lookup_1 = require("cacheable-lookup");
class HTTPSendDevice extends device_1.Device {
    constructor() {
        super(...arguments);
        /** Maps layers -> sent command-hashes */
        this.trackedState = new Map();
        this.cacheable = new cacheable_lookup_1.default();
        this._terminated = false;
        this.actions = {
            [timeline_state_resolver_types_1.HttpSendActions.Resync]: async (_id) => this.executeResyncAction(),
            [timeline_state_resolver_types_1.HttpSendActions.SendCommand]: async (_id, payload) => this.executeSendCommandAction(payload),
        };
    }
    async init(options) {
        this.options = options;
        return true;
    }
    async terminate() {
        this.trackedState.clear();
        this._terminated = true;
    }
    get connected() {
        return false;
    }
    getStatus() {
        return {
            statusCode: timeline_state_resolver_types_1.StatusCode.GOOD,
            messages: [],
        };
    }
    async executeResyncAction() {
        this.context.resetResolver();
        return { result: timeline_state_resolver_types_1.ActionExecutionResultCode.Ok };
    }
    async executeSendCommandAction(cmd) {
        if (!cmd)
            return {
                result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error,
                response: (0, lib_1.t)('Failed to send command: Missing payloadurl'),
            };
        if (!cmd.url) {
            return {
                result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error,
                response: (0, lib_1.t)('Failed to send command: Missing url'),
            };
        }
        if (!Object.values(timeline_state_resolver_types_1.TimelineContentTypeHTTP).includes(cmd.type)) {
            return {
                result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error,
                response: (0, lib_1.t)('Failed to send command: type is invalid'),
            };
        }
        if (!cmd.params) {
            return {
                result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error,
                response: (0, lib_1.t)('Failed to send command: Missing params'),
            };
        }
        if (cmd.paramsType && !(cmd.type in timeline_state_resolver_types_1.TimelineContentTypeHTTPParamType)) {
            return {
                result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error,
                response: (0, lib_1.t)('Failed to send command: params type is invalid'),
            };
        }
        const response = await this.sendCommandWithResult({
            timelineObjId: '',
            context: 'makeReady',
            command: {
                commandName: 'manual',
                content: cmd,
                layer: '',
            },
        }).catch(() => this.context.logger.warning('Manual command failed: ' + JSON.stringify(cmd)));
        return (response ?? {
            result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error,
        });
    }
    convertTimelineStateToDeviceState(state) {
        return state;
    }
    diffStates(oldState, newState) {
        const commands = [];
        _.each(newState.layers, (newLayer, layerKey) => {
            const oldLayer = oldState?.layers[layerKey];
            if (!oldLayer) {
                // added!
                commands.push({
                    timelineObjId: newLayer.id,
                    context: `added: ${newLayer.id}`,
                    command: {
                        commandName: 'added',
                        content: newLayer.content,
                        layer: layerKey,
                    },
                    queueId: newLayer.content?.queueId,
                });
            }
            else {
                // changed?
                if (!_.isEqual(oldLayer.content, newLayer.content)) {
                    // changed!
                    commands.push({
                        timelineObjId: newLayer.id,
                        context: `changed: ${newLayer.id} (previously: ${oldLayer.id})`,
                        command: {
                            commandName: 'changed',
                            content: newLayer.content,
                            layer: layerKey,
                        },
                        queueId: newLayer.content?.queueId,
                    });
                }
            }
        });
        // removed
        _.each(oldState?.layers ?? {}, (oldLayer, layerKey) => {
            const newLayer = newState.layers[layerKey];
            if (!newLayer) {
                // removed!
                commands.push({
                    timelineObjId: oldLayer.id,
                    context: `removed: ${oldLayer.id}`,
                    command: { commandName: 'removed', content: oldLayer.content, layer: layerKey },
                    queueId: oldLayer.content?.queueId,
                });
            }
        });
        commands.sort((a, b) => a.command.layer.localeCompare(b.command.layer));
        commands.sort((a, b) => {
            return (a.command.content.temporalPriority || 0) - (b.command.content.temporalPriority || 0);
        });
        return commands;
    }
    async sendCommand({ timelineObjId, context, command }) {
        await this.sendCommandWithResult({ timelineObjId, context, command });
    }
    async sendCommandWithResult({ timelineObjId, context, command, }) {
        const commandHash = this.getTrackedStateHash(command);
        if (command.commandName === 'added' || command.commandName === 'changed') {
            this.trackedState.set(command.layer, commandHash);
        }
        else if (command.commandName === 'removed') {
            this.trackedState.delete(command.layer);
        }
        // Avoid sending multiple identical commands for the same state:
        if (command.layer && command.commandName !== 'manual') {
            const trackedHash = this.trackedState.get(command.layer);
            if (commandHash !== trackedHash)
                return {
                    result: timeline_state_resolver_types_1.ActionExecutionResultCode.IgnoredNotRelevant,
                }; // command is no longer relevant to state
        }
        if (this._terminated) {
            return {
                result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error,
            };
        }
        const cwc = {
            context,
            command,
            timelineObjId,
        };
        this.context.logger.debug({ context, timelineObjId, command });
        const t = Date.now();
        const httpReq = got_1.default[command.content.type];
        try {
            const options = {
                dnsCache: this.cacheable,
                retry: 0,
                headers: command.content.headers,
            };
            const url = new URL(command.content.url);
            if (!this.options.noProxy?.includes(url.host)) {
                if (url.protocol === 'http:' && this.options.httpProxy) {
                    options.agent = {
                        http: new hpagent_1.HttpProxyAgent({
                            proxy: this.options.httpProxy,
                        }),
                    };
                }
                else if (url.protocol === 'https:' && this.options.httpsProxy) {
                    options.agent = {
                        https: new hpagent_1.HttpsProxyAgent({
                            proxy: this.options.httpsProxy,
                        }),
                    };
                }
            }
            const params = 'params' in command.content && !_.isEmpty(command.content.params) ? command.content.params : undefined;
            if (params) {
                if (command.content.type === timeline_state_resolver_types_1.TimelineContentTypeHTTP.GET) {
                    options.searchParams = params;
                }
                else {
                    if (command.content.paramsType === timeline_state_resolver_types_1.TimelineContentTypeHTTPParamType.FORM) {
                        options.form = params;
                    }
                    else {
                        // Default is json:
                        options.json = params;
                    }
                }
            }
            const response = await httpReq(command.content.url, options);
            if (response.statusCode >= 200 && response.statusCode < 300) {
                this.context.logger.debug(`HTTPSend: ${command.content.type}: Good statuscode response on url "${command.content.url}": ${response.statusCode} (${context})`);
            }
            else {
                this.context.logger.warning(`HTTPSend: ${command.content.type}: Bad statuscode response on url "${command.content.url}": ${response.statusCode} (${context})`);
            }
            return {
                result: timeline_state_resolver_types_1.ActionExecutionResultCode.Ok,
                resultData: {
                    body: response.body,
                    statusCode: response.statusCode,
                    headers: response.headers,
                },
            };
        }
        catch (error) {
            const err = error; // make typescript happy
            this.context.logger.error(`HTTPSend.response error on ${command.content.type} "${command.content.url}" (${context})`, err);
            this.context.commandError(err, cwc);
            if ('code' in err) {
                const retryCodes = [
                    'ETIMEDOUT',
                    'ECONNRESET',
                    'EADDRINUSE',
                    'ECONNREFUSED',
                    'EPIPE',
                    'ENOTFOUND',
                    'ENETUNREACH',
                    'EHOSTUNREACH',
                    'EAI_AGAIN',
                ];
                if (retryCodes.includes(err.code) && this.options?.resendTime && command.commandName !== 'manual') {
                    const timeLeft = Math.max(this.options.resendTime - (Date.now() - t), 0);
                    setTimeout(() => {
                        this.sendCommand({
                            timelineObjId,
                            context,
                            command: {
                                ...command,
                                commandName: 'retry',
                            },
                        }).catch(() => null); // errors will be emitted
                    }, timeLeft);
                }
            }
            return {
                result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error,
            };
        }
    }
    getTrackedStateHash(command) {
        return JSON.stringify(command.content);
    }
}
exports.HTTPSendDevice = HTTPSendDevice;
//# sourceMappingURL=index.js.map