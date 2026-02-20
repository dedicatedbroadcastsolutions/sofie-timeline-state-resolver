"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShotokuDevice = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const device_1 = require("../../service/device");
const _ = require("underscore");
const connection_1 = require("./connection");
class ShotokuDevice extends device_1.Device {
    constructor() {
        super(...arguments);
        this._shotoku = new connection_1.ShotokuAPI();
        this.actions = {};
    }
    async init(options) {
        this._shotoku.on('error', (info, error) => this.context.logger.error(info, error));
        this._shotoku.on('connected', () => {
            this.context.connectionChanged(this.getStatus());
        });
        this._shotoku.on('disconnected', () => {
            this.context.connectionChanged(this.getStatus());
        });
        this._shotoku.on('warn', (message) => {
            this.context.logger.warning(message);
        });
        this._shotoku
            .connect(options.host, options.port)
            .catch((e) => this.context.logger.debug('Shotoku device failed initial connection attempt', e));
        return true;
    }
    async terminate() {
        await this._shotoku.dispose();
    }
    convertTimelineStateToDeviceState(state) {
        const deviceState = {
            shots: {},
            sequences: {},
        };
        _.each(state.layers, (layer) => {
            const content = layer.content;
            if (content.deviceType === timeline_state_resolver_types_1.DeviceType.SHOTOKU) {
                if (content.type === timeline_state_resolver_types_1.TimelineContentTypeShotoku.SHOT) {
                    const show = content.show || 1;
                    if (!content.shot)
                        return;
                    deviceState.shots[show + '.' + content.shot] = {
                        ...content,
                        fromTlObject: layer.id,
                    };
                }
                else {
                    deviceState.sequences[content.sequenceId] = {
                        shots: content.shots.filter((s) => !!s.shot),
                        fromTlObject: layer.id,
                    };
                }
            }
        });
        return deviceState;
    }
    diffStates(oldState, newState) {
        // unfortunately we don't know what shots belong to what camera, so we can't do anything smart
        const commands = [];
        Object.entries(newState.shots).forEach(([index, newCommandContent]) => {
            const oldLayer = oldState?.shots[index];
            if (!oldLayer) {
                // added!
                const shotokuCommand = {
                    show: newCommandContent.show,
                    shot: newCommandContent.shot,
                    type: newCommandContent.transitionType === timeline_state_resolver_types_1.ShotokuTransitionType.Fade
                        ? connection_1.ShotokuCommandType.Fade
                        : connection_1.ShotokuCommandType.Cut,
                    changeOperatorScreen: newCommandContent.changeOperatorScreen,
                };
                commands.push({
                    context: `added: ${newCommandContent.fromTlObject}`,
                    timelineObjId: newCommandContent.fromTlObject,
                    command: shotokuCommand,
                });
            }
            else {
                // since there is nothing but a trigger, we know nothing changed.
            }
        });
        Object.entries(newState.sequences).forEach(([index, newCommandContent]) => {
            const oldLayer = oldState?.sequences[index];
            if (!oldLayer) {
                // added!
                const shotokuCommand = {
                    shots: newCommandContent.shots.map((s) => ({
                        show: s.show,
                        shot: s.shot,
                        type: s.transitionType === timeline_state_resolver_types_1.ShotokuTransitionType.Fade ? connection_1.ShotokuCommandType.Fade : connection_1.ShotokuCommandType.Cut,
                        changeOperatorScreen: s.changeOperatorScreen,
                        offset: s.offset,
                    })),
                };
                commands.push({
                    context: `added: ${newCommandContent.fromTlObject}`,
                    timelineObjId: newCommandContent.fromTlObject,
                    command: shotokuCommand,
                });
            }
            else {
                // since there is nothing but a trigger, we know nothing changed.
            }
        });
        return commands;
    }
    async sendCommand({ command, context, timelineObjId }) {
        this.context.logger.debug({ command, context, timelineObjId });
        try {
            if (this._shotoku.connected) {
                await this._shotoku.executeCommand(command);
            }
            return;
        }
        catch (e) {
            this.context.commandError(e, { command, context, timelineObjId });
            return;
        }
    }
    get connected() {
        return this._shotoku.connected;
    }
    getStatus() {
        const messages = [];
        if (!this._shotoku.connected)
            messages.push('Not connected');
        return {
            statusCode: this._shotoku.connected ? timeline_state_resolver_types_1.StatusCode.GOOD : timeline_state_resolver_types_1.StatusCode.BAD,
            messages: [],
        };
    }
}
exports.ShotokuDevice = ShotokuDevice;
//# sourceMappingURL=index.js.map