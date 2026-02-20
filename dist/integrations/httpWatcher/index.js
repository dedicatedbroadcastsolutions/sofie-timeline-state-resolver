"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPWatcherDevice = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const got_1 = require("got");
const device_1 = require("../../service/device");
/**
 * This is a HTTPWatcherDevice, requests a uri on a regular interval and watches
 * it's response.
 */
class HTTPWatcherDevice extends device_1.Device {
    constructor() {
        super(...arguments);
        this.actions = {};
        this.status = timeline_state_resolver_types_1.StatusCode.UNKNOWN;
    }
    onInterval() {
        if (!this.uri) {
            this._setStatus(timeline_state_resolver_types_1.StatusCode.BAD, 'URI not set');
            return;
        }
        const reqMethod = got_1.default[this.httpMethod];
        if (reqMethod) {
            reqMethod(this.uri, {
                headers: this.headers,
            })
                .then((response) => this.handleResponse(response))
                .catch((error) => {
                this._setStatus(timeline_state_resolver_types_1.StatusCode.BAD, error.toString() || 'Unknown');
            });
        }
        else {
            this._setStatus(timeline_state_resolver_types_1.StatusCode.BAD, `Bad request method: "${this.httpMethod}"`);
        }
    }
    stopInterval() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }
    startInterval() {
        this.stopInterval();
        this.interval = setInterval(() => this.onInterval(), this.intervalTime);
        // Also do a check right away:
        setTimeout(() => this.onInterval(), 300);
    }
    handleResponse(response) {
        if (this.expectedHttpResponse && this.expectedHttpResponse !== response.statusCode) {
            this._setStatus(timeline_state_resolver_types_1.StatusCode.BAD, `Expected status code ${this.expectedHttpResponse}, got ${response.statusCode}`);
        }
        else if (this.keyword && response.body && response.body.indexOf(this.keyword) === -1) {
            this._setStatus(timeline_state_resolver_types_1.StatusCode.BAD, `Expected keyword "${this.keyword}" not found`);
        }
        else {
            this._setStatus(timeline_state_resolver_types_1.StatusCode.GOOD);
        }
    }
    async init(options) {
        switch (options.httpMethod) {
            case 'post':
                this.httpMethod = timeline_state_resolver_types_1.TimelineContentTypeHTTP.POST;
                break;
            case 'delete':
                this.httpMethod = timeline_state_resolver_types_1.TimelineContentTypeHTTP.DELETE;
                break;
            case 'put':
                this.httpMethod = timeline_state_resolver_types_1.TimelineContentTypeHTTP.PUT;
                break;
            case 'get':
            case undefined:
            default:
                this.httpMethod = timeline_state_resolver_types_1.TimelineContentTypeHTTP.GET;
                break;
        }
        this.expectedHttpResponse = Number(options.expectedHttpResponse) || undefined;
        this.headers = options.headers;
        this.keyword = options.keyword;
        this.intervalTime = Math.max(Number(options.interval) || 1000, 1000);
        this.uri = options.uri;
        this.startInterval();
        return Promise.resolve(true);
    }
    async terminate() {
        this.stopInterval();
    }
    getStatus() {
        return {
            statusCode: this.status,
            messages: this.statusReason ? [this.statusReason] : [],
        };
    }
    _setStatus(status, reason) {
        if (this.status !== status || this.statusReason !== reason) {
            this.status = status;
            this.statusReason = reason;
            this.context.connectionChanged(this.getStatus());
        }
    }
    get connected() {
        return false;
    }
    convertTimelineStateToDeviceState() {
        // Noop
        return {};
    }
    diffStates() {
        // Noop
        return [];
    }
    async sendCommand() {
        // Noop
    }
}
exports.HTTPWatcherDevice = HTTPWatcherDevice;
//# sourceMappingURL=index.js.map