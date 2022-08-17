import fs from 'fs/promises';
import { join } from 'path';
import { parse, stringify } from './properties';

class ServerController {
    constructor(public readonly path: string) {}
    async getProperties() {
        return parse(await fs.readFile(join(this.path, 'server.properties'), 'utf-8'));
    }
    setProperties(properties: { [key: string]: string }) {
        fs.writeFile(join(this.path, 'server.properties'), stringify(properties));
    }
    dispose() {}
}
export default ServerController;
