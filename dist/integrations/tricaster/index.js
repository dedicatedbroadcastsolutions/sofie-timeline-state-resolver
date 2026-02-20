"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriCasterDevice = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const triCasterStateDiffer_1 = require("./triCasterStateDiffer");
const triCasterConnection_1 = require("./triCasterConnection");
const device_1 = require("../../service/device");
const DEFAULT_PORT = 5951;
class TriCasterDevice extends device_1.Device {
    constructor() {
        super(...arguments);
        this.actions = {};
        this._connected = false;
        this._initialized = false;
        this._isTerminating = false;
    }
    async init(options) {
        this._connection = new triCasterConnection_1.TriCasterConnection(options.host, options.port ?? DEFAULT_PORT);
        this._connection.on('connected', (info, shortcutStateXml) => {
            this._stateDiffer = new triCasterStateDiffer_1.TriCasterStateDiffer(info);
            this._setInitialState(shortcutStateXml);
            this._setConnected(true);
            this._initialized = true;
            this.context.logger.info(`Connected to TriCaster ${info.productModel}, session: ${info.sessionName}`);
        });
        this._connection.on('disconnected', (reason) => {
            if (!this._isTerminating) {
                this.context.logger.warning(`TriCaster disconected due to: ${reason}`);
            }
            this._setConnected(false);
        });
        this._connection.on('error', (reason) => {
            this.context.logger.error('TriCasterConnection', reason);
        });
        this._connection.connect();
        return true;
    }
    _setInitialState(shortcutStateXml) {
        if (!this._stateDiffer) {
            throw new Error('State Differ not available');
        }
        const state = this._stateDiffer.shortcutStateConverter.getTriCasterStateFromShortcutState(shortcutStateXml);
        this.context.resetToState(state).catch((e) => {
            this.context.logger.error('Error setting initial TriCaster state', e);
        });
    }
    _setConnected(connected) {
        if (this._connected !== connected) {
            this._connected = connected;
            this.context.connectionChanged(this.getStatus());
        }
    }
    /**
     * Convert a timeline state into an Tricaster state.
     * @param timelineState The state to be converted
     */
    convertTimelineStateToDeviceState(timelineState, mappings) {
        if (!this._initialized || !this._stateDiffer) {
            // before it's initialized don't do anything
            throw new Error('TriCaster not initialized yet');
        }
        const triCasterMappings = this.filterTriCasterMappings(mappings);
        return this._stateDiffer.timelineStateConverter.getTriCasterStateFromTimelineState(timelineState, triCasterMappings);
    }
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     * @param oldAtemState
     * @param newAtemState
     */
    diffStates(oldTriCasterState, newTriCasterState, _mappings) {
        if (!this._initialized || !this._stateDiffer) {
            // before it's initialized don't do anything
            this.context.logger.warning('TriCaster not initialized yet');
            return [];
        }
        return this._stateDiffer.getCommandsToAchieveState(newTriCasterState, oldTriCasterState);
    }
    filterTriCasterMappings(newMappings) {
        return Object.entries(newMappings).reduce((accumulator, [layerName, mapping]) => {
            if (mapping.device === timeline_state_resolver_types_1.DeviceType.TRICASTER) {
                accumulator[layerName] = mapping;
            }
            return accumulator;
        }, {});
    }
    async terminate() {
        this._isTerminating = true;
        this._connection?.close();
    }
    getStatus() {
        let statusCode = timeline_state_resolver_types_1.StatusCode.GOOD;
        const messages = [];
        if (!this._connected) {
            statusCode = timeline_state_resolver_types_1.StatusCode.BAD;
            messages.push('Not connected');
        }
        return {
            statusCode: statusCode,
            messages: messages,
        };
    }
    get connected() {
        return this._connected;
    }
    async sendCommand(commandWithContext) {
        this.context.logger.debug(commandWithContext);
        return this._connection?.send(commandWithContext.command);
    }
}
exports.TriCasterDevice = TriCasterDevice;
//# sourceMappingURL=index.js.map