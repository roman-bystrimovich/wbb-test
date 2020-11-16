import path from 'path';
import fs from 'fs';

import { filesDir } from '../../config.json';

export default (fileName: string) => {
    const file: string = path.resolve(filesDir, fileName);

    if (!fs.existsSync(file)) {
        throw new Error(`File ${fileName} doesn't exist`);
    }

    const names: Record<string, number> = {};

    const textBuffer: Buffer = fs.readFileSync(file);
    const text: string = textBuffer.toString();

    text.split('\n').forEach((line: string) => {
        const [name, count] = line.split(':');
        names[name] = (parseInt(count, 10) as number);
    });

    return names;
};
