"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSofieChefState = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
function buildSofieChefState(timelineState, mappings) {
    const sofieChefState = {
        windows: {},
    };
    for (const [layer, layerState] of Object.entries(timelineState.layers)) {
        const mapping = mappings[layer];
        const content = layerState.content;
        if (mapping && content.deviceType === timeline_state_resolver_types_1.DeviceType.SOFIE_CHEF) {
            sofieChefState.windows[mapping.options.windowId] = {
                url: content.url,
                urlTimelineObjId: layerState.id,
            };
        }
    }
    return sofieChefState;
}
exports.buildSofieChefState = buildSofieChefState;
//# sourceMappingURL=stateBuilder.js.map