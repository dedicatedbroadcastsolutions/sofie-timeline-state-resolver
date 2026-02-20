/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class SisyfosApi extends EventEmitter {
    private _oscClient;
    private _state?;
    private _labelToChannel;
    private _connectivityCheckInterval;
    private _pingCounter;
    private _connectivityTimeout;
    private _connected;
    private _mixerOnline;
    /**
     * Connnects to the OSC server.
     * @param host ip to connect to
     * @param port port the osc server is hosted on
     */
    connect(host: string, port: number): Promise<void>;
    dispose(): void;
    send(command: SisyfosCommand): void;
    disconnect(): void;
    isInitialized(): boolean;
    reInitialize(): void;
    getChannelByLabel(label: string): number | undefined;
    get connected(): boolean;
    get state(): SisyfosAPIState | undefined;
    get mixerOnline(): boolean;
    setMixerOnline(state: boolean): void;
    private _monitorConnectivity;
    private _clearPingTimer;
    private receiver;
    private updateIsConnected;
    private parseChannelCommand;
    private parseSisyfosState;
}
export declare enum SisyfosCommandType {
    TOGGLE_PGM = "togglePgm",
    TOGGLE_PST = "togglePst",
    SET_FADER = "setFader",
    CLEAR_PST_ROW = "clearPstRow",
    LABEL = "label",
    TAKE = "take",
    VISIBLE = "visible",
    RESYNC = "resync",
    SET_CHANNEL = "setChannel"
}
export interface BaseCommand {
    type: SisyfosCommandType;
}
export interface SetChannelCommand {
    type: SisyfosCommandType.SET_CHANNEL;
    channel: number;
    values: Partial<SisyfosAPIChannel>;
}
export interface ChannelCommand extends BaseCommand {
    type: SisyfosCommandType.SET_FADER | SisyfosCommandType.TOGGLE_PGM | SisyfosCommandType.TOGGLE_PST | SisyfosCommandType.LABEL | SisyfosCommandType.VISIBLE;
    channel: number;
}
export interface GlobalCommand extends BaseCommand {
    type: SisyfosCommandType.CLEAR_PST_ROW | SisyfosCommandType.TAKE | SisyfosCommandType.RESYNC;
}
export interface BoolCommand extends ChannelCommand {
    type: SisyfosCommandType.VISIBLE;
    value: boolean;
}
export interface ValueCommand extends ChannelCommand {
    type: SisyfosCommandType.TOGGLE_PST | SisyfosCommandType.VISIBLE;
    value: number;
}
export interface ValuesCommand extends ChannelCommand {
    type: SisyfosCommandType.TOGGLE_PGM | SisyfosCommandType.SET_FADER;
    values: number[];
}
export interface StringCommand extends ChannelCommand {
    type: SisyfosCommandType.LABEL;
    value: string;
}
export type SisyfosCommand = GlobalCommand | ValueCommand | ValuesCommand | BoolCommand | StringCommand | SetChannelCommand;
export interface SisyfosChannel extends SisyfosAPIChannel {
    timelineObjIds: string[];
}
export interface SisyfosState {
    channels: {
        [index: string]: SisyfosChannel;
    };
    resync: boolean;
    triggerValue?: string;
}
export interface SisyfosAPIChannel {
    faderLevel: number;
    pgmOn: number;
    pstOn: number;
    label: string;
    visible: boolean;
    fadeTime?: number;
}
export interface SisyfosAPIState {
    channels: {
        [index: string]: SisyfosAPIChannel;
    };
}
//# sourceMappingURL=connection.d.ts.map