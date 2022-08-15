import { atom } from 'jotai';
import type { Profiles } from './@types/API';

const profilesStateBase = atom(await window.api.getProfiles());
export const profilesState = atom<Profiles, Profiles>(
    (get) => get(profilesStateBase),
    (_, set, value) => {
        set(profilesStateBase, value);
        window.api.setProfiles(value);
    }
);
