import path from 'path';
import fs from 'fs';

import { filesDir, namesFile, sourceFile, targetFile } from '../config.json';

class NameParser {

    private names: Record<string, number> = {};

    private async readWords(filePath: string, reader: (word: string) => void, separator: RegExp | string = '\n'): Promise<void> {
        await fs.promises.access(filePath, fs.constants.R_OK);

        return new Promise((resolve, reject) => {
            const stream: any = fs.createReadStream(filePath);

            let rest: string = '';

            stream.on('data', (data: Buffer) => {
                const chunk: string = rest + data.toString();
                const wordsArray: string[] = chunk.split(separator);

                rest = wordsArray.pop() || '';

                wordsArray.forEach((word: string) => {
                    if (word) {
                        reader(word);
                    }
                });
            });

            stream.on('end', () => {
                const wordsArray: string[] = rest.split(separator);

                wordsArray.forEach((word: string) => {
                    if (word) {
                        reader(word);
                    }
                });

                resolve();
            });
        });
    }

    public async loadNames(fileName: string): Promise<void> {
        const filePath: string = path.resolve(filesDir, fileName);

        this.names = {};
        await this.readWords(filePath, (name: string) => {
            this.names[name] = 0;
        });
    }

    public async countNames(fileName: string): Promise<void> {
        const filePath: string = path.resolve(filesDir, fileName);

        await this.readWords(filePath, (word: string) => {
            const changedWord: string = word.charAt(0) + word.slice(1).toLowerCase();
            if (this.names.hasOwnProperty(changedWord)) {
                this.names[changedWord] = this.names[changedWord] + 1;
            }
        }, /[\.\,]?[\s\t\n]+/);
    }

    public async writeResult(fileName: string): Promise<void> {
        if (Object.keys(this.names).length === 0) {
            throw new Error('Names are not specified');
        }

        const filePath: string = path.resolve(filesDir, fileName);

        try {
            await fs.promises.access(filePath, fs.constants.W_OK);
            await fs.promises.truncate(filePath);
        } catch (e: any) {
            if (e.errno !== -2) {
                throw e;
            }
        }

        const namesArray: { name: string, count: number }[] = [];

        for (const key in this.names) {
            if (this.names.hasOwnProperty(key)) {
                namesArray.push({ name: key, count: this.names[key]});
            }
        }

        const stream: any = fs.createWriteStream(filePath);

        namesArray.sort((item1, item2) => item2.count - item1.count).forEach(({ name, count }, index) => {
            if (index === 0) {
                stream.write(`${name}:${count}`);
            } else {
                stream.write(`\n${name}:${count}`);
            }
        });

        stream.end();
    }
}

(async () => {
    const parser: NameParser = new NameParser();

    await parser.loadNames(namesFile);
    await parser.countNames(sourceFile);
    await parser.writeResult(targetFile);
})();
