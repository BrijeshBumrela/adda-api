import { types as msTypes } from 'mediasoup';

class User {
    private consumers: msTypes.Consumer[] = [];
    private _producer: msTypes.Producer;
    private _produceTransport: msTypes.Transport;
    private _consumeTransport: msTypes.Transport;


    constructor(private _id: string, 
        private _name: string, 
        private _socket_id: string | undefined = undefined
    ) {}

    get produceTransport() {
        return this._produceTransport;
    }

    set produceTransport(transport: msTypes.Transport) {
        this._produceTransport = transport;
    }

    get consumeTransport() {
        return this._consumeTransport;
    }

    set consumeTransport(transport: msTypes.Transport) {
        this._consumeTransport = transport;
    }

    public addConsumer(consumer: msTypes.Consumer) {
        this.consumers.push(consumer);
    }

    public removeConsumer(consumer: msTypes.Consumer) {
        this.consumers = this.consumers.filter(each => each.id !== consumer.id);
    }

    set producer(producer: msTypes.Producer) {
        this._producer = producer
    }

    get producer() {
        return this._producer;
    }

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