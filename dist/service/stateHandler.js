"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateHandler = void 0;
const lib_1 = require("../lib");
const measure_1 = require("./measure");
const commandExecutor_1 = require("./commandExecutor");
const CLOCK_INTERVAL = 20;
class StateHandler {
    constructor(context, config, device) {
        this.context = context;
        this.config = config;
        this.device = device;
        this.stateQueue = [];
        /** Semaphore, to ensure that .executeNextStateChange() is only executed one at a time */
        this._executingStateChange = false;
        this.logger = context.logger;
        this.setCurrentState(undefined).catch((e) => {
            this.logger.error('Error while creating new StateHandler', e);
        });
        this._commandExecutor = new commandExecutor_1.CommandExecutor(context.logger, this.config.executionType, async (c) => device.sendCommand(c));
        this.clock = setInterval(() => {
            const t = context.getCurrentTime();
            // main clock to check if next state needs to be sent out
            for (const state of this.stateQueue) {
                const nextTime = Math.max(0, state?.state.time - (state?.preliminary ?? 0) - t);
                if (nextTime > CLOCK_INTERVAL)
                    break;
                // schedule any states between now and the next tick
                setTimeout(() => {
                    if (!this._executingStateChange && this.stateQueue[0] === state) {
                        // if this is the next state, execute it
                        this.executeNextStateChange().catch((e) => {
                            this.logger.error('Error while executing next state change', e);
                        });
                    }
                }, nextTime);
            }
        }, CLOCK_INTERVAL);
    }
    async terminate() {
        clearInterval(this.clock);
        this.stateQueue = [];
    }
    async clearFutureStates() {
        this.stateQueue = [];
    }
    async handleState(state, mappings) {
        if (this.currentState?.state && this.currentState.state.time > state.time)
            return; // the incoming state is stale, we ignore it
        const nextState = this.stateQueue[0];
        const trace = (0, lib_1.startTrace)('device:convertTimelineStateToDeviceState', { deviceId: this.context.deviceId });
        const deviceState = this.device.convertTimelineStateToDeviceState(state, mappings);
        this.context.emitTimeTrace((0, lib_1.endTrace)(trace));
        // Discard any states that comes after this one,
        //  and append this one to the end:
        this.stateQueue = [
            ...this.stateQueue.filter((s) => s.state.time < state.time),
            {
                deviceState,
                state,
                mappings,
                measurement: new measure_1.Measurement(state.time),
            },
        ];
        if (nextState !== this.stateQueue[0]) {
            // the next state changed
            if (nextState)
                nextState.commands = undefined;
            this.calculateNextStateChange().catch((e) => {
                this.logger.error('Error while calculating next state change', e);
            });
        }
    }
    async setCurrentState(state) {
        this.currentState = {
            commands: [],
            deviceState: state,
            state: this.currentState?.state ?? { time: this.context.getCurrentTime(), layers: {}, nextEvents: [] },
            mappings: this.currentState?.mappings ?? {},
        };
        await this.calculateNextStateChange();
    }
    clearFutureAfterTimestamp(t) {
        this.stateQueue = this.stateQueue.filter((s) => s.state.time <= t);
    }
    async calculateNextStateChange() {
        if (!this.currentState)
            return; // a change is currently being executed, we'll be called again once it's done
        const nextState = this.stateQueue[0];
        if (!nextState)
            return;
        try {
            const trace = (0, lib_1.startTrace)('device:diffDeviceStates', { deviceId: this.context.deviceId });
            nextState.commands = this.device.diffStates(this.currentState?.deviceState, nextState.deviceState, nextState.mappings, this.context.getCurrentTime());
            nextState.preliminary = Math.max(0, ...nextState.commands.map((c) => c.preliminary ?? 0));
            this.context.emitTimeTrace((0, lib_1.endTrace)(trace));
        }
        catch (e) {
            // todo - log an error
            this.logger.error('diffDeviceState failed, t = ' + nextState.state.time, e);
            // we don't want to get stuck, so we should act as if this can be executed anyway
            nextState.commands = [];
        }
        if (!this._executingStateChange &&
            nextState === this.stateQueue[0] &&
            nextState.state.time - (nextState.preliminary ?? 0) <= this.context.getCurrentTime()) {
            await this.executeNextStateChange();
        }
    }
    async executeNextStateChange() {
        if (!this.stateQueue[0] || this._executingStateChange) {
            // there is no next to execute - or we are currently executing something
            return;
        }
        this._executingStateChange = true;
        if (!this.stateQueue[0].commands) {
            await this.calculateNextStateChange();
        }
        const newState = this.stateQueue.shift();
        if (!newState || !newState.commands) {
            // this should not be possible given our previous guard?
            return;
        }
        newState.measurement?.executeState();
        this.currentState = undefined;
        this._commandExecutor
            .executeCommands(newState.commands, newState.measurement)
            .then(() => {
            if (newState.measurement)
                this.context.reportStateChangeMeasurement(newState.measurement.report());
        })
            .catch((e) => {
            this.logger.error('Error while executing next state change', e);
        });
        this.currentState = newState;
        this._executingStateChange = false;
        this.calculateNextStateChange().catch((e) => {
            this.logger.error('Error while executing next state change', e);
        });
    }
}
exports.StateHandler = StateHandler;
//# sourceMappingURL=stateHandler.js.map