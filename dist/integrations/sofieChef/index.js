"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SofieChefDevice = void 0;
const _ = require("underscore");
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const WebSocket = require("ws");
const api_1 = require("./api");
const lib_1 = require("../../lib");
const device_1 = require("../../service/device");
const diffStates_1 = require("./diffStates");
const stateBuilder_1 = require("./stateBuilder");
const COMMAND_TIMEOUT_TIME = 5000;
const RECONNECT_WAIT_TIME = 5000;
/**
 * This is a wrapper for a SofieChef-devices,
 * https://github.com/nrkno/sofie-chef
 */
class SofieChefDevice extends device_1.Device {
    constructor() {
        super(...arguments);
        this.actions = {
            [timeline_state_resolver_types_1.SofieChefActions.RestartAllWindows]: async () => this.restartAllWindows()
                .then(() => ({
                result: timeline_state_resolver_types_1.ActionExecutionResultCode.Ok,
            }))
                .catch(() => ({ result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error })),
            [timeline_state_resolver_types_1.SofieChefActions.RestartWindow]: async (_id, payload) => {
                if (!payload?.windowId) {
                    return { result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error, response: (0, lib_1.t)('Missing window id') };
                }
                return this.restartWindow(payload.windowId)
                    .then(() => ({
                    result: timeline_state_resolver_types_1.ActionExecutionResultCode.Ok,
                }))
                    .catch(() => ({ result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error }));
            },
        };
        this._connected = false;
        this._status = {
            app: {
                statusCode: api_1.StatusCode.ERROR,
                message: 'No status received yet',
            },
            windows: {},
        };
        this.msgId = 0;
        this.waitingForReplies = {};
    }
    /**
     * Initiates the connection with SofieChed through a websocket connection.
     */
    async init(initOptions) {
        // This is where we would do initialization, like connecting to the devices, etc
        this.initOptions = initOptions;
        await this._setupWSConnection();
        return true;
    }
    async _setupWSConnection() {
        return new Promise((resolve, reject) => {
            if (!this.initOptions) {
                reject(new Error(`this.initOptions not set, run init() first!`));
                return;
            }
            if (this._ws) {
                // Clean up previous connection:
                this._ws.removeAllListeners();
                delete this._ws;
            }
            this._ws = new WebSocket(this.initOptions.address);
            this._ws.on('error', (e) => {
                reject(new Error(`Error when connecting: ${e}`));
                this.context.logger.error('SofieChef', e);
            });
            this._ws.on('open', () => {
                this._updateConnected(true);
                resolve();
            });
            this._ws.on('close', () => {
                this._ws?.removeAllListeners();
                delete this._ws;
                this._updateConnected(false);
                this.tryReconnect();
            });
            this._ws.on('message', (data) => {
                this._handleReceivedMessage(data);
            });
            setTimeout(() => {
                reject(new Error(`Timeout when connecting`));
            }, COMMAND_TIMEOUT_TIME);
        });
    }
    tryReconnect() {
        if (this.reconnectTimeout)
            return;
        this.reconnectTimeout = setTimeout(() => {
            delete this.reconnectTimeout;
            this._setupWSConnection()
                .then(async () => {
                // is connected, yay!
                // Resync state:
                await this.resyncState();
            })
                .catch(() => {
                // Unable to reconnect, try again later:
                this.tryReconnect();
            });
        }, RECONNECT_WAIT_TIME);
    }
    async resyncState() {
        const response = await this._sendMessage({
            msgId: 0,
            type: api_1.ReceiveWSMessageType.LIST,
        });
        if (response.code === 200) {
            // Update state to reflec the actual state of Chef:
            const state = { windows: {} };
            for (const window of response.body) {
                state.windows[window.id] = {
                    url: window.url ?? '',
                    urlTimelineObjId: 'N/A',
                };
            }
            await this.context.resetToState(state);
        }
    }
    async terminate() {
        this._ws?.terminate();
        this._ws?.removeAllListeners();
    }
    get connected() {
        return this._connected;
    }
    convertTimelineStateToDeviceState(timelineState, mappings) {
        return (0, stateBuilder_1.buildSofieChefState)(timelineState, mappings);
    }
    /** Restart (reload) all windows */
    async restartAllWindows() {
        return this._sendMessage({
            msgId: 0,
            type: api_1.ReceiveWSMessageType.RESTART,
            windowId: '$all', // Magic token, restart all windows
        });
    }
    /** Restart (reload) a window */
    async restartWindow(windowId) {
        return this._sendMessage({
            msgId: 0,
            type: api_1.ReceiveWSMessageType.RESTART,
            windowId: windowId,
        });
    }
    getStatus() {
        let statusCode = timeline_state_resolver_types_1.StatusCode.GOOD;
        const messages = [];
        if (!this.connected) {
            statusCode = timeline_state_resolver_types_1.StatusCode.BAD;
            messages.push('Not connected');
        }
        else if (this._status.app.statusCode !== api_1.StatusCode.GOOD) {
            statusCode = this.convertStatusCode(this._status.app.statusCode);
            messages.push(this._status.app.message);
        }
        else {
            for (const [index, window] of Object.entries(this._status.windows)) {
                const windowStatusCode = this.convertStatusCode(window.statusCode);
                if (windowStatusCode > statusCode) {
                    statusCode = windowStatusCode;
                    messages.push(`Window ${index}: ${window.message}`);
                }
            }
        }
        return {
            statusCode: statusCode,
            messages: messages,
        };
    }
    convertStatusCode(s) {
        switch (s) {
            case api_1.StatusCode.GOOD:
                return timeline_state_resolver_types_1.StatusCode.GOOD;
            case api_1.StatusCode.WARNING:
                return timeline_state_resolver_types_1.StatusCode.WARNING_MAJOR;
            case api_1.StatusCode.ERROR:
                return timeline_state_resolver_types_1.StatusCode.BAD;
            default: {
                return timeline_state_resolver_types_1.StatusCode.BAD;
            }
        }
    }
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     */
    diffStates(oldSofieChefState, newSofieChefState, mappings) {
        return (0, diffStates_1.diffStates)(oldSofieChefState, newSofieChefState, mappings);
    }
    async sendCommand({ command, context, timelineObjId }) {
        // emit the command to debug:
        const cwc = {
            context,
            command,
            timelineObjId,
        };
        this.context.logger.debug(cwc);
        // execute the command here
        try {
            await this._sendMessage(command);
        }
        catch (e) {
            this.context.commandError(e, cwc);
        }
    }
    _updateConnected(connected) {
        if (this._connected !== connected) {
            this._connected = connected;
            this.context.connectionChanged(this.getStatus());
        }
    }
    _updateStatus(status) {
        if (!_.isEqual(this._status, status)) {
            this._status = status;
            this.context.connectionChanged(this.getStatus());
        }
    }
    _handleReceivedMessage(data) {
        try {
            const message = JSON.parse(data.toString());
            if (message) {
                if (message.type === api_1.SendWSMessageType.REPLY) {
                    const reply = this.waitingForReplies[message.replyTo];
                    if (reply) {
                        if (message.error) {
                            reply.reject(message.error);
                        }
                        else {
                            reply.resolve(message.result);
                        }
                    }
                }
                else if (message.type === api_1.SendWSMessageType.STATUS) {
                    this._updateStatus(message.status);
                }
                else {
                    // @ts-expect-error never
                    this.emit('error', 'SofieChef', new Error(`Unknown command ${message.type}`));
                }
            }
        }
        catch (err) {
            this.context.logger.error('SofieChef', err);
        }
    }
    async _sendMessage(msg) {
        return new Promise((resolve, reject) => {
            msg.msgId = this.msgId++;
            if (this.initOptions?.apiKey) {
                msg.apiKey = this.initOptions?.apiKey;
            }
            this.waitingForReplies[msg.msgId + ''] = {
                resolve,
                reject,
            };
            this._ws?.send(JSON.stringify(msg));
            setTimeout(() => {
                reject(new Error(`Command timed out`));
            }, COMMAND_TIMEOUT_TIME);
        });
    }
}
exports.SofieChefDevice = SofieChefDevice;
//# sourceMappingURL=index.js.map