"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBSConnection = exports.OBSConnectionEvents = void 0;
const eventemitter3_1 = require("eventemitter3");
const obs_websocket_js_1 = require("obs-websocket-js");
const RECONNECT_TIME = 5000;
var OBSConnectionEvents;
(function (OBSConnectionEvents) {
    OBSConnectionEvents["Connected"] = "connected";
    OBSConnectionEvents["Disconnected"] = "disconnected";
    OBSConnectionEvents["Error"] = "error";
})(OBSConnectionEvents = exports.OBSConnectionEvents || (exports.OBSConnectionEvents = {}));
class OBSConnection extends eventemitter3_1.EventEmitter {
    constructor() {
        super();
        this._obs = new obs_websocket_js_1.default();
        this._reconnect_wait = 0;
        this._sceneItemMap = new Map();
        this.connected = false;
        this.error = undefined;
        this._obs.on('ConnectionClosed', () => {
            if (!this._reconnect_timeout) {
                this._reconnect_timeout = setTimeout(() => {
                    this._attemptConnection();
                }, this._reconnect_wait);
                this._reconnect_wait = RECONNECT_TIME;
            }
        });
    }
    connect(host, port, password) {
        this._url = `ws://${host}:${port}`;
        this._password = password;
        this._attemptConnection();
    }
    _attemptConnection() {
        this._reconnect_timeout = undefined;
        if (!this._url)
            return;
        this._obs
            .connect(this._url, this._password)
            .then(() => {
            this.connected = true;
            this._reconnect_wait = 0;
            if (this._reconnect_timeout)
                clearTimeout(this._reconnect_timeout);
            this._buildAndTrackSceneItemIDs()
                .catch((e) => {
                this.emit(OBSConnectionEvents.Error, 'Error trying to rebuild SceneItemID map', e);
            })
                .finally(() => {
                this.emit(OBSConnectionEvents.Connected);
            });
        })
            .catch((e) => {
            this.connected = false;
            this.error = e.toString();
            this.emit(OBSConnectionEvents.Disconnected); // does this create too many events?
        });
    }
    disconnect() {
        this._url = undefined;
        this._password = undefined;
        if (this._reconnect_timeout)
            clearTimeout(this._reconnect_timeout);
        this._obs
            .disconnect()
            .then(() => {
            this.connected = false;
            this.emit(OBSConnectionEvents.Disconnected);
        })
            .catch((e) => {
            this.emit(OBSConnectionEvents.Error, 'Error while disconnecting', e);
        });
    }
    async call(requestType, requestData) {
        // todo - OBS currently doesn't let use send play or pause commands if the media is stopped so we have a little hack in place
        if (requestType === 'TriggerMediaInputAction' &&
            requestData?.inputName &&
            requestData?.mediaAction !==
                'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP') {
            const name = requestData.inputName;
            // get the state first...
            const status = await this._obs.call('GetMediaInputStatus', { inputName: name });
            if (status.mediaState === 'OBS_MEDIA_STATE_STOPPED') {
                // restart it first
                await this._obs.call('TriggerMediaInputAction', {
                    inputName: name,
                    mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART',
                });
            }
        }
        return this._obs.call(requestType, requestData);
    }
    getSceneItemId(scene, input) {
        return this._sceneItemMap.get(scene + '_' + input);
    }
    async _buildAndTrackSceneItemIDs() {
        const sceneItemMap = new Map();
        const scenes = await this._obs.call('GetSceneList');
        for (const scene of scenes.scenes) {
            const items = await this._obs.call('GetSceneItemList', { sceneName: scene.sceneName });
            for (const item of items.sceneItems) {
                sceneItemMap.set(scene.sceneName + '_' + item.sourceName, item.sceneItemId);
            }
        }
        this._sceneItemMap = sceneItemMap;
    }
}
exports.OBSConnection = OBSConnection;
//# sourceMappingURL=connection.js.map