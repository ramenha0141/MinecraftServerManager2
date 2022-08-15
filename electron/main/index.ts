/// <reference types="vite/client" />
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import windowStateKeeper from 'electron-window-state';
import { release } from 'os';
import fs from 'fs/promises';
import { join } from 'path';
import { v4 as uuid, validate } from 'uuid';
import type { Profiles } from '../../src/@types/API';

if (
    release().startsWith('6.1') ||
    import.meta.env.VITE_DISABLE_HARDWARE_ACCELERATION === 'true'
)
    app.disableHardwareAcceleration();

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
        win.loadURL(
            `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`
        );
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
    Object.entries(profiles).map(
        ([key, { path }]) => (migratedProfiles[uuid()] = { name: key, path })
    );
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
