/// <reference types="vite/client" />
import { app, BrowserWindow, shell } from 'electron';
import { release } from 'os';
import { join } from 'path';

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

export const ROOT_PATH = {
    dist: join(__dirname, '../..'),
    public: join(__dirname, app.isPackaged ? '../..' : '../../../public')
};
const appDataPath = join(app.getPath('appData'), 'MinecraftServerManager');

const createWindow = async () => {
    const win = new BrowserWindow({
        title: 'Minecraft Server Manager',
        icon: join(ROOT_PATH.public, 'favicon.svg'),
        show: false,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    if (app.isPackaged) {
        win.loadFile(join(ROOT_PATH.dist, 'index.html'));
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
