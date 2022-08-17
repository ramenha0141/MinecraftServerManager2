import { contextBridge, ipcRenderer } from 'electron';
import type { API, Profiles, VanillaVersion } from '../../src/API';

const api: API = {
    getProfiles: () => ipcRenderer.invoke('getProfiles'),
    setProfiles: (profiles: Profiles) => ipcRenderer.send('setProfiles', profiles),
    openFolder: () => ipcRenderer.invoke('openFolder'),
    isInstalled: (path: string) => ipcRenderer.invoke('isInstalled', path),
    installVanilla: (path: string, version: VanillaVersion) => ipcRenderer.send('installVanilla', path, version),
    getDownloadState: () => new Promise((resolve, reject) => ipcRenderer.once('downloadState', (_, success) => (success ? resolve() : reject()))),
    getInstallState: () => new Promise((resolve, reject) => ipcRenderer.once('installState', (_, success) => (success ? resolve() : reject())))
};

contextBridge.exposeInMainWorld('api', api);
