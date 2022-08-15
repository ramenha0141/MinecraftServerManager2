import { contextBridge, ipcRenderer } from 'electron';
import type { API, Profiles } from '../../src/API';

const api: API = {
    getProfiles: () => ipcRenderer.invoke('getProfiles'),
    setProfiles: (profiles: Profiles) => ipcRenderer.send('setProfiles', profiles),
    openFolder: () => ipcRenderer.invoke('openFolder'),
    isInstalled: (path: string) => ipcRenderer.invoke(path)
};

contextBridge.exposeInMainWorld('api', api);
