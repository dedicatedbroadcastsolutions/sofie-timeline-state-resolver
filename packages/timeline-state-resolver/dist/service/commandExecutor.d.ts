import { BaseDeviceAPI, CommandWithContext } from './device';
import { Measurement } from './measure';
import { StateHandlerContext } from './stateHandler';
export declare class CommandExecutor<DeviceState, Command extends CommandWithContext> {
    private logger;
    private mode;
    private sendCommand;
    constructor(logger: StateHandlerContext['logger'], mode: 'salvo' | 'sequential', sendCommand: BaseDeviceAPI<DeviceState, Command>['sendCommand']);
    executeCommands(commands: Command[], measurement?: Measurement): Promise<void>;
    private _executeCommandsSalvo;
    private _executeCommandsSequential;
}
//# sourceMappingURL=commandExecutor.d.ts.map