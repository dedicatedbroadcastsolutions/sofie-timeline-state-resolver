import { DeviceType } from 'timeline-state-resolver-types';
import { Device, DeviceContextAPI } from './device';
export interface DeviceEntry {
    deviceClass: new (context: DeviceContextAPI<any>) => Device<any, any, any>;
    canConnect: boolean;
    deviceName: (deviceId: string, options: any) => string;
    executionMode: (options: any) => 'salvo' | 'sequential';
}
export type ImplementedServiceDeviceTypes = DeviceType.ABSTRACT | DeviceType.ATEM | DeviceType.HTTPSEND | DeviceType.HTTPWATCHER | DeviceType.HYPERDECK | DeviceType.LAWO | DeviceType.OBS | DeviceType.OSC | DeviceType.PANASONIC_PTZ | DeviceType.PHAROS | DeviceType.SHOTOKU | DeviceType.SINGULAR_LIVE | DeviceType.SOFIE_CHEF | DeviceType.TCPSEND | DeviceType.TELEMETRICS | DeviceType.TRICASTER;
export declare const DevicesDict: Record<ImplementedServiceDeviceTypes, DeviceEntry>;
//# sourceMappingURL=devices.d.ts.map