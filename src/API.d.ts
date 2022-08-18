export interface Profile {
    name: string;
    path: string;
}

export interface Profiles {
    [id: string]: Profile;
}

type VanillaVersion = '1.19.2' | '1.19' | '1.18.2' | '1.17.1' | '1.16.5' | '1.15.2' | '1.14.4' | '1.13.2' | '1.12.2';
type ForgeVersion = `forge${VanillaVersion}`;
export type Version = VanillaVersion | ForgeVersion;

export interface DiscordOptions {
    enabled: boolean;
    webhookURL: string;
    template: string;
}

export interface API {
    openDevtools: () => void;
    getProfiles: () => Promise<Profiles>;
    setProfiles: (profiles: Profiles) => void;
    openFolder: () => Promise<[string, boolean] | undefined>;
    isInstalled: (path: string) => Promise<boolean>;
    getJavaVersion: () => Promise<number>;
    installVanilla: (path: string, version: VanillaVersion) => void;
    getDownloadState: () => Promise<void>;
    getInstallState: () => Promise<void>;
    openProfile: (path: string) => Promise<void>;
    getProperties: () => Promise<{ [key: string]: string }>;
    setProperties: (properties: { [key: string]: string }) => void;
    getDiscordOptions: () => Promise<DiscordOptions>;
    setDiscordOptions: (discordOptions: DiscordOptions) => void;
}

declare global {
    interface Window {
        api: API;
    }
}
