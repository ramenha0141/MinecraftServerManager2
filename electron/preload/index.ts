import { contextBridge, ipcRenderer } from 'electron';
import type { API, Profiles, VanillaVersion } from '../../src/API';

const api: API = {
    getProfiles: () => ipcRenderer.invoke('getProfiles'),
    setProfiles: (profiles: Profiles) => ipcRenderer.send('setProfiles', profiles),
    openFolder: () => ipcRenderer.invoke('openFolder'),
    isInstalled: (path: string) => ipcRenderer.invoke('isInstalled', path),
    installVanilla: (path: string, version: VanillaVersion) => ipcRenderer.send('installVanilla', path, version)
};

contextBridge.exposeInMainWorld('api', api);
