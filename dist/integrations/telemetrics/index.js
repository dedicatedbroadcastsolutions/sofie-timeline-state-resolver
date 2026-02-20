"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetricsDevice = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const net_1 = require("net");
const device_1 = require("../../service/device");
const TELEMETRICS_COMMAND_PREFIX = 'P0C';
const DEFAULT_SOCKET_PORT = 5000;
const TIMEOUT_IN_MS = 2000;
/**
 * Connects to a Telemetrics Device on port 5000 using a TCP socket.
 * This class uses a fire and forget approach.
 */
class TelemetricsDevice extends device_1.Device {
    constructor() {
        super(...arguments);
        this.actions = {};
        this.statusCode = timeline_state_resolver_types_1.StatusCode.UNKNOWN;
    }
    get connected() {
        return this.statusCode === timeline_state_resolver_types_1.StatusCode.GOOD;
    }
    getStatus() {
        const messages = [];
        switch (this.statusCode) {
            case timeline_state_resolver_types_1.StatusCode.GOOD:
                this.errorMessage = '';
                messages.push('Connected');
                break;
            case timeline_state_resolver_types_1.StatusCode.BAD:
                messages.push('No connection');
                break;
            case timeline_state_resolver_types_1.StatusCode.UNKNOWN:
                this.errorMessage = '';
                messages.push('Not initialized');
                break;
        }
        if (this.errorMessage) {
            messages.push(this.errorMessage);
        }
        return {
            statusCode: this.statusCode,
            messages,
        };
    }
    diffStates(oldState, newState, _mappings, _time) {
        return newState.presetShotIdentifiers
            .filter((preset) => !oldState || !oldState.presetShotIdentifiers.includes(preset))
            .map((presetShotIdentifier) => {
            return {
                command: { presetShotIdentifier },
                context: '',
                timelineObjId: '',
            };
        });
    }
    convertTimelineStateToDeviceState(state, _newMappings) {
        const newTelemetricsState = { presetShotIdentifiers: [] };
        newTelemetricsState.presetShotIdentifiers = Object.entries(state.layers)
            .map(([_layerName, timelineObject]) => {
            const telemetricsContent = timelineObject.content;
            return telemetricsContent.presetShotIdentifiers;
        })
            .flat();
        return newTelemetricsState;
    }
    async sendCommand({ command, context, timelineObjId }) {
        const cwc = {
            context,
            command,
            timelineObjId,
        };
        this.context.logger.debug(cwc);
        // Skip attempting send if not connected
        if (!this.socket)
            return;
        const commandStr = `${TELEMETRICS_COMMAND_PREFIX}${command.presetShotIdentifier}\r`;
        this.socket.write(commandStr);
    }
    async init(options) {
        this.connectToDevice(options.host, options.port ?? DEFAULT_SOCKET_PORT);
        return true;
    }
    connectToDevice(host, port) {
        if (!this.socket || this.socket.destroyed) {
            this.setupSocket(host, port);
        }
        if (this.socket)
            this.socket.connect(port, host);
    }
    setupSocket(host, port) {
        this.socket = new net_1.Socket();
        this.socket.on('data', (data) => {
            this.context.logger.debug(`received data: ${data.toString()}`);
        });
        this.socket.on('error', (error) => {
            this.updateStatus(timeline_state_resolver_types_1.StatusCode.BAD, error);
        });
        this.socket.on('close', (hadError) => {
            if (hadError) {
                this.updateStatus(timeline_state_resolver_types_1.StatusCode.BAD);
                this.reconnect(host, port);
            }
            else {
                this.updateStatus(timeline_state_resolver_types_1.StatusCode.UNKNOWN);
            }
        });
        this.socket.on('connect', () => {
            this.context.logger.debug('Successfully connected to device');
            this.updateStatus(timeline_state_resolver_types_1.StatusCode.GOOD);
        });
    }
    updateStatus(statusCode, error) {
        this.statusCode = statusCode;
        if (error) {
            this.errorMessage = error.message;
        }
        this.context.connectionChanged(this.getStatus());
    }
    reconnect(host, port) {
        if (this.retryConnectionTimer) {
            return;
        }
        this.retryConnectionTimer = setTimeout(() => {
            this.context.logger.debug('Reconnecting...');
            clearTimeout(this.retryConnectionTimer);
            this.retryConnectionTimer = undefined;
            this.connectToDevice(host, port);
        }, TIMEOUT_IN_MS);
    }
    async terminate() {
        if (this.retryConnectionTimer) {
            clearTimeout(this.retryConnectionTimer);
            this.retryConnectionTimer = undefined;
        }
        this.socket?.destroy();
    }
}
exports.TelemetricsDevice = TelemetricsDevice;
//# sourceMappingURL=index.js.map