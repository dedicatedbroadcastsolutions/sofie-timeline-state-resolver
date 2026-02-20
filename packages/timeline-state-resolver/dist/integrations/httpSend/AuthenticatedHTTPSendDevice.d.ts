import { ActionExecutionResult, HTTPSendOptions, SendCommandResult } from 'timeline-state-resolver-types';
import { HTTPSendDevice, HttpSendDeviceCommand } from '.';
export declare class AuthenticatedHTTPSendDevice extends HTTPSendDevice {
    private tokenPromise;
    private tokenRequestPending;
    private authOptions;
    private tokenRefreshTimeout;
    init(options: HTTPSendOptions): Promise<boolean>;
    terminate(): Promise<void>;
    private requestAccessToken;
    private clearTokenRefreshTimeout;
    private scheduleTokenRefresh;
    private refreshAccessToken;
    private makeAccessTokenRequest;
    sendCommandWithResult({ timelineObjId, context, command, }: HttpSendDeviceCommand): Promise<ActionExecutionResult<SendCommandResult>>;
}
//# sourceMappingURL=AuthenticatedHTTPSendDevice.d.ts.map