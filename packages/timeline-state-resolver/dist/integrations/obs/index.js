"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBSDevice = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const device_1 = require("../../service/device");
const state_1 = require("./state");
const diff_1 = require("./diff");
const connection_1 = require("./connection");
class OBSDevice extends device_1.Device {
    constructor() {
        super(...arguments);
        this._options = undefined;
        this._obs = undefined;
        this.actions = {};
    }
    async init(options) {
        this._options = options;
        this._obs = new connection_1.OBSConnection();
        this._obs.on(connection_1.OBSConnectionEvents.Connected, () => {
            this.context.logger.debug('OBS Connected');
            this.context.connectionChanged(this.getStatus());
            this.context.resetToState((0, state_1.getDefaultState)(this.context.getCurrentTime())).catch((e) => {
                this.context.logger.error('OBS: error while resetting state to default', e);
            });
        });
        this._obs.on(connection_1.OBSConnectionEvents.Disconnected, () => {
            this.context.logger.debug('OBS Disconnected');
            this.context.connectionChanged(this.getStatus());
        });
        this._obs.on(connection_1.OBSConnectionEvents.Error, (c, e) => this.context.logger.error('OBS: ' + c, e));
        this._obs.connect(this._options.host, this._options.port, this._options.password);
        return true;
    }
    async terminate() {
        this._obs?.disconnect();
    }
    get connected() {
        return this._obs?.connected ?? false;
    }
    getStatus() {
        if (this._obs?.connected) {
            return {
                statusCode: timeline_state_resolver_types_1.StatusCode.GOOD,
                messages: [],
            };
        }
        return {
            statusCode: timeline_state_resolver_types_1.StatusCode.BAD,
            messages: this._obs?.error ? ['Disconnected', this._obs.error] : ['Disconnected'],
        };
    }
    convertTimelineStateToDeviceState(state, newMappings) {
        return (0, state_1.convertStateToOBS)(state, newMappings);
    }
    diffStates(oldState, newState) {
        return (0, diff_1.diffStates)(oldState ?? (0, state_1.getDefaultState)(newState.time), newState, (scene, source) => this._obs?.getSceneItemId(scene, source));
    }
    async sendCommand(command) {
        if (!this._obs?.connected)
            return;
        this.context.logger.debug(command);
        this._obs?.call(command.command.requestName, command.command.args).catch((e) => {
            this.context.commandError(e, command);
        });
    }
}
exports.OBSDevice = OBSDevice;
//# sourceMappingURL=index.js.map