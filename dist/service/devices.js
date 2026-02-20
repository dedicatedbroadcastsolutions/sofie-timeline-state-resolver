"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicesDict = void 0;
const osc_1 = require("../integrations/osc");
const timeline_state_resolver_types_1 = require("timeline-state-resolver-types");
const AuthenticatedHTTPSendDevice_1 = require("../integrations/httpSend/AuthenticatedHTTPSendDevice");
const shotoku_1 = require("../integrations/shotoku");
const httpWatcher_1 = require("../integrations/httpWatcher");
const abstract_1 = require("../integrations/abstract");
const atem_1 = require("../integrations/atem");
const tcpSend_1 = require("../integrations/tcpSend");
const hyperdeck_1 = require("../integrations/hyperdeck");
const obs_1 = require("../integrations/obs");
const panasonicPTZ_1 = require("../integrations/panasonicPTZ");
const lawo_1 = require("../integrations/lawo");
const sofieChef_1 = require("../integrations/sofieChef");
const pharos_1 = require("../integrations/pharos");
const telemetrics_1 = require("../integrations/telemetrics");
const tricaster_1 = require("../integrations/tricaster");
const singularLive_1 = require("../integrations/singularLive");
// TODO - move all device implementations here and remove the old Device classes
exports.DevicesDict = {
    [timeline_state_resolver_types_1.DeviceType.ABSTRACT]: {
        deviceClass: abstract_1.AbstractDevice,
        canConnect: false,
        deviceName: (deviceId) => 'Abstract ' + deviceId,
        executionMode: () => 'salvo',
    },
    [timeline_state_resolver_types_1.DeviceType.ATEM]: {
        deviceClass: atem_1.AtemDevice,
        canConnect: true,
        deviceName: (deviceId) => 'Atem ' + deviceId,
        executionMode: () => 'salvo',
    },
    [timeline_state_resolver_types_1.DeviceType.HTTPSEND]: {
        deviceClass: AuthenticatedHTTPSendDevice_1.AuthenticatedHTTPSendDevice,
        canConnect: false,
        deviceName: (deviceId) => 'HTTPSend ' + deviceId,
        executionMode: () => 'sequential', // todo - config?
    },
    [timeline_state_resolver_types_1.DeviceType.HTTPWATCHER]: {
        deviceClass: httpWatcher_1.HTTPWatcherDevice,
        canConnect: false,
        deviceName: (deviceId) => 'HTTP-Watch ' + deviceId,
        executionMode: () => 'sequential',
    },
    [timeline_state_resolver_types_1.DeviceType.HYPERDECK]: {
        deviceClass: hyperdeck_1.HyperdeckDevice,
        canConnect: true,
        deviceName: (deviceId) => 'Hyperdeck ' + deviceId,
        executionMode: () => 'salvo',
    },
    [timeline_state_resolver_types_1.DeviceType.LAWO]: {
        deviceClass: lawo_1.LawoDevice,
        canConnect: true,
        deviceName: (deviceId) => 'Lawo ' + deviceId,
        executionMode: () => 'salvo',
    },
    [timeline_state_resolver_types_1.DeviceType.OBS]: {
        deviceClass: obs_1.OBSDevice,
        canConnect: true,
        deviceName: (deviceId) => 'OBS ' + deviceId,
        executionMode: () => 'salvo',
    },
    [timeline_state_resolver_types_1.DeviceType.OSC]: {
        deviceClass: osc_1.OscDevice,
        canConnect: true,
        deviceName: (deviceId) => 'OSC ' + deviceId,
        executionMode: () => 'salvo',
    },
    [timeline_state_resolver_types_1.DeviceType.PANASONIC_PTZ]: {
        deviceClass: panasonicPTZ_1.PanasonicPtzDevice,
        canConnect: true,
        deviceName: (deviceId) => 'Panasonic PTZ ' + deviceId,
        executionMode: () => 'salvo',
    },
    [timeline_state_resolver_types_1.DeviceType.PHAROS]: {
        deviceClass: pharos_1.PharosDevice,
        canConnect: true,
        deviceName: (deviceId) => 'Pharos ' + deviceId,
        executionMode: () => 'salvo',
    },
    [timeline_state_resolver_types_1.DeviceType.SOFIE_CHEF]: {
        deviceClass: sofieChef_1.SofieChefDevice,
        canConnect: true,
        deviceName: (deviceId) => 'SofieChef ' + deviceId,
        executionMode: () => 'salvo',
    },
    [timeline_state_resolver_types_1.DeviceType.SHOTOKU]: {
        deviceClass: shotoku_1.ShotokuDevice,
        canConnect: true,
        deviceName: (deviceId) => 'SHOTOKU' + deviceId,
        executionMode: () => 'salvo',
    },
    [timeline_state_resolver_types_1.DeviceType.SINGULAR_LIVE]: {
        deviceClass: singularLive_1.SingularLiveDevice,
        canConnect: false,
        deviceName: (deviceId) => 'Singular.Live ' + deviceId,
        executionMode: () => 'sequential',
    },
    [timeline_state_resolver_types_1.DeviceType.TCPSEND]: {
        deviceClass: tcpSend_1.TcpSendDevice,
        canConnect: true,
        deviceName: (deviceId) => 'TCP' + deviceId,
        executionMode: () => 'sequential', // todo: should this be configurable?
    },
    [timeline_state_resolver_types_1.DeviceType.TELEMETRICS]: {
        deviceClass: telemetrics_1.TelemetricsDevice,
        canConnect: true,
        deviceName: (deviceId) => 'Telemetrics ' + deviceId,
        executionMode: () => 'salvo',
    },
    [timeline_state_resolver_types_1.DeviceType.TRICASTER]: {
        deviceClass: tricaster_1.TriCasterDevice,
        canConnect: true,
        deviceName: (deviceId) => 'TriCaster ' + deviceId,
        executionMode: () => 'salvo',
    },
};
//# sourceMappingURL=devices.js.map