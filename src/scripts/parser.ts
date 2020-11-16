import * as path from 'path';
import * as fs from 'fs';

class NameParser {

    public static filesDir: string = 'files';

    private names: Record<string, number> = {};

    constructor() {}

    private async readWords(file: string, reader: Function, separator: RegExp | string = '\n'): Promise<void> {
        await fs.promises.access(file, fs.constants.R_OK);

        return new Promise((resolve, reject) => {
            const stream: any = fs.createReadStream(file);

            let rest: string = '';

            stream.on('data', (data: Buffer) => {
                const chunk: string = rest + data.toString(); 
                const wordsArray: Array<string> = chunk.split(separator);

                rest = wordsArray.pop() || '';

                wordsArray.forEach((word: string) => {
                    if (word) {
                        reader(word);
                    }
                });
            });

            stream.on('end', () => {
                const wordsArray: Array<string> = rest.split(separator);

                wordsArray.forEach((word: string) => {
                    if (word) {
                        reader(word);
                    }
                });

                resolve();
            });
        });
    }

    public async loadNames(sourceFile: string): Promise<void> {
        const file: string = path.resolve(NameParser.filesDir, sourceFile);

        this.names = {};
        await this.readWords(file, (name: string) => {
            this.names[name] = 0;
        });
    }

    public async countNames(sourceFile: string): Promise<void> {
        const file: string = path.resolve(NameParser.filesDir, sourceFile);

        await this.readWords(file, (word: string) => {
            const changedWord: string = word.charAt(0) + word.slice(1).toLowerCase();
            if (this.names.hasOwnProperty(changedWord)) {
                this.names[changedWord] = this.names[changedWord] + 1;
            }
        }, /[\.\,]?[\s\t\n]+/);
    }

    public async writeResult(targetFile: string): Promise<void> {
        if (Object.keys(this.names).length === 0) {
            throw new Error('Names are not specified');
        }

        const file: string = path.resolve(NameParser.filesDir, targetFile);

        try {
            await fs.promises.access(file, fs.constants.W_OK);
            await fs.promises.truncate(file);
        } catch (e: any) {
            if (e.errno != -2) {
                throw e;
            }
        }

        const stream: any = fs.createWriteStream(file);

        for (let key in this.names) {
            stream.write(`${key}: ${this.names[key]} \n`);
        }

        stream.end();
    }
}

(async () => {
    const parser: NameParser = new NameParser();

    try {
        await parser.loadNames('first-names.txt');
        await parser.countNames('oliver-twist.txt');
        await parser.writeResult('counts.txt');
    } catch(error: any) {
        console.log(error);
    }
})();
