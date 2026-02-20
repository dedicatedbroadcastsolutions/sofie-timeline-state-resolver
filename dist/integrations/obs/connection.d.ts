import { EventEmitter } from 'eventemitter3';
import { OBSRequestTypes, OBSResponseTypes } from 'obs-websocket-js';
export declare enum OBSConnectionEvents {
    Connected = "connected",
    Disconnected = "disconnected",
    Error = "error"
}
export interface OBSConnectionEventsTypes {
    [OBSConnectionEvents.Connected]: [void];
    [OBSConnectionEvents.Disconnected]: [void];
    [OBSConnectionEvents.Error]: [string, Error];
}
export declare class OBSConnection extends EventEmitter<OBSConnectionEventsTypes> {
    private _obs;
    private _url;
    private _password;
    private _reconnect_wait;
    private _reconnect_timeout;
    private _sceneItemMap;
    connected: boolean;
    error: string | undefined;
    constructor();
    connect(host: string, port: number, password?: string): void;
    private _attemptConnection;
    disconnect(): void;
    call<Type extends keyof OBSRequestTypes>(requestType: Type, requestData?: OBSRequestTypes[Type]): Promise<OBSResponseTypes[Type]>;
    getSceneItemId(scene: string, input: string): number | undefined;
    private _buildAndTrackSceneItemIDs;
}
//# sourceMappingURL=connection.d.ts.map