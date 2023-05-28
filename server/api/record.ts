import { readdirSync, createReadStream } from 'node:fs';
import * as readline from 'node:readline'
const config = useRuntimeConfig()

interface Symbol {
    code: string;
    name: string;
}

interface Thatday {
    name: string
    formated: string
    symbols: Symbol[]
}

export default defineEventHandler(async (event: any) => {
    const records: Thatday[] = [];
    const dirs = readdirSync(config.datasourcePath);
    for (const dir of dirs) {
      if (dir.match(/[0-9]{8}/)) {
        const formated = `${dir.substring(0,4)}年${dir.substring(4,6)}月${dir.substring(6,8)}日`
        const thatday: Thatday = <Thatday>{name: dir, formated: formated, symbols: []};
        const files = readdirSync(`${config.datasourcePath}/${dir}`);
        for (const file of files) {
            if (file.match(/\.json$/)) {
                const stream = createReadStream(`${config.datasourcePath}/${dir}/${file}`, "utf-8");
                const reader = readline.createInterface({ input: stream });
                const p: Promise<any> = new Promise((resolve, reject) => {
                    reader.once("line", (input) => {
                        resolve(input);
                        reader.close();
                        stream.destroy();
                    });
                });
                const tick = await p.then((result) => {
                    return JSON.parse(result);
                })
                thatday.symbols.push(<Symbol>{
                    code: file.replace(/\.json$/, ""),
                    name: tick.SymbolName
                })
            }
        }
        records.push(thatday);
      }
    }
    return { records };
});
