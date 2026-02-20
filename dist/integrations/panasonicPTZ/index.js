"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanasonicPtzDevice = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const device_1 = require("../../service/device");
const state_1 = require("./state");
const diff_1 = require("./diff");
const connection_1 = require("./connection");
class PanasonicPtzDevice extends device_1.Device {
    constructor() {
        super(...arguments);
        this._device = undefined;
        this.actions = {};
    }
    async init(options) {
        this._device = new connection_1.PanasonicPtzHttpInterface(options.host, options.port, options.https);
        this._device.init();
        this._device.on('error', (e) => this.context.logger.error('Error in PanasonicPtzHttpInterface', e));
        return true;
    }
    async terminate() {
        this._device?.dispose();
    }
    convertTimelineStateToDeviceState(state, newMappings) {
        return (0, state_1.convertStateToPtz)(state, newMappings);
    }
    diffStates(oldState, newState) {
        return (0, diff_1.diffStates)(oldState ?? (0, state_1.getDefaultState)(), newState);
    }
    async sendCommand(command) {
        this.context.logger.debug(command);
        const cmd = command.command;
        try {
            if (this._device) {
                if (cmd.type === timeline_state_resolver_types_1.TimelineContentTypePanasonicPtz.PRESET) {
                    // recall preset
                    if (cmd.preset !== undefined) {
                        const res = await this._device.recallPreset(cmd.preset);
                        this.context.logger.debug(`Panasonic PTZ result: ${res}`);
                    }
                    else
                        throw new Error(`Bad parameter: preset`);
                }
                else if (cmd.type === timeline_state_resolver_types_1.TimelineContentTypePanasonicPtz.SPEED) {
                    // set speed
                    if (cmd.speed !== undefined) {
                        const res = await this._device.setSpeed(cmd.speed);
                        this.context.logger.debug(`Panasonic PTZ result: ${res}`);
                    }
                    else
                        throw new Error(`Bad parameter: speed`);
                }
                else if (cmd.type === timeline_state_resolver_types_1.TimelineContentTypePanasonicPtz.ZOOM_SPEED) {
                    // set zoom speed
                    if (cmd.zoomSpeed !== undefined) {
                        // scale -1 - 0 - +1 range to 01 - 50 - 99 range
                        const res = await this._device.setZoomSpeed(cmd.zoomSpeed * 49 + 50);
                        this.context.logger.debug(`Panasonic PTZ result: ${res}`);
                    }
                    else
                        throw new Error(`Bad parameter: zoomSpeed`);
                }
                else if (cmd.type === timeline_state_resolver_types_1.TimelineContentTypePanasonicPtz.ZOOM) {
                    // set zoom
                    if (cmd.zoom !== undefined) {
                        // scale 0 - +1 range to 555h - FFFh range
                        const res = await this._device.setZoom(cmd.zoom * 0xaaa + 0x555);
                        this.context.logger.debug(`Panasonic PTZ result: ${res}`);
                    }
                    else
                        throw new Error(`Bad parameter: zoom`);
                }
                else
                    throw new Error(`PTZ: Unknown type: "${cmd.type}"`);
            }
            else
                throw new Error(`PTZ device not set up`);
        }
        catch (e) {
            this.context.commandError(e, command);
        }
    }
    get connected() {
        return this._device?.connected ?? false;
    }
    getStatus() {
        if (!this._device?.connected) {
            return {
                statusCode: timeline_state_resolver_types_1.StatusCode.GOOD,
                messages: [],
            };
        }
        else {
            return {
                statusCode: timeline_state_resolver_types_1.StatusCode.BAD,
                messages: ['Not connected'],
            };
        }
    }
}
exports.PanasonicPtzDevice = PanasonicPtzDevice;
//# sourceMappingURL=index.js.map