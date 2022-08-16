import { atom } from 'jotai';
import type { Profiles } from './API';

const profilesStateBase = atom(async () => await window.api.getProfiles());
export const profilesState = atom<Profiles, Profiles>(
    (get) => get(profilesStateBase),
    (_, set, value) => {
        window.api.setProfiles(value);
    }
);
