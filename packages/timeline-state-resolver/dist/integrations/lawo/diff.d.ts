import { EmberValue } from 'timeline-state-resolver-types';
import { LawoState } from './state';
import { Model as EmberModel } from 'emberplus-connection';
export interface LawoCommandWithContext {
    command: LawoCommand;
    context: string;
    timelineObjId: string;
    preliminary?: number;
}
export declare enum LawoCommandType {
    FaderRamp = "FaderRamp",
    SetValue = "SetValue"
}
export type LawoCommand = LawoFaderRampCommand | LawoSetValueCommand;
export interface LawoFaderRampCommand {
    type: LawoCommandType.FaderRamp;
    identifier: string;
    value: EmberValue;
    transitionDuration?: number;
    from?: EmberValue;
    priority: number;
}
export interface LawoSetValueCommand {
    type: LawoCommandType.SetValue;
    identifier: string;
    value: EmberValue;
    valueType?: EmberModel.ParameterType;
    priority: number;
}
export declare function diffLawoStates(oldState: LawoState | undefined, newState: LawoState): LawoCommandWithContext[];
//# sourceMappingURL=diff.d.ts.map