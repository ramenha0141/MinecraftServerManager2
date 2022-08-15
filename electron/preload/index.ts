import { contextBridge, ipcRenderer } from 'electron';
import type { API, Profiles } from '../../src/@types/API';

const api: API = {
    getProfiles: () => ipcRenderer.invoke('getProfiles'),
    setProfiles: (profiles: Profiles) =>
        ipcRenderer.send('setProfiles', profiles)
};

contextBridge.exposeInMainWorld('api', api);
