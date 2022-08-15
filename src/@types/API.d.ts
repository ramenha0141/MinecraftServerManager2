export interface Profile {
    name: string;
    path: string;
}

export interface Profiles {
    [id: string]: Profile;
}

export interface API {
    getProfiles: () => Promise<Profiles>;
    setProfiles: (profiles: Profiles) => void;
    openFolder: () => Promise<string | undefined>;
}

declare global {
    interface Window {
        api: API;
    }
}
