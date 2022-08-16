/// <reference types="vite/client" />
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import windowStateKeeper from 'electron-window-state';
import { release } from 'os';
import fs from 'fs/promises';
import { join } from 'path';
import { v4 as uuid, validate } from 'uuid';
import type { Profiles, VanillaVersion } from '../../src/API';
import axios from 'axios';
import type { Readable } from 'stream';
import { createWriteStream } from 'fs';
import util from 'util';
import child_process from 'child_process';
const exec = util.promisify(child_process.exec);

if (release().startsWith('6.1') || import.meta.env.VITE_DISABLE_HARDWARE_ACCELERATION === 'true') app.disableHardwareAcceleration();

if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

export const paths = {
    dist: join(__dirname, '../..'),
    public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
    profiles: join(app.getPath('appData'), app.getName(), 'profiles.json')
};

migrateIfNecessary();

const vanillaVersionURLs: Record<VanillaVersion, string> = {
    '1.19.2': 'https://piston-data.mojang.com/v1/objects/f69c284232d7c7580bd89a5a4931c3581eae1378/server.jar',
    '1.19': 'https://launcher.mojang.com/v1/objects/e00c4052dac1d59a1188b2aa9d5a87113aaf1122/server.jar',
    '1.18.2': 'https://launcher.mojang.com/v1/objects/c8f83c5655308435b3dcf03c06d9fe8740a77469/server.jar',
    '1.17.1': 'https://launcher.mojang.com/v1/objects/a16d67e5807f57fc4e550299cf20226194497dc2/server.jar',
    '1.16.5': 'https://launcher.mojang.com/v1/objects/1b557e7b033b583cd9f66746b7a9ab1ec1673ced/server.jar',
    '1.15.2': 'https://launcher.mojang.com/v1/objects/bb2b6b1aefcd70dfd1892149ac3a215f6c636b07/server.jar',
    '1.14.4': 'https://launcher.mojang.com/v1/objects/3dc3d84a581f14691199cf6831b71ed1296a9fdf/server.jar',
    '1.13.2': 'https://launcher.mojang.com/v1/objects/3737db93722a9e39eeada7c27e7aca28b144ffa7/server.jar',
    '1.12.2': 'https://launcher.mojang.com/v1/objects/886945bfb2b978778c3a0288fd7fab09d315b25f/server.jar'
};

const createWindow = async () => {
    const windowState = windowStateKeeper({});
    const win = new BrowserWindow({
        title: 'Minecraft Server Manager',
        icon: join(paths.public, 'favicon.svg'),
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        show: false,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js')
        }
    });
    if (app.isPackaged) {
        win.loadFile(join(paths.dist, 'index.html'));
    } else {
        win.loadURL(`http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`);
        win.webContents.openDevTools();
    }
    win.removeMenu();
    win.once('ready-to-show', () => win.show());
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) shell.openExternal(url);
        return { action: 'deny' };
    });
    app.on('second-instance', () => {
        if (win.isMinimized()) win.restore();
        win.focus();
    });

    ipcMain.handle('getProfiles', async () => {
        return await getProfiles();
    });
    ipcMain.on('setProfiles', (_, profiles: Profiles) => {
        fs.writeFile(paths.profiles, JSON.stringify(profiles));
    });
    ipcMain.handle('openFolder', async () => {
        const path = (await dialog.showOpenDialog(win, { properties: ['openDirectory'] })).filePaths[0];
        if (!path) return;
        const isEmpty = (await fs.readdir(path)).length === 0;
        return [path, isEmpty];
    });
    ipcMain.handle('isInstalled', async (_, path: string) => await exists(join(path, 'server.properties')));
    ipcMain.on('installVanilla', async (_, path: string, version: VanillaVersion) => {
        (async () => {
            try {
                const { data } = await axios.get<Readable>(vanillaVersionURLs[version], { responseType: 'stream' });
                data.pipe(createWriteStream(join(path, 'server.jar')));
                await new Promise<void>((resolve, reject) => {
                    data.once('end', () => resolve());
                    data.once('error', (e) => reject(e));
                });
                win.webContents.send('downloadState', true);
            } catch (e) {
                win.webContents.send('downloadState', false);
                console.log(e);
                return;
            }
            try {
                await exec(`cd ${path} && java -jar server.jar`);
                await fs.writeFile(join(path, 'eula.txt'), 'eula=true\n');
                win.webContents.send('installState', true);
            } catch (e) {
                win.webContents.send('installState', false);
                console.log(e);
                return;
            }
        })();
    });
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});

async function migrateIfNecessary() {
    const profiles = await getProfiles();
    const key = Object.keys(profiles)[0];
    if (!key || validate(key)) return;
    const migratedProfiles: Profiles = {};
    Object.entries(profiles).map(([key, { path }]) => (migratedProfiles[uuid()] = { name: key, path }));
    fs.writeFile(paths.profiles, JSON.stringify(migratedProfiles));
}
async function getProfiles(): Promise<Profiles> {
    if (!(await exists(paths.profiles))) return {};
    return JSON.parse(await fs.readFile(paths.profiles, 'utf-8'));
}

async function exists(path: string) {
    try {
        await fs.lstat(path);
        return true;
    } catch (e) {
        return false;
    }
}

function createPromise<T>(): [Promise<T>, (value: T) => void, (reason: any) => void] {
    let resolve: (value: T) => void;
    let reject: (reason: any) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return [promise, resolve!, reject!];
}
