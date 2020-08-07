class User {
    constructor(private _id: string, 
        private _name: string, 
        private _socket_id: string | undefined = undefined
    ) {}

    set socket_id(id: string | undefined) {
        this._socket_id = id;
    }

    get socket_id() {
        return this._socket_id;
    }


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
}

export default User;