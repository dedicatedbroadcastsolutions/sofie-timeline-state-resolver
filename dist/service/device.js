"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = void 0;
/**
 * API for use by the DeviceInstance to be able to use a device
 */
class Device {
    constructor(context) {
        this.context = context;
        // Nothing
    }
    /** @deprecated */
    async makeReady(_okToDestroyStuff) {
        // Do nothing by default
    }
    /** @deprecated */
    async standDown() {
        // Do nothing by default
    }
}
exports.Device = Device;
//# sourceMappingURL=device.js.map