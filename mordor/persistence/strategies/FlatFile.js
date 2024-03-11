import { exists, writeFile, readFile, mkdir, readdir } from "node:fs/promises";

export class FlatFile {
    directory;
    prettyPrint;

    constructor(directory, prettyPrint = false) {
        this.directory = directory;
        this.prettyPrint = prettyPrint;
    }

    _filepath(entity) {
        return `${this.directory}/${entity}.json`;
    }

    async _reset() {
        const files = await readdir(this.directory);
        files.forEach(async file => await writeFile(`${this.directory}/${file}`, JSON.stringify([])));
    }

    async _load(entity) {
        return JSON.parse(await readFile(this._filepath(entity)));
    }

    async _store(entity, entities) {
        await writeFile(this._filepath(entity), JSON.stringify(entities, null, this.prettyPrint ? 2 : undefined));
    }

    async ensureEntity(entity) {
        if(!(await exists(this._filepath(entity)))) {
            await mkdir(this.directory, {
                recursive: true,
            });
            await writeFile(this._filepath(entity), JSON.stringify([]));
        }
    }

    async save(entity, obj) {
        await this.ensureEntity(entity);
        let entities = await this._load(entity);
        let found = false;
        entities = entities.map(each => {
            if(each.id !== obj.id) {
                return each;
            }
            found = true;
            return {
                ...each,
                ...obj,
            };
        });
        if(!found) {
            entities.push(obj);
        }
        await this._store(entity, entities);
        return obj;
    }

    async all(entity) {
        this.ensureEntity(entity);
        return await this._load(entity);
    }

    async allWhere(key, value, entity) {
        return (await this.all(entity)).filter(each => each[key] === value);
    }

}
