import { EventEmitter } from 'eventemitter3';
interface ShotokuAPIEvents {
    warn: [message: string];
    disconnected: [];
    connected: [];
    error: [context: string, error: Error];
}
export declare class ShotokuAPI extends EventEmitter<ShotokuAPIEvents> {
    private _tcpClient;
    private _connected;
    private _host;
    private _port;
    private _setDisconnected;
    private _retryConnectTimeout;
    /**
     * Connnects to the OSC server.
     * @param host ip to connect to
     * @param port port the osc server is hosted on
     */
    connect(host: string, port: number): Promise<void>;
    dispose(): Promise<void>;
    get connected(): boolean;
    executeCommand(command: ShotokuCommand): Promise<void>;
    send(command: ShotokuBasicCommand): Promise<void>;
    private _setConnected;
    private _triggerRetryConnection;
    private _retryConnection;
    private _disconnectTCPClient;
    private _connectTCPClient;
    private _sendTCPMessage;
}
export interface ShotokuSequenceCommand {
    shots: Array<ShotokuBasicCommand & {
        offset: number;
    }>;
}
export interface ShotokuBasicCommand {
    type: ShotokuCommandType;
    show?: number;
    shot: number;
    changeOperatorScreen?: boolean;
}
export type ShotokuCommand = ShotokuBasicCommand | ShotokuSequenceCommand;
export declare enum ShotokuCommandType {
    Cut = "cut",
    Fade = "fade"
}
export {};
//# sourceMappingURL=connection.d.ts.map