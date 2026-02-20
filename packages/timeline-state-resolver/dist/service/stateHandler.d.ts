import { FinishedTrace } from '../lib';
import { Mappings, Timeline, TSRTimelineContent } from 'timeline-state-resolver-types';
import { BaseDeviceAPI, CommandWithContext } from './device';
import { StateChangeReport } from './measure';
export declare class StateHandler<DeviceState, Command extends CommandWithContext> {
    private context;
    private config;
    private device;
    private stateQueue;
    private currentState;
    /** Semaphore, to ensure that .executeNextStateChange() is only executed one at a time */
    private _executingStateChange;
    private _commandExecutor;
    private clock;
    private logger;
    constructor(context: StateHandlerContext, config: StateHandlerConfig, device: BaseDeviceAPI<DeviceState, Command>);
    terminate(): Promise<void>;
    clearFutureStates(): Promise<void>;
    handleState(state: Timeline.TimelineState<TSRTimelineContent>, mappings: Mappings): Promise<void>;
    setCurrentState(state: DeviceState | undefined): Promise<void>;
    clearFutureAfterTimestamp(t: number): void;
    private calculateNextStateChange;
    private executeNextStateChange;
}
export interface StateHandlerConfig {
    executionType: 'salvo' | 'sequential';
}
export interface StateHandlerContext {
    deviceId: string;
    logger: {
        debug: (...args: any[]) => void;
        info: (info: string) => void;
        warn: (warning: string) => void;
        error: (context: string, err: Error) => void;
    };
    emitTimeTrace: (trace: FinishedTrace) => void;
    reportStateChangeMeasurement: (report: StateChangeReport) => void;
    getCurrentTime: () => number;
}
//# sourceMappingURL=stateHandler.d.ts.map