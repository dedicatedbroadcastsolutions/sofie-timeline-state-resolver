"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawoDevice = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const device_1 = require("../../service/device");
const debug_1 = require("debug");
const state_1 = require("./state");
const diff_1 = require("./diff");
const connection_1 = require("./connection");
const debug = (0, debug_1.default)('timeline-state-resolver:lawo');
class LawoDevice extends device_1.Device {
    constructor() {
        super(...arguments);
        this.actions = {};
    }
    async init(options) {
        this._lawo = new connection_1.LawoConnection(options, this.context.getCurrentTime);
        this._lawo.on('error', (e) => this.context.logger.error('Lawo.LawoConnection', e));
        this._lawo.on('debug', (...debug) => this.context.logger.debug('Lawo.LawoConnection', ...debug));
        this._lawo.on('debug', (...debug) => console.log('Lawo.LawoConnection', ...debug));
        this._lawo.on('connected', (firstConnection) => {
            if (firstConnection) {
                // reset state
                this.context
                    .resetToState({ faders: [], nodes: [] })
                    .catch((e) => this.context.logger.error('Lawo: Error when resetting state', e));
            }
            this.context.connectionChanged(this.getStatus());
        });
        this._lawo.on('disconnected', () => {
            this.context.connectionChanged(this.getStatus());
        });
        return Promise.resolve(true);
    }
    async terminate() {
        this._lawo?.terminate().catch((e) => this.context.logger.error('Error when terminating', e));
    }
    convertTimelineStateToDeviceState(timelineState, mappings) {
        return (0, state_1.convertTimelineStateToLawoState)(timelineState, mappings);
    }
    diffStates(oldState, newState) {
        return (0, diff_1.diffLawoStates)(oldState, newState);
    }
    async sendCommand(cwc) {
        const { command } = cwc;
        this.context.logger.debug(cwc);
        debug(command);
        try {
            const cmdType = command.type;
            if (command.type === diff_1.LawoCommandType.FaderRamp) {
                await this._lawo?.rampFader(command, cwc.timelineObjId);
            }
            else if (command.type === diff_1.LawoCommandType.SetValue) {
                await this._lawo?.setValue(command, cwc.timelineObjId);
            }
            else {
                throw new Error(`Unsupported command type "${cmdType}"`);
            }
        }
        catch (e) {
            const error = e;
            let errorString = error && error.message ? error.message : error.toString();
            if (error?.stack) {
                errorString += error.stack;
            }
            this.context.commandError(new Error(errorString), cwc);
        }
    }
    get connected() {
        return this._lawo?.connected ?? false;
    }
    getStatus() {
        let statusCode = timeline_state_resolver_types_1.StatusCode.GOOD;
        const messages = [];
        if (!this._lawo?.connected) {
            statusCode = timeline_state_resolver_types_1.StatusCode.BAD;
            messages.push('Not connected');
        }
        return {
            statusCode: statusCode,
            messages: messages,
        };
    }
}
exports.LawoDevice = LawoDevice;
//# sourceMappingURL=index.js.map