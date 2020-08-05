import User from "./User";

class Meet {
    constructor(private _id: string, private _name: string, private _host: User, private _friends: User[]) {}


    private findUser(id: string): User | undefined {
        return this.friends.find(friend => friend.id === id);    
    }

    public addUser(id: string) {
        const user = this.findUser(id);
        if (user instanceof User) this.friends = [...this.friends, user]
    }

    get friends(): User[] {
        return this._friends;
    }

    set friends(friends: User[]) {
        this._friends = friends;
    }

    get id(): string {
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

    set host(host: User) {
        this._host = host;
    }
}

export default Meet;