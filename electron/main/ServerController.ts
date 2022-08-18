import fs from 'fs/promises';
import { join } from 'path';
import { exists } from './index';
import { parse, stringify } from './properties';
import type { DiscordOptions } from '../../src/API';

class ServerController {
    constructor(public readonly path: string) {}
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
                    template: 'サーバーが${type}しました。'
                })
            );
        return JSON.parse(await fs.readFile(path, 'utf-8')) as DiscordOptions;
    }
    setDiscordOptions(discordOptions: DiscordOptions) {
        fs.writeFile(join(this.path, 'discord.json'), JSON.stringify(discordOptions));
    }
    dispose() {}
}
export default ServerController;
