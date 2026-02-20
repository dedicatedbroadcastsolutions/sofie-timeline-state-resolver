import { Commands as HyperdeckCommands } from 'hyperdeck-connection';
import type { HyperdeckDeviceState } from './stateBuilder';
export interface HyperdeckCommandWithContext {
    command: HyperdeckCommands.AbstractCommand<any>;
    context: any;
    timelineObjId: string;
}
export declare function diffHyperdeckStates(oldHyperdeckState: HyperdeckDeviceState | undefined, newHyperdeckState: HyperdeckDeviceState, logError: (err: Error) => void): Array<HyperdeckCommandWithContext>;
//# sourceMappingURL=diffState.d.ts.map