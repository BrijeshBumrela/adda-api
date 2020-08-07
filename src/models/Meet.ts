import User from "./User";

class Meet {
    constructor(private _id: string, private _name: string, private _host: User, private _friends: User[] = []) {}


    private findUser(id: string): User | undefined {
        return this.friends.find(friend => friend.id === id);    
    }

    private findUserBySocketId (socket_id: string): User | undefined {
        return this.friends.find(friend => friend.socket_id === socket_id);
    }

    public addUser(user: User) {
        this.friends = [...this.friends, user];
    }

    public removeUser(id: string) {
        const user = this.findUserBySocketId(id);
        this.friends = this.friends.filter(friend => friend !== user);
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