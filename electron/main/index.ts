/// <reference types="vite/client" />
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { release } from 'os';
import { join } from 'path';

// Disable GPU Acceleration for Windows 7
if (
    release().startsWith('6.1') ||
    import.meta.env.VITE_DISABLE_HARDWARE_ACCELERATION === 'true'
)
    app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

export const ROOT_PATH = {
    // /dist
    dist: join(__dirname, '../..'),
    // /dist or /public
    public: join(__dirname, app.isPackaged ? '../..' : '../../../public')
};

let win: BrowserWindow | null = null;

const createWindow = async () => {
    win = new BrowserWindow({
        title: 'Minecraft Server Manager',
        icon: join(ROOT_PATH.public, 'favicon.svg'),
        show: false,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.removeMenu();

    if (app.isPackaged) {
        win.loadFile(join(ROOT_PATH.dist, 'index.html'));
    } else {
        win.loadURL(
            `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`
        );
        win.webContents.openDevTools();
    }

    win.once('ready-to-show', () => win?.show());

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) shell.openExternal(url);
        return { action: 'deny' };
    });
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    win = null;
    if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
    if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});
