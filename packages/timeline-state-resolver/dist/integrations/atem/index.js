"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtemDevice = void 0;
const _ = require("underscore");
const device_1 = require("./../../devices/device");
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const atem_state_1 = require("atem-state");
const atem_connection_1 = require("atem-connection");
const device_2 = require("../../service/device");
const stateBuilder_1 = require("./stateBuilder");
const diffState_1 = require("./diffState");
/**
 * This is a wrapper for the Atem Device. Commands to any and all atem devices will be sent through here.
 */
class AtemDevice extends device_2.Device {
    constructor() {
        super(...arguments);
        this.actions = {
            [timeline_state_resolver_types_1.AtemActions.Resync]: this.resyncState.bind(this),
        };
        this._atem = new atem_connection_1.BasicAtem();
        this._protocolVersion = atem_connection_1.Enums.ProtocolVersion.V8_1_1;
        this._connected = false; // note: ideally this should be replaced by this._atem.connected
        this._atemStatus = {
            psus: [],
        };
    }
    /**
     * Initiates the connection with the ATEM through the atem-connection lib
     * and initiates Atem State lib.
     */
    async init(options) {
        this._atem.on('disconnected', () => {
            this._connected = false;
            this._connectionChanged();
        });
        this._atem.on('error', (e) => this.context.logger.error('Atem', new Error(e)));
        this._atem.on('stateChanged', (state) => this._onAtemStateChanged(state));
        this._atem.on('connected', () => {
            this._connected = true;
            this._connectionChanged();
            if (this._atem.state) {
                // Do a state diff to get to the desired state
                this._protocolVersion = this._atem.state.info.apiVersion;
                this.context
                    .resetToState(this._atem.state)
                    .catch((e) => this.context.logger.error('Error resetting atem state', new Error(e)));
            }
            else {
                // Do a state diff to at least send all the commands we know about
                this.context.resetState().catch((e) => this.context.logger.error('Error resetting atem state', new Error(e)));
            }
        });
        // This only waits for the child thread to start, it doesn't wait for connection
        await this._atem.connect(options.host, options.port);
        return true;
    }
    /**
     * Safely terminate everything to do with this device such that it can be
     * garbage collected.
     */
    async terminate() {
        await this._atem.disconnect().catch(() => null);
        await this._atem.destroy().catch(() => null);
        this._atem.removeAllListeners();
    }
    async resyncState() {
        this.context.resetResolver();
        return {
            result: timeline_state_resolver_types_1.ActionExecutionResultCode.Ok,
        };
    }
    get connected() {
        return this._connected;
    }
    /**
     * Convert a timeline state into an Atem state.
     * @param timelineState The state to be converted
     */
    convertTimelineStateToDeviceState(timelineState, mappings) {
        return stateBuilder_1.AtemStateBuilder.fromTimeline(timelineState.layers, mappings);
    }
    /**
     * Check status and return it with useful messages appended.
     */
    getStatus() {
        if (!this._connected) {
            return {
                statusCode: device_1.StatusCode.BAD,
                messages: [`Atem disconnected`],
            };
        }
        else {
            let statusCode = device_1.StatusCode.GOOD;
            const messages = [];
            const psus = this._atemStatus.psus;
            psus.forEach((psu, i) => {
                if (!psu) {
                    statusCode = device_1.StatusCode.WARNING_MAJOR;
                    messages.push(`Atem PSU ${i + 1} is faulty. The device has ${psus.length} PSU(s) in total.`);
                }
            });
            return {
                statusCode: statusCode,
                messages: messages,
            };
        }
    }
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     * @param oldAtemState
     * @param newAtemState
     */
    diffStates(oldAtemState, newAtemState, mappings) {
        // Skip diffing if not connected, a resolverReset will be fired upon reconnection
        if (!this._connected)
            return [];
        // Make sure there is something to diff against
        oldAtemState = oldAtemState ?? this._atem.state ?? atem_connection_1.AtemStateUtil.Create();
        const diffOptions = (0, diffState_1.createDiffOptions)(mappings);
        const commands = atem_state_1.AtemState.diffStates(this._protocolVersion, oldAtemState, newAtemState, diffOptions);
        if (commands.length > 0) {
            return [
                {
                    command: commands,
                    context: '',
                    timelineObjId: '',
                },
            ];
        }
        else {
            return [];
        }
    }
    async sendCommand({ command, context, timelineObjId }) {
        const cwc = {
            context,
            command,
            timelineObjId,
        };
        this.context.logger.debug(cwc);
        // Skip attempting send if not connected
        if (!this._connected)
            return;
        try {
            await this._atem.sendCommands(command);
        }
        catch (error) {
            this.context.commandError(error, cwc);
        }
    }
    _onAtemStateChanged(newState) {
        const psus = newState.info.power || [];
        if (!_.isEqual(this._atemStatus.psus, psus)) {
            this._atemStatus.psus = psus.slice();
            this._connectionChanged();
        }
    }
    _connectionChanged() {
        this.context.connectionChanged(this.getStatus());
    }
}
exports.AtemDevice = AtemDevice;
//# sourceMappingURL=index.js.map