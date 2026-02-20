"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpConnection = void 0;
const eventemitter3_1 = require("eventemitter3");
const net_1 = require("net");
const TIMEOUT = 3000; // ms
const RETRY_TIMEOUT_FIRST = 500; // ms
const RETRY_TIMEOUT_SUBSEQUENT = 5000; // ms
class TcpConnection extends eventemitter3_1.EventEmitter {
    constructor() {
        super(...arguments);
        /**
         * Is set when the connection is active.
         * is set to undefined if disconnect() has been called (then do not try to reconnect)
         */
        this.activeOptions = undefined;
        this._tcpClient = null;
        this._connected = false;
    }
    get connected() {
        return this._connected;
    }
    activate(options) {
        this.activeOptions = options;
        this.ensureConnection().catch((err) => {
            this.emit('error', 'activate TCP', err);
        });
    }
    async ensureConnection() {
        if (!this.activeOptions)
            throw new Error('TCP connection not activated');
        const activeOptions = this.activeOptions;
        if (!this._tcpClient) {
            this._tcpClient = new net_1.Socket();
            this._tcpClient.on('connect', () => {
                this._setConnected(true);
            });
            this._tcpClient.on('close', () => {
                this._setConnected(false);
            });
            this._tcpClient.on('end', () => {
                this._setConnected(false);
            });
        }
        const tcpClient = this._tcpClient;
        return new Promise((resolve, reject) => {
            if (!this.connected) {
                tcpClient.connect(activeOptions.port, activeOptions.host, () => {
                    resolve(tcpClient);
                });
                tcpClient.once('error', (err) => {
                    reject(err);
                });
                setTimeout(() => {
                    reject(new Error(`TCP timeout: Unable to connect to ${activeOptions.host}:${activeOptions.port}`));
                }, TIMEOUT);
            }
            else {
                resolve(tcpClient);
            }
        });
    }
    async deactivate() {
        this.activeOptions = undefined; // prevent reconnecting
        if (this._tcpClient) {
            const tcpClient = this._tcpClient;
            await new Promise((resolve) => {
                tcpClient.once('close', () => {
                    resolve();
                });
                tcpClient.once('end', () => {
                    resolve();
                });
                tcpClient.end();
                setTimeout(() => {
                    resolve();
                }, TIMEOUT);
                setTimeout(() => {
                    if (this._tcpClient) {
                        // Forcefully destroy the connection:
                        this._tcpClient.destroy();
                    }
                }, Math.floor(TIMEOUT / 2));
            });
        }
        this._cleanupTcpClient();
        this._setConnected(false);
    }
    async reconnect() {
        if (!this.activeOptions)
            throw new Error('TCP connection not activated');
        const options = this.activeOptions;
        await this.deactivate();
        this.activate(options);
    }
    async sendTCPMessage(message) {
        if (!this.activeOptions)
            throw new Error('TCP connection not activated');
        const tcpClient = await this.ensureConnection();
        tcpClient.write(Buffer.from(message, this.activeOptions.bufferEncoding));
    }
    _cleanupTcpClient() {
        if (this._tcpClient) {
            this._tcpClient.removeAllListeners('connect');
            this._tcpClient.removeAllListeners('close');
            this._tcpClient.removeAllListeners('end');
            this._tcpClient.removeAllListeners('error');
            this._tcpClient = null;
        }
    }
    _setConnected(connected) {
        if (this._connected !== connected) {
            this._connected = connected;
            this._connectionChanged();
            if (!connected) {
                this._tcpClient = null;
                this._triggerRetryConnection(true);
            }
        }
    }
    _triggerRetryConnection(firstTry) {
        if (!this._retryConnectTimeout) {
            this._retryConnectTimeout = setTimeout(() => {
                this._retryConnection();
            }, firstTry ? RETRY_TIMEOUT_FIRST : RETRY_TIMEOUT_SUBSEQUENT);
        }
    }
    _retryConnection() {
        clearTimeout(this._retryConnectTimeout);
        if (!this.activeOptions)
            return;
        if (this.activeOptions && !this.connected) {
            this.ensureConnection().catch((err) => {
                if (`${err}`.includes('TCP timeout')) {
                    this._triggerRetryConnection(false);
                }
                else {
                    this.emit('error', 'reconnect TCP', err);
                }
            });
        }
    }
    _connectionChanged() {
        this.emit('connectionChanged', this._connected);
    }
}
exports.TcpConnection = TcpConnection;
//# sourceMappingURL=tcpConnection.js.map