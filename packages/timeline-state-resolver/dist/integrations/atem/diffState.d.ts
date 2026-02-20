import { Diff } from 'atem-state';
import { DeepComplete } from 'atem-state/dist/util';
import { SomeMappingAtem, Mappings } from 'timeline-state-resolver-types';
/**
  Returns an option object to be passed into AtemState.diffStates().
  Based on the mappings, these options enables/disables certain areas-of-interest in the diff atem state.
*/
export declare function createDiffOptions(mappings: Mappings<SomeMappingAtem>): DeepComplete<Diff.SectionsToDiff>;
//# sourceMappingURL=diffState.d.ts.map