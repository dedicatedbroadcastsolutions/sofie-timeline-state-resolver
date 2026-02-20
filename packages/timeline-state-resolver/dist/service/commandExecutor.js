"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandExecutor = void 0;
const _ = require("underscore");
const wait = async (t) => new Promise((r) => setTimeout(() => r(), t));
class CommandExecutor {
    constructor(logger, mode, sendCommand) {
        this.logger = logger;
        this.mode = mode;
        this.sendCommand = sendCommand;
    }
    async executeCommands(commands, measurement) {
        if (commands.length === 0)
            return;
        commands.sort((a, b) => (b.preliminary ?? 0) - (a.preliminary ?? 0));
        const totalTime = commands[0].preliminary ?? 0;
        if (this.mode === 'salvo') {
            return this._executeCommandsSalvo(totalTime, commands, measurement);
        }
        else {
            return this._executeCommandsSequential(totalTime, commands, measurement);
        }
    }
    async _executeCommandsSalvo(totalTime, commands, measurement) {
        await Promise.allSettled(commands.map(async (command) => {
            const timeToWait = totalTime - (command.preliminary ?? 0);
            if (timeToWait > 0)
                await wait(totalTime);
            measurement?.executeCommand(command);
            return this.sendCommand(command).then(() => {
                measurement?.finishedCommandExecution(command);
                return command;
            });
        }));
    }
    async _executeCommandsSequential(totalTime, commands, measurement) {
        const start = Date.now(); // note - would be better to use monotonic time here but BigInt's are annoying
        const commandQueues = _.groupBy(commands || [], (command) => command.queueId ?? '$$default');
        await Promise.allSettled(Object.values(commandQueues).map(async (commandsInQueue) => {
            for (const command of commandsInQueue) {
                const timeToWait = totalTime - (Date.now() - start);
                if (timeToWait > 0)
                    await wait(timeToWait);
                measurement?.executeCommand(command);
                await this.sendCommand(command).catch((e) => {
                    this.logger.error('Error while executing command', e);
                });
                measurement?.finishedCommandExecution(command);
            }
        }));
    }
}
exports.CommandExecutor = CommandExecutor;
//# sourceMappingURL=commandExecutor.js.map