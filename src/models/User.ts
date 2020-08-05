class User {
    constructor(private _id: string, private _name: string, private _host: boolean = false) {}

    get id() {
        return this._id;
    }

    set id(id: string) {
        this._id = id;
    }

    get name() {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    get host() {
        return this._host;
    }

    set host(host: boolean) {
        this._host = host;
    }
}

export default User;