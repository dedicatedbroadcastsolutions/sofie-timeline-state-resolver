import { Mappings, TSRTimelineContent, Timeline } from 'timeline-state-resolver-types';
import { State as DeviceState } from 'atem-state';
export declare class AtemStateBuilder {
    #private;
    static fromTimeline(timelineState: Timeline.StateInTime<TSRTimelineContent>, mappings: Mappings): DeviceState;
    private _isAssignableToNextStyle;
    private _applyMixEffect;
    private _applyDownStreamKeyer;
    private _applySuperSourceBox;
    private _applySuperSourceProperties;
    private _applyAuxilliary;
    private _applyMediaPlayer;
    private _applyAudioChannel;
    private _applyAudioRouting;
    private _applyMacroPlayer;
    private _applyColorGenerator;
}
//# sourceMappingURL=stateBuilder.d.ts.map