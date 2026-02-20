import EventEmitter = require('eventemitter3');
import { type DeviceStatus, type DeviceType, type Mappings, type Timeline, type TSRTimelineContent } from 'timeline-state-resolver-types';
import type { DeviceEvents } from './device';
import type { DeviceOptionsAnyInternal, ExpectedPlayoutItem } from '..';
type Config = DeviceOptionsAnyInternal;
export interface DeviceDetails {
    deviceId: string;
    deviceType: DeviceType;
    deviceName: string;
    instanceId: number;
    startTime: number;
    supportsExpectedPlayoutItems: boolean;
    canConnect: boolean;
}
export interface DeviceInstanceEvents extends Omit<DeviceEvents, 'connectionChanged'> {
    /** The connection status has changed */
    connectionChanged: [status: DeviceStatus];
}
/**
 * Top level container for setting up and interacting with any device integrations
 */
export declare class DeviceInstanceWrapper extends EventEmitter<DeviceInstanceEvents> {
    private config;
    private getRemoteCurrentTime;
    private _device;
    private _stateHandler;
    private _deviceId;
    private _deviceType;
    private _deviceName;
    private _instanceId;
    private _startTime;
    private _isActive;
    private _logDebug;
    private _logDebugStates;
    private _lastUpdateCurrentTime;
    private _tDiff;
    constructor(id: string, time: number, config: Config, getRemoteCurrentTime: () => Promise<number>);
    initDevice(_activeRundownPlaylistId?: string): Promise<boolean>;
    terminate(): Promise<void>;
    executeAction(id: string, payload?: Record<string, any>): Promise<import("timeline-state-resolver-types").ActionExecutionResult<any>>;
    makeReady(okToDestroyStuff?: boolean): Promise<void>;
    standDown(): Promise<void>;
    /** @deprecated - just here for API compatiblity with the old class */
    prepareForHandleState(): void;
    handleState(newState: Timeline.TimelineState<TSRTimelineContent>, newMappings: Mappings): void;
    clearFuture(t: number): void;
    getDetails(): DeviceDetails;
    handleExpectedPlayoutItems(_expectedPlayoutItems: Array<ExpectedPlayoutItem>): void;
    getStatus(): DeviceStatus;
    setDebugLogging(value: boolean): void;
    setDebugState(value: boolean): void;
    getCurrentTime(): number;
    private _getDeviceContextAPI;
    private _updateTimeSync;
}
export {};
//# sourceMappingURL=DeviceInstance.d.ts.map