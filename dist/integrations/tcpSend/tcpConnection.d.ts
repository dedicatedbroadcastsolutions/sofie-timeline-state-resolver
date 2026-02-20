/// <reference types="node" />
import { EventEmitter } from 'eventemitter3';
import { TCPSendOptions } from 'timeline-state-resolver-types';
import { Socket } from 'net';
export interface TcpConnectionEvents {
    connectionChanged: [connected: boolean];
    error: [context: string, error: Error];
}
export declare class TcpConnection extends EventEmitter<TcpConnectionEvents> {
    /**
     * Is set when the connection is active.
     * is set to undefined if disconnect() has been called (then do not try to reconnect)
     */
    private activeOptions;
    private _tcpClient;
    private _connected;
    private _retryConnectTimeout;
    get connected(): boolean;
    activate(options: TCPSendOptions): void;
    ensureConnection(): Promise<Socket>;
    deactivate(): Promise<void>;
    reconnect(): Promise<void>;
    sendTCPMessage(message: string): Promise<void>;
    private _cleanupTcpClient;
    private _setConnected;
    private _triggerRetryConnection;
    private _retryConnection;
    private _connectionChanged;
}
//# sourceMappingURL=tcpConnection.d.ts.map