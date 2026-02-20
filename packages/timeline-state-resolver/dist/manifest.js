"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifest = void 0;
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const AbstractActions = require("./$schemas/generated/abstract/actions.json");
const AbstractOptions = require("./$schemas/generated/abstract/options.json");
const AbstractMappings = require("./$schemas/generated/abstract/mappings.json");
const AtemActions = require("./$schemas/generated/atem/actions.json");
const AtemOptions = require("./$schemas/generated/atem/options.json");
const AtemMappings = require("./$schemas/generated/atem/mappings.json");
const CasparCGActions = require("./$schemas/generated/casparCG/actions.json");
const CasparCGOptions = require("./$schemas/generated/casparCG/options.json");
const CasparCGMappings = require("./$schemas/generated/casparCG/mappings.json");
const HTTPSendOptions = require("./$schemas/generated/httpSend/options.json");
const HTTPSendMappings = require("./$schemas/generated/httpSend/mappings.json");
const HTTPWatcherOptions = require("./$schemas/generated/httpWatcher/options.json");
const HTTPWatcherMappings = require("./$schemas/generated/httpWatcher/mappings.json");
const HyperdeckActions = require("./$schemas/generated/hyperdeck/actions.json");
const HyperdeckOptions = require("./$schemas/generated/hyperdeck/options.json");
const HyperdeckMappings = require("./$schemas/generated/hyperdeck/mappings.json");
const LawoOptions = require("./$schemas/generated/lawo/options.json");
const LawoMappings = require("./$schemas/generated/lawo/mappings.json");
const MultiOSCOptions = require("./$schemas/generated/multiOsc/options.json");
const MultiOSCMappings = require("./$schemas/generated/multiOsc/mappings.json");
const OBSOptions = require("./$schemas/generated/obs/options.json");
const OBSMappings = require("./$schemas/generated/obs/mappings.json");
const OSCOptions = require("./$schemas/generated/osc/options.json");
const OSCMappings = require("./$schemas/generated/osc/mappings.json");
const PanasonicPTZOptions = require("./$schemas/generated/panasonicPTZ/options.json");
const PanasonicPTZMappings = require("./$schemas/generated/panasonicPTZ/mappings.json");
const PharosOptions = require("./$schemas/generated/pharos/options.json");
const PharosMappings = require("./$schemas/generated/pharos/mappings.json");
const QuantelActions = require("./$schemas/generated/quantel/actions.json");
const QuantelOptions = require("./$schemas/generated/quantel/options.json");
const QuantelMappings = require("./$schemas/generated/quantel/mappings.json");
const ShotokuOptions = require("./$schemas/generated/shotoku/options.json");
const ShotokuMappings = require("./$schemas/generated/shotoku/mappings.json");
const SingularLiveOptions = require("./$schemas/generated/singularLive/options.json");
const SingularLiveMappings = require("./$schemas/generated/singularLive/mappings.json");
const SisyfosOptions = require("./$schemas/generated/sisyfos/options.json");
const SisyfosMappings = require("./$schemas/generated/sisyfos/mappings.json");
const SofieChefOptions = require("./$schemas/generated/sofieChef/options.json");
const SofieChefMappings = require("./$schemas/generated/sofieChef/mappings.json");
const TCPSendOptions = require("./$schemas/generated/tcpSend/options.json");
const TCPSendMappings = require("./$schemas/generated/tcpSend/mappings.json");
const TelemetricsOptions = require("./$schemas/generated/telemetrics/options.json");
const TelemetricsMappings = require("./$schemas/generated/telemetrics/mappings.json");
const TricasterOptions = require("./$schemas/generated/tricaster/options.json");
const TricasterMappings = require("./$schemas/generated/tricaster/mappings.json");
const HttpSendActions = require("./$schemas/generated/httpSend/actions.json");
const PharosActions = require("./$schemas/generated/pharos/actions.json");
const TcpSendActions = require("./$schemas/generated/tcpSend/actions.json");
const VizMSEActions = require("./$schemas/generated/vizMSE/actions.json");
const VizMSEOptions = require("./$schemas/generated/vizMSE/options.json");
const VizMSEMappings = require("./$schemas/generated/vizMSE/mappings.json");
const VMixOptions = require("./$schemas/generated/vmix/options.json");
const VMixMappings = require("./$schemas/generated/vmix/mappings.json");
const VMixActions = require("./$schemas/generated/vmix/actions.json");
const CommonOptions = require("./$schemas/common-options.json");
const lib_1 = require("./lib");
const stringifyActionSchema = (action) => ({
    ...action,
    payload: JSON.stringify(action.payload),
});
const stringifyMappingSchema = (schema) => Object.fromEntries(Object.entries(schema.mappings).map(([id, sch]) => [id, JSON.stringify(sch)]));
exports.manifest = {
    commonOptions: JSON.stringify(CommonOptions),
    subdevices: {
        [timeline_state_resolver_types_1.DeviceType.ABSTRACT]: {
            displayName: (0, lib_1.generateTranslation)('Abstract'),
            actions: AbstractActions.actions.map(stringifyActionSchema),
            configSchema: JSON.stringify(AbstractOptions),
            mappingsSchemas: stringifyMappingSchema(AbstractMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.ATEM]: {
            displayName: (0, lib_1.generateTranslation)('Blackmagic ATEM'),
            actions: AtemActions.actions.map(stringifyActionSchema),
            configSchema: JSON.stringify(AtemOptions),
            mappingsSchemas: stringifyMappingSchema(AtemMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.CASPARCG]: {
            displayName: (0, lib_1.generateTranslation)('CasparCG'),
            actions: CasparCGActions.actions.map(stringifyActionSchema),
            configSchema: JSON.stringify(CasparCGOptions),
            mappingsSchemas: stringifyMappingSchema(CasparCGMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.HTTPSEND]: {
            displayName: (0, lib_1.generateTranslation)('HTTP Send'),
            actions: HttpSendActions.actions.map(stringifyActionSchema),
            configSchema: JSON.stringify(HTTPSendOptions),
            mappingsSchemas: stringifyMappingSchema(HTTPSendMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.HTTPWATCHER]: {
            displayName: (0, lib_1.generateTranslation)('HTTP Watcher'),
            configSchema: JSON.stringify(HTTPWatcherOptions),
            mappingsSchemas: stringifyMappingSchema(HTTPWatcherMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.HYPERDECK]: {
            displayName: (0, lib_1.generateTranslation)('Blackmagic Hyperdeck'),
            actions: HyperdeckActions.actions.map(stringifyActionSchema),
            configSchema: JSON.stringify(HyperdeckOptions),
            mappingsSchemas: stringifyMappingSchema(HyperdeckMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.LAWO]: {
            displayName: (0, lib_1.generateTranslation)('Lawo'),
            configSchema: JSON.stringify(LawoOptions),
            mappingsSchemas: stringifyMappingSchema(LawoMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.MULTI_OSC]: {
            displayName: (0, lib_1.generateTranslation)('Multi OSC'),
            configSchema: JSON.stringify(MultiOSCOptions),
            mappingsSchemas: stringifyMappingSchema(MultiOSCMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.OBS]: {
            displayName: (0, lib_1.generateTranslation)('OBS Studio'),
            configSchema: JSON.stringify(OBSOptions),
            mappingsSchemas: stringifyMappingSchema(OBSMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.OSC]: {
            displayName: (0, lib_1.generateTranslation)('OSC'),
            configSchema: JSON.stringify(OSCOptions),
            mappingsSchemas: stringifyMappingSchema(OSCMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.PANASONIC_PTZ]: {
            displayName: (0, lib_1.generateTranslation)('Panasonic PTZ'),
            configSchema: JSON.stringify(PanasonicPTZOptions),
            mappingsSchemas: stringifyMappingSchema(PanasonicPTZMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.PHAROS]: {
            displayName: (0, lib_1.generateTranslation)('Pharos'),
            actions: PharosActions.actions.map(stringifyActionSchema),
            configSchema: JSON.stringify(PharosOptions),
            mappingsSchemas: stringifyMappingSchema(PharosMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.QUANTEL]: {
            displayName: (0, lib_1.generateTranslation)('Quantel'),
            actions: QuantelActions.actions.map(stringifyActionSchema),
            configSchema: JSON.stringify(QuantelOptions),
            mappingsSchemas: stringifyMappingSchema(QuantelMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.SHOTOKU]: {
            displayName: (0, lib_1.generateTranslation)('Shotoku'),
            configSchema: JSON.stringify(ShotokuOptions),
            mappingsSchemas: stringifyMappingSchema(ShotokuMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.SINGULAR_LIVE]: {
            displayName: (0, lib_1.generateTranslation)('Singular Live'),
            configSchema: JSON.stringify(SingularLiveOptions),
            mappingsSchemas: stringifyMappingSchema(SingularLiveMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.SISYFOS]: {
            displayName: (0, lib_1.generateTranslation)('Sisyfos'),
            configSchema: JSON.stringify(SisyfosOptions),
            mappingsSchemas: stringifyMappingSchema(SisyfosMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.SOFIE_CHEF]: {
            displayName: (0, lib_1.generateTranslation)('Sofie Chef'),
            configSchema: JSON.stringify(SofieChefOptions),
            mappingsSchemas: stringifyMappingSchema(SofieChefMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.TCPSEND]: {
            displayName: (0, lib_1.generateTranslation)('TCP Send'),
            actions: TcpSendActions.actions.map(stringifyActionSchema),
            configSchema: JSON.stringify(TCPSendOptions),
            mappingsSchemas: stringifyMappingSchema(TCPSendMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.TELEMETRICS]: {
            displayName: (0, lib_1.generateTranslation)('Telemetrics'),
            configSchema: JSON.stringify(TelemetricsOptions),
            mappingsSchemas: stringifyMappingSchema(TelemetricsMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.TRICASTER]: {
            displayName: (0, lib_1.generateTranslation)('Tricaster'),
            configSchema: JSON.stringify(TricasterOptions),
            mappingsSchemas: stringifyMappingSchema(TricasterMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.VIZMSE]: {
            displayName: (0, lib_1.generateTranslation)('Viz MSE'),
            actions: VizMSEActions.actions.map(stringifyActionSchema),
            configSchema: JSON.stringify(VizMSEOptions),
            mappingsSchemas: stringifyMappingSchema(VizMSEMappings),
        },
        [timeline_state_resolver_types_1.DeviceType.VMIX]: {
            displayName: (0, lib_1.generateTranslation)('VMix'),
            actions: VMixActions.actions.map(stringifyActionSchema),
            configSchema: JSON.stringify(VMixOptions),
            mappingsSchemas: stringifyMappingSchema(VMixMappings),
        },
    },
};
//# sourceMappingURL=manifest.js.map