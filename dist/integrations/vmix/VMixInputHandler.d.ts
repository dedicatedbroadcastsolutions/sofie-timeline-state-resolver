import { EventEmitter } from 'eventemitter3';
import { VMixStateCommandWithContext } from './vMixCommands';
/**
 * Handles pre-loading of inputs.
 */
export declare class VMixInputHandler extends EventEmitter {
    private _vmix;
    private TTL;
    /** Tracks the actual state in vmix of which inputs are loaded */
    private _inputs;
    private _updateTimeout;
    constructor(_vmix: {
        getCurrentTime: () => number;
        addToQueue: (commandsToAchieveState: Array<VMixStateCommandWithContext>, time: number) => void;
    });
    addInput(key: string, type: string, name: string): void;
    /** Mark input for removal */
    removeInput(time: number, key: string): void;
    private _triggerUpdate;
    private _update;
    private getFilename;
}
//# sourceMappingURL=VMixInputHandler.d.ts.map