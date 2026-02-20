import { TimelineContentTypePanasonicPtz } from 'timeline-state-resolver-types';
import { PanasonicPtzState } from './state';
export interface PanasonicPtzCommand {
    type: TimelineContentTypePanasonicPtz;
    speed?: number;
    preset?: number;
    zoomSpeed?: number;
    zoom?: number;
}
export interface PanasonicPtzCommandWithContext {
    command: PanasonicPtzCommand;
    context: CommandContext;
    timelineObjId: string;
}
type CommandContext = any;
export declare function diffStates(oldPtzState: PanasonicPtzState, newPtzState: PanasonicPtzState): Array<PanasonicPtzCommandWithContext>;
export {};
//# sourceMappingURL=diff.d.ts.map