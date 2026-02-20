"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VMixInputHandler = void 0;
const path = require("path");
const eventemitter3_1 = require("eventemitter3");
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const vMixStateDiffer_1 = require("./vMixStateDiffer");
const vMixCommands_1 = require("./vMixCommands");
/**
 * Handles pre-loading of inputs.
 */
class VMixInputHandler extends eventemitter3_1.EventEmitter {
    constructor(_vmix) {
        super();
        this._vmix = _vmix;
        // how long to let an input linger before removing it
        this.TTL = 1000;
        /** Tracks the actual state in vmix of which inputs are loaded */
        this._inputs = new Map();
        this._updateTimeout = undefined;
    }
    addInput(key, type, name) {
        let existing = this._inputs.get(key);
        if (!existing) {
            existing = {
                type,
                name,
                addedCommandSent: false,
            };
            this._inputs.set(key, existing);
        }
        delete existing.removeTime;
        this._triggerUpdate();
    }
    /** Mark input for removal */
    removeInput(time, key) {
        const existing = this._inputs.get(key);
        if (existing) {
            existing.removeTime = Math.max(existing.removeTime ?? 0, time + this.TTL);
            this._triggerUpdate();
        }
    }
    _triggerUpdate() {
        if (this._updateTimeout) {
            clearTimeout(this._updateTimeout);
            this._updateTimeout = undefined;
        }
        setImmediate(() => {
            try {
                this._update();
            }
            catch (e) {
                this.emit('error', e);
            }
        });
    }
    _update() {
        const commands = [];
        const now = this._vmix.getCurrentTime();
        let nextTimeout = Infinity;
        for (const [key, input] of this._inputs.entries()) {
            if (input.removeTime && input.removeTime <= now) {
                if (input.addedCommandSent) {
                    commands.push({
                        command: {
                            command: timeline_state_resolver_types_1.VMixCommand.REMOVE_INPUT,
                            input: input.name,
                        },
                        context: vMixCommands_1.CommandContext.None,
                        timelineId: '',
                    });
                }
                this._inputs.delete(key);
                continue; // don't update nextTimeout
            }
            else {
                if (!input.addedCommandSent) {
                    const actualName = key.substring(vMixStateDiffer_1.TSR_INPUT_PREFIX.length);
                    commands.push({
                        command: {
                            command: timeline_state_resolver_types_1.VMixCommand.ADD_INPUT,
                            value: `${input.type}|${actualName}`,
                        },
                        context: vMixCommands_1.CommandContext.None,
                        timelineId: '',
                    });
                    commands.push({
                        command: {
                            command: timeline_state_resolver_types_1.VMixCommand.SET_INPUT_NAME,
                            input: this.getFilename(actualName),
                            value: key,
                        },
                        context: vMixCommands_1.CommandContext.None,
                        timelineId: '',
                    });
                    input.addedCommandSent = true;
                }
            }
            if (input.removeTime) {
                nextTimeout = Math.min(nextTimeout, input.removeTime);
            }
        }
        this._vmix.addToQueue(commands, now);
        const timeToNextTimeout = nextTimeout - now;
        if (timeToNextTimeout > 0 && timeToNextTimeout !== Infinity) {
            this._updateTimeout = setTimeout(() => {
                this._updateTimeout = undefined;
                this._triggerUpdate();
            }, timeToNextTimeout);
        }
    }
    getFilename(filePath) {
        return path.basename(filePath);
    }
}
exports.VMixInputHandler = VMixInputHandler;
//# sourceMappingURL=VMixInputHandler.js.map