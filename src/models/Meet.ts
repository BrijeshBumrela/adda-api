import User from "./User";
import { types as msTypes } from 'mediasoup';

class Meet {
    public _router: msTypes.Router;

    constructor(private _id: string, private _name: string, private _friends: User[] = []) {}


    set router(router: msTypes.Router) {
        this._router = router;
    }

    get router() {
        return this._router;
    }

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
}

export default Meet;