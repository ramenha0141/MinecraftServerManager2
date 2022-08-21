import fs from 'fs/promises';
import { join } from 'path';
import { exists } from './index';
import { parse, stringify } from './properties';
import type { DiscordOptions } from '../../src/API';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import fetch from 'node-fetch';

class ServerController {
    private discordOptions: DiscordOptions;
    private process?: ChildProcessWithoutNullStreams;
    public isRunning = false;
    constructor(private readonly path: string) {}
    async getProperties() {
        return parse(await fs.readFile(join(this.path, 'server.properties'), 'utf-8'));
    }
    setProperties(properties: { [key: string]: string }) {
        fs.writeFile(join(this.path, 'server.properties'), stringify(properties));
    }
    async getDiscordOptions() {
        const path = join(this.path, 'discord.json');
        if (!(await exists(path)))
            await fs.writeFile(
                path,
                JSON.stringify({
                    enabled: false,
                    webhookURL: '',
                    startTemplate: 'サーバーが開始しました。',
                    stopTemplate: 'サーバーが停止しました。'
                })
            );
        return (this.discordOptions = JSON.parse(await fs.readFile(path, 'utf-8')) as DiscordOptions);
    }
    setDiscordOptions(discordOptions: DiscordOptions) {
        fs.writeFile(join(this.path, 'discord.json'), JSON.stringify((this.discordOptions = discordOptions)));
    }
    async start(callback: (data: string) => void): Promise<boolean> {
        this.process = spawn('java', ['-jar', 'server.jar', '-nogui'], { cwd: this.path });
        this.process.stdout.pipe(process.stdout);
        this.process.stdout.on('data', (data: Buffer) => {
            const str = data.toString();
            callback(str);
        });
        const success = await waitForStartup(this.process);
        if (success && this.discordOptions.enabled) {
            this.notifyDiscord('start');
            this.isRunning = true;
        }
        return success;
    }
    async stop(): Promise<boolean> {
        if (!this.process) return false;
        this.process.stdin.write('stop\n');
        await waitForStop(this.process);
        this.notifyDiscord('stop');
        this.isRunning = false;
        return true;
    }
    notifyDiscord(type: 'start' | 'stop') {
        if (!this.discordOptions.enabled) return;
        fetch(this.discordOptions.webhookURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'MinecraftServerManager',
                content: type === 'start' ? this.discordOptions.startTemplate : this.discordOptions.stopTemplate
            })
        });
    }
    dispose() {
        this.process?.kill();
    }
}
export default ServerController;

const waitForStartup = (process: ChildProcessWithoutNullStreams) => {
    const promise = new Promise<boolean>((resolve) => {
        process.stdout.on('data', (data: string) => {
            if (/Done \(.+?\)! For help, type "help"/.test(data)) {
                resolve(true);
            }
        });
        process.on('close', () => resolve(false));
    });
    return promise;
};
const waitForStop = (process: ChildProcessWithoutNullStreams) => {
    const promise = new Promise<void>((resolve) => {
        process.on('close', () => resolve());
    });
    return promise;
};
