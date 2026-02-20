"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharosDevice = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const connection_1 = require("./connection");
const device_1 = require("../../service/device");
const diffStates_1 = require("./diffStates");
/**
 * This is a wrapper for a Pharos-devices,
 * https://www.pharoscontrols.com/downloads/documentation/application-notes/
 */
class PharosDevice extends device_1.Device {
    constructor(context) {
        super(context);
        this.actions = {};
        this._pharos = new connection_1.Pharos();
        this._pharos.on('error', (e) => this.context.logger.error('Pharos', e));
        this._pharos.on('connected', () => {
            this._connectionChanged();
        });
        this._pharos.on('disconnected', () => {
            this._connectionChanged();
        });
    }
    /**
     * Initiates the connection with Pharos through the PharosAPI.
     */
    async init(initOptions) {
        // This is where we would do initialization, like connecting to the devices, etc
        this._pharos
            .connect(initOptions)
            .then(() => {
            this._pharos
                .getProjectInfo()
                .then((info) => {
                this.context.logger.info(`Current project: ${info.name}`);
            })
                .catch((e) => this.context.logger.error('Failed to query project', e));
        })
            .catch((e) => this.context.logger.error('Failed to connect', e));
        return true;
    }
    async terminate() {
        await this._pharos.dispose();
    }
    get connected() {
        return this._pharos.connected;
    }
    convertTimelineStateToDeviceState(timelineState, _mappings) {
        return timelineState.layers;
    }
    getStatus() {
        let statusCode = timeline_state_resolver_types_1.StatusCode.GOOD;
        const messages = [];
        if (!this._pharos.connected) {
            statusCode = timeline_state_resolver_types_1.StatusCode.BAD;
            messages.push('Not connected');
        }
        return {
            statusCode: statusCode,
            messages: messages,
        };
    }
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     * @param oldAtemState
     * @param newAtemState
     */
    diffStates(oldPharosState, newPharosState, mappings) {
        return (0, diffStates_1.diffStates)(oldPharosState, newPharosState, mappings);
    }
    async sendCommand({ command, context, timelineObjId }) {
        const cwc = {
            context,
            command,
            timelineObjId,
        };
        this.context.logger.debug(cwc);
        // Skip attempting send if not connected
        if (!this.connected)
            return;
        try {
            await command.fcn(this._pharos);
        }
        catch (error) {
            this.context.commandError(error, cwc);
        }
    }
    _connectionChanged() {
        this.context.connectionChanged(this.getStatus());
    }
}
exports.PharosDevice = PharosDevice;
//# sourceMappingURL=index.js.map