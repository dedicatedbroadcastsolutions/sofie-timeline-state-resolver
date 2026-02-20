"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticatedHTTPSendDevice = void 0;
const _1 = require(".");
const simple_oauth2_1 = require("simple-oauth2");
const TOKEN_REQUEST_RETRY_TIMEOUT_MS = 1000;
const TOKEN_EXPIRATION_WINDOW_SEC = 60;
const DEFAULT_TOKEN_PATH = '/oauth/token';
class AuthenticatedHTTPSendDevice extends _1.HTTPSendDevice {
    constructor() {
        super(...arguments);
        this.tokenRequestPending = false;
    }
    async init(options) {
        if (options.bearerToken) {
            this.authOptions = {
                method: 0 /* AuthMethod.BEARER_TOKEN */,
                bearerToken: options.bearerToken,
            };
        }
        else if (options.oauthClientId && options.oauthClientSecret && options.oauthTokenHost) {
            this.authOptions = {
                method: 1 /* AuthMethod.CLIENT_CREDENTIALS */,
                clientId: options.oauthClientId,
                clientSecret: options.oauthClientSecret,
                audience: options.oauthAudience,
                tokenHost: options.oauthTokenHost,
                tokenPath: options.oauthTokenPath ?? DEFAULT_TOKEN_PATH,
            };
            this.requestAccessToken();
        }
        return super.init(options);
    }
    async terminate() {
        this.clearTokenRefreshTimeout();
        return super.terminate();
    }
    requestAccessToken() {
        if (this.tokenRequestPending)
            return;
        this.clearTokenRefreshTimeout();
        this.tokenRequestPending = true;
        const promise = this.makeAccessTokenRequest();
        promise
            .then((accessToken) => {
            this.context.logger.debug(`token received`);
            const expiresIn = accessToken.token.expires_in;
            if (typeof expiresIn === 'number') {
                this.scheduleTokenRefresh(expiresIn);
            }
        })
            .catch((e) => {
            this.context.logger.error('AuthenticatedHTTPSendDevice', e);
            setTimeout(() => this.requestAccessToken(), TOKEN_REQUEST_RETRY_TIMEOUT_MS);
        })
            .finally(() => {
            this.tokenRequestPending = false;
        });
        this.tokenPromise = promise;
    }
    clearTokenRefreshTimeout() {
        if (this.tokenRefreshTimeout) {
            clearTimeout(this.tokenRefreshTimeout);
        }
    }
    scheduleTokenRefresh(expiresInSec) {
        const timeoutMs = (expiresInSec - TOKEN_EXPIRATION_WINDOW_SEC) * 1000;
        this.context.logger.debug(`token refresh scheduled in ${timeoutMs}`);
        this.tokenRefreshTimeout = setTimeout(() => this.refreshAccessToken(), timeoutMs);
    }
    refreshAccessToken() {
        this.context.logger.debug(`token refresh`);
        this.requestAccessToken();
        this.tokenRefreshTimeout = undefined;
    }
    async makeAccessTokenRequest() {
        if (!this.authOptions || this.authOptions.method !== 1 /* AuthMethod.CLIENT_CREDENTIALS */) {
            throw Error('authOptions missing or incorrect');
        }
        this.context.logger.debug('debug', 'token request');
        const token = await new simple_oauth2_1.ClientCredentials({
            client: {
                id: this.authOptions.clientId,
                secret: this.authOptions.clientSecret,
            },
            auth: {
                tokenHost: this.authOptions.tokenHost,
                tokenPath: this.authOptions.tokenPath,
            },
        }).getToken({
            audience: this.authOptions.audience,
        });
        return token;
    }
    async sendCommandWithResult({ timelineObjId, context, command, }) {
        if (this.authOptions) {
            const bearerToken = this.authOptions.method === 0 /* AuthMethod.BEARER_TOKEN */ ? this.authOptions.bearerToken : await this.tokenPromise;
            if (bearerToken) {
                const bearerHeader = `Bearer ${typeof bearerToken === 'string' ? bearerToken : bearerToken.token.access_token}`;
                command = {
                    ...command,
                    content: {
                        ...command.content,
                        headers: { ...command.content.headers, ['Authorization']: bearerHeader },
                    },
                };
            }
        }
        return super.sendCommandWithResult({ timelineObjId, context, command });
    }
}
exports.AuthenticatedHTTPSendDevice = AuthenticatedHTTPSendDevice;
//# sourceMappingURL=AuthenticatedHTTPSendDevice.js.map