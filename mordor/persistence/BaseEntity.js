export class BaseEntity {

    _persistence;

    constructor(persistence) {
        this._persistence = persistence;
    }

    static _hydrateEntity(entity) {
        return (obj) => {
            Object.keys(obj).forEach(key => entity[key] = obj[key]);
            return entity;
        };
    }

    fill(data) {
        return BaseEntity._hydrateEntity(this)(data);
    }

    async save() {
        const keys = Object.keys(this).filter(key => !key.startsWith('_'));
        let obj = {};
        keys.forEach(key => obj[key] = this[key]);
        return BaseEntity._hydrateEntity(this)(await this._persistence.save(this.constructor.name, obj));
    }

    static async all(persistence) {
        const instance = new this(persistence);
        return (await instance._persistence.all(instance.constructor.name)).map(this._hydrateEntity(new this(persistence)));
    }

    static async allWhere(key, value, persistence) {
        const instance = new this(persistence);
        return (await instance._persistence.allWhere(key, value, instance.constructor.name)).map(this._hydrateEntity(new this(persistence)));
    }

    static async firstWhere(key, value, persistence) {
        const instance = new this(persistence);
        return (await instance._persistence.allWhere(key, value, instance.constructor.name)).map(this._hydrateEntity(new this(persistence)))?.[0] ?? null;
    }

}
