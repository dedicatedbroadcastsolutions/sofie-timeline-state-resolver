import { SofieChefOptions, Mappings, TSRTimelineContent, Timeline, SofieChefActions, ActionExecutionResult, DeviceStatus } from 'timeline-state-resolver-types';
import { ReceiveWSMessageAny } from './api';
import { Device } from '../../service/device';
export interface SofieChefCommandWithContext {
    command: ReceiveWSMessageAny;
    context: string;
    timelineObjId: string;
}
export interface SofieChefState {
    windows: {
        [windowId: string]: {
            url: string;
            /** The TimelineObject which set the url */
            urlTimelineObjId: string;
        };
    };
}
/**
 * This is a wrapper for a SofieChef-devices,
 * https://github.com/nrkno/sofie-chef
 */
export declare class SofieChefDevice extends Device<SofieChefOptions, SofieChefState, SofieChefCommandWithContext> {
    readonly actions: {
        [id in SofieChefActions]: (id: string, payload?: Record<string, any>) => Promise<ActionExecutionResult>;
    };
    private _ws?;
    private _connected;
    private _status;
    private initOptions?;
    private msgId;
    /**
     * Initiates the connection with SofieChed through a websocket connection.
     */
    init(initOptions: SofieChefOptions): Promise<boolean>;
    private _setupWSConnection;
    private reconnectTimeout?;
    private tryReconnect;
    private resyncState;
    terminate(): Promise<void>;
    get connected(): boolean;
    convertTimelineStateToDeviceState(timelineState: Timeline.TimelineState<TSRTimelineContent>, mappings: Mappings): SofieChefState;
    /** Restart (reload) all windows */
    private restartAllWindows;
    /** Restart (reload) a window */
    private restartWindow;
    getStatus(): Omit<DeviceStatus, 'active'>;
    private convertStatusCode;
    /**
     * Compares the new timeline-state with the old one, and generates commands to account for the difference
     */
    diffStates(oldSofieChefState: SofieChefState | undefined, newSofieChefState: SofieChefState, mappings: Mappings): Array<SofieChefCommandWithContext>;
    sendCommand({ command, context, timelineObjId }: SofieChefCommandWithContext): Promise<any>;
    private _updateConnected;
    private _updateStatus;
    private _handleReceivedMessage;
    private waitingForReplies;
    private _sendMessage;
}
//# sourceMappingURL=index.d.ts.map