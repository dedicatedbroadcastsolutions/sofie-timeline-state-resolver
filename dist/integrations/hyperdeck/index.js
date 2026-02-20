"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HyperdeckDevice = void 0;
const device_1 = require("../../devices/device");
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const hyperdeck_connection_1 = require("hyperdeck-connection");
const lib_1 = require("../../lib");
const diffState_1 = require("./diffState");
const stateBuilder_1 = require("./stateBuilder");
const device_2 = require("../../service/device");
/**
 * This is a wrapper for the Hyperdeck Device. Commands to any and all hyperdeck devices will be sent through here.
 */
class HyperdeckDevice extends device_2.Device {
    constructor() {
        super(...arguments);
        this.actions = {
            [timeline_state_resolver_types_1.HyperdeckActions.FormatDisks]: this.formatDisks.bind(this),
            [timeline_state_resolver_types_1.HyperdeckActions.Resync]: this.resyncState.bind(this),
        };
        this._hyperdeck = new hyperdeck_connection_1.Hyperdeck({ pingPeriod: 1000 });
        this._connected = false;
        this._recordingTime = 0;
        this._minRecordingTime = 0; // 15 minutes
        this._slotCount = 0;
        this._slotStatus = {};
        this._suppressEmptySlotWarnings = false;
    }
    /**
     * Initiates the connection with the Hyperdeck through the hyperdeck-connection lib.
     */
    async init(initOptions) {
        let firstConnect = true;
        this._hyperdeck.connect(initOptions.host, initOptions.port);
        this._hyperdeck.on('connected', () => {
            (0, lib_1.deferAsync)(async () => {
                await this._hyperdeck.sendCommand(new hyperdeck_connection_1.Commands.RemoteCommand(true));
                this._queryCurrentState()
                    .then(async (state) => {
                    if (firstConnect) {
                        firstConnect = false;
                        this._slotCount = await this._querySlotNumber();
                    }
                    this._connected = true;
                    this._connectionChanged();
                    this.context
                        .resetToState(state)
                        .catch((e) => this.context.logger.error('Error resetting hyperdeck state', new Error(e)));
                })
                    .catch((e) => this.context.logger.error('Hyperdeck.on("connected")', e));
                if (initOptions.minRecordingTime) {
                    this._minRecordingTime = initOptions.minRecordingTime;
                    if (this._recTimePollTimer)
                        clearTimeout(this._recTimePollTimer);
                }
                this._queryRecordingTime().catch((e) => this.context.logger.error('HyperDeck.queryRecordingTime', e));
                this._suppressEmptySlotWarnings = !!initOptions.suppressEmptySlotWarnings;
                const notifyCmd = new hyperdeck_connection_1.Commands.NotifySetCommand();
                notifyCmd.slot = true;
                notifyCmd.transport = true;
                this._hyperdeck.sendCommand(notifyCmd).catch((e) => this.context.logger.error('HyperDeck.on("connected")', e));
                const tsCmd = new hyperdeck_connection_1.Commands.TransportInfoCommand();
                this._hyperdeck
                    .sendCommand(tsCmd)
                    .then((r) => (this._transportStatus = r.status))
                    .catch((e) => this.context.logger.error('HyperDeck.on("connected")', e));
            }, (e) => {
                this.context.logger.error('Failed to send command', e);
            });
        });
        this._hyperdeck.on('disconnected', () => {
            this._connected = false;
            this._connectionChanged();
        });
        this._hyperdeck.on('error', (e) => this.context.logger.error('Hyperdeck', new Error(e)));
        this._hyperdeck.on('notify.slot', (res) => {
            (0, lib_1.deferAsync)(async () => {
                await this._queryRecordingTime().catch((e) => this.context.logger.error('HyperDeck.queryRecordingTime', e));
                if (res.status)
                    this._connectionChanged();
            }, (e) => {
                this.context.logger.error('Failed to send command', e);
            });
        });
        this._hyperdeck.on('notify.transport', (res) => {
            if (res.status) {
                this._transportStatus = res.status;
                if (this._expectedTransportStatus !== res.status) {
                    this._connectionChanged();
                }
            }
        });
        return true;
    }
    /**
     * Makes this device ready for garbage collection.
     */
    async terminate() {
        if (this._recTimePollTimer)
            clearTimeout(this._recTimePollTimer);
        await this._hyperdeck.disconnect().catch(() => null);
        this._hyperdeck.removeAllListeners();
    }
    async resyncState() {
        try {
            // TODO - could this being slow/offline be a problem?
            const state = await this._queryCurrentState();
            await this.context.resetToState(state);
        }
        catch (e) {
            this.context.resetResolver();
        }
        return {
            result: timeline_state_resolver_types_1.ActionExecutionResultCode.Ok,
        };
    }
    /**
     * Sends commands to the HyperDeck to format disks. Afterwards,
     * calls this._queryRecordingTime
     */
    async formatDisks() {
        try {
            const wait = async (t) => new Promise((resolve) => setTimeout(() => resolve(), t));
            for (let i = 1; i <= this._slotCount; i++) {
                // select slot
                const slotSel = new hyperdeck_connection_1.Commands.SlotSelectCommand();
                slotSel.slotId = i;
                try {
                    await this._hyperdeck.sendCommand(slotSel);
                }
                catch (e) {
                    continue;
                }
                // get code:
                const prepare = new hyperdeck_connection_1.Commands.FormatCommand();
                prepare.filesystem = hyperdeck_connection_1.FilesystemFormat.exFAT;
                const res = await this._hyperdeck.sendCommand(prepare);
                const format = new hyperdeck_connection_1.Commands.FormatConfirmCommand();
                format.code = res.code;
                await this._hyperdeck.sendCommand(format);
                // now actualy await until finished:
                const slotInfo = new hyperdeck_connection_1.Commands.SlotInfoCommand(i);
                while ((await this._hyperdeck.sendCommand(slotInfo)).status === hyperdeck_connection_1.SlotStatus.EMPTY) {
                    await wait(500);
                }
            }
            await this._queryRecordingTime();
            return { result: timeline_state_resolver_types_1.ActionExecutionResultCode.Ok };
        }
        catch {
            return { result: timeline_state_resolver_types_1.ActionExecutionResultCode.Error };
        }
    }
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     * @param oldHyperdeckState The assumed current state
     * @param newHyperdeckState The desired state of the device
     */
    diffStates(oldHyperdeckState, newHyperdeckState) {
        return (0, diffState_1.diffHyperdeckStates)(oldHyperdeckState, newHyperdeckState, (err) => {
            this.context.logger.error('Hyperdeck diffStates', err);
        });
    }
    async sendCommand({ command, context, timelineObjId }) {
        const cwc = {
            context,
            command,
            timelineObjId,
        };
        this.context.logger.debug(cwc);
        // TODO: is this a good idea?
        // Track what we expect the TransportStatus to be, only Commands we may send need to be considered
        if (command instanceof hyperdeck_connection_1.Commands.PlayCommand) {
            this._expectedTransportStatus = hyperdeck_connection_1.TransportStatus.PLAY;
        }
        else if (command instanceof hyperdeck_connection_1.Commands.StopCommand) {
            this._expectedTransportStatus = hyperdeck_connection_1.TransportStatus.STOPPED;
        }
        else if (command instanceof hyperdeck_connection_1.Commands.RecordCommand) {
            this._expectedTransportStatus = hyperdeck_connection_1.TransportStatus.RECORD;
        }
        else if (command instanceof hyperdeck_connection_1.Commands.PreviewCommand) {
            this._expectedTransportStatus = hyperdeck_connection_1.TransportStatus.PREVIEW;
        }
        // Skip attempting send if not connected
        if (!this._connected)
            return;
        try {
            await this._hyperdeck.sendCommand(command);
        }
        catch (error) {
            this.context.commandError(error, cwc);
        }
    }
    get connected() {
        return this._connected;
    }
    /**
     * Convert a timeline state into an hyperdeck state.
     * @param timelineState The state to be converted
     */
    convertTimelineStateToDeviceState(timelineState, mappings) {
        return (0, stateBuilder_1.convertTimelineStateToHyperdeckState)(timelineState.layers, mappings);
    }
    getStatus() {
        let statusCode = device_1.StatusCode.GOOD;
        const messages = [];
        if (!this._connected) {
            statusCode = device_1.StatusCode.BAD;
            messages.push('Not connected');
        }
        else {
            // check recording time left
            if (this._minRecordingTime && this._recordingTime < this._minRecordingTime) {
                if (this._recordingTime === 0) {
                    statusCode = device_1.StatusCode.BAD;
                }
                else {
                    statusCode = device_1.StatusCode.WARNING_MAJOR;
                }
                messages.push(`Recording time left is less than ${Math.floor(this._recordingTime / 60)} minutes and ${this._recordingTime % 60} seconds`);
            }
            // check for available slots
            let noAvailableSlots = true;
            for (let slot = 1; slot <= this._slotCount; slot++) {
                if (this._slotStatus[slot] &&
                    this._slotStatus[slot].status !== hyperdeck_connection_1.SlotStatus.MOUNTED &&
                    !this._suppressEmptySlotWarnings) {
                    messages.push(`Slot ${slot} is not mounted`);
                    if (statusCode < device_1.StatusCode.WARNING_MINOR)
                        statusCode = device_1.StatusCode.WARNING_MINOR;
                }
                else {
                    noAvailableSlots = false;
                }
            }
            if (noAvailableSlots) {
                statusCode = device_1.StatusCode.BAD;
            }
            // check if transport status is correct
            if (this._expectedTransportStatus !== this._transportStatus) {
                if (this._expectedTransportStatus === hyperdeck_connection_1.TransportStatus.RECORD) {
                    if (statusCode < device_1.StatusCode.WARNING_MAJOR)
                        statusCode = device_1.StatusCode.WARNING_MAJOR;
                    messages.push('Hyperdeck not recording');
                }
                else if (this._expectedTransportStatus === hyperdeck_connection_1.TransportStatus.PLAY) {
                    if (statusCode < device_1.StatusCode.WARNING_MAJOR)
                        statusCode = device_1.StatusCode.WARNING_MAJOR;
                    messages.push('Hyperdeck not playing');
                }
            }
        }
        return {
            statusCode,
            messages,
        };
    }
    /**
     * Gets the current state of the device
     */
    async _queryCurrentState() {
        if (!this._connected)
            return (0, stateBuilder_1.getDefaultHyperdeckState)();
        const [notifyRes, transportRes] = await Promise.all([
            this._hyperdeck.sendCommand(new hyperdeck_connection_1.Commands.NotifyGetCommand()),
            this._hyperdeck.sendCommand(new hyperdeck_connection_1.Commands.TransportInfoCommand()),
        ]);
        const res = {
            notify: notifyRes,
            transport: transportRes,
            timelineObjId: 'currentState',
        };
        return res;
    }
    /**
     * Queries the recording time left in seconds of the device and mutates
     * this._recordingTime
     * This is public for the unit tests
     */
    async _queryRecordingTime() {
        if (this._recTimePollTimer) {
            clearTimeout(this._recTimePollTimer);
        }
        let totalRecordingTime = 0;
        for (let slot = 1; slot <= this._slotCount; slot++) {
            try {
                const res = await this._hyperdeck.sendCommand(new hyperdeck_connection_1.Commands.SlotInfoCommand(slot));
                this._slotStatus[slot] = res;
                if (res.status === 'mounted') {
                    totalRecordingTime += res.recordingTime;
                }
            }
            catch (e) {
                // null
            }
        }
        if (totalRecordingTime !== this._recordingTime) {
            this._recordingTime = totalRecordingTime;
            this._connectionChanged();
        }
        let timeTillNextUpdate = 10;
        if (totalRecordingTime > 10) {
            if (totalRecordingTime - this._minRecordingTime > 10) {
                timeTillNextUpdate = (totalRecordingTime - this._minRecordingTime) / 2;
            }
            else if (totalRecordingTime - this._minRecordingTime < 0) {
                timeTillNextUpdate = totalRecordingTime / 2;
            }
        }
        this._recTimePollTimer = setTimeout(() => {
            this._queryRecordingTime().catch((e) => this.context.logger.error('HyperDeck.queryRecordingTime', e));
        }, timeTillNextUpdate * 1000);
    }
    async _querySlotNumber() {
        const { slots } = await this._hyperdeck.sendCommand(new hyperdeck_connection_1.Commands.DeviceInfoCommand());
        // before protocol version 1.9 we do not get slot info, so we assume 2 slots.
        if (!slots)
            return 2;
        return slots;
    }
    _connectionChanged() {
        this.context.connectionChanged(this.getStatus());
    }
}
exports.HyperdeckDevice = HyperdeckDevice;
//# sourceMappingURL=index.js.map