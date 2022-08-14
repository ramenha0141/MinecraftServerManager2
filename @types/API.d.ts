export interface Profile {
    name: string;
    path: string;
}

export interface Profiles {
    [id: string]: Profile;
}

export interface API {
    getProfile: () => Profiles;
    openProfile: (profileId: string) => void;
}

declare global {
    interface Window {
        API: API;
    }
}
