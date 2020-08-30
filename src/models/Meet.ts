import User from "./User";
import { types as msTypes } from 'mediasoup';

interface Song {
    id: string,
    name: string,
}

class Meet {
    public _router: msTypes.Router;
    public host: User;
    public songs: Song[] = [];

    constructor(private _id: string, private _name: string, private _friends: User[] = []) {}


    set router(router: msTypes.Router) {
        this._router = router;
    }

    get router() {
        return this._router;
    }

    private findUserBySocketId (socket_id: string): User | undefined {
        return this.friends.find(friend => friend.id === socket_id);
    }

    public addUser(user: User) {
        if (this.friends.length === 0) this.host = user; 
        this.friends = [...this.friends, user];
    }

    public removeUser(id: string) {
        const user = this.findUserBySocketId(id);
        if (this.friends.length === 0) return;
        this.friends = this.friends.filter(friend => friend !== user);
        this.setHost();
    }

    public isHost(user: User) {
        return user.id === (this.host && this.host.id);
    }

    private setHost() {
        if (this.friends.length === 0) return;
        this.host = this.friends[0];
    }

    public nextSong() {
        this.songs.shift();
    }

    public getHost() {
        return this.friends[0];
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