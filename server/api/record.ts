import { readdirSync, readFileSync } from 'node:fs';
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
        files.forEach(file => {
            if (file.match(/\.json$/)) {
                const content = readFileSync(`${config.datasourcePath}/${dir}/${file}`, "utf-8");
                const tick = JSON.parse(content.split(/\n/)[0]);
                thatday.symbols.push(<Symbol>{
                    code: file.replace(/\.json$/, ""),
                    name: tick.SymbolName
                })
            }
        })
        records.push(thatday);
      }
    }
    return { records };
});
