import { EventEmitter } from 'eventemitter3';
import { LawoOptions } from 'timeline-state-resolver-types';
import { LawoFaderRampCommand, LawoSetValueCommand } from './diff';
export declare class LawoConnection extends EventEmitter {
    private getCurrentTime;
    private _lawo;
    private _lastSentValue;
    private _connected;
    private _sourcesPath;
    private _rampMotorFunctionPath;
    private _dbPropertyName;
    private _faderIntervalTime;
    private _faderThreshold;
    private _sourceNamePath;
    private _sourceNameToNodeName;
    private transitions;
    private transitionInterval;
    constructor(options: LawoOptions, getCurrentTime: () => number);
    /**
     * Safely disconnect from physical device such that this instance of the class
     * can be garbage collected.
     */
    terminate(): Promise<void>;
    get connected(): boolean;
    /**
     * Gets an ember node based on its path
     * @param path
     */
    private _getParameterNodeByPath;
    private _identifierToNodeName;
    /**
     * Returns an attribute path
     * @param identifier
     * @param attributePath
     */
    sourceNodeAttributePath(identifier: string, attributePath: string): string;
    rampFader(command: LawoFaderRampCommand, timelineObjId: string): Promise<void>;
    setValue(command: LawoSetValueCommand, timelineObjId: string): Promise<void>;
    private setValueWrapper;
    private runAnimation;
    private _mapSourcesToNodeNames;
}
//# sourceMappingURL=connection.d.ts.map