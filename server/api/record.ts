import { readdirSync } from 'node:fs';
const config = useRuntimeConfig()

interface File {
    name: string
}

interface Directory {
    name: string
    files: File[]
}

export default defineEventHandler(async (event: any) => {
    const records: Directory[] = [];
    const dirs = readdirSync(config.datasourcePath);
    for (const dir of dirs) {
      if (dir.match(/[0-9]{8}/)) {
        const thatday: Directory = <Directory>{name: dir, files: []};
        const files = readdirSync(`${config.datasourcePath}/${dir}`);
        files.forEach(file => {
            if (file.match(/\.json$/)) {
                thatday.files.push(<File>{
                    name: file.replace(/\.json$/, "")
                })
            }
        })
        records.push(thatday);
      }
    }
    return { records };
});
