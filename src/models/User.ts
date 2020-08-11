import { types as msTypes } from 'mediasoup';

class User {
    private consumers: msTypes.Consumer[] = [];
    private _producer: msTypes.Producer;
    private _produceTransport: msTypes.WebRtcTransport;
    private _consumeTransport: msTypes.WebRtcTransport;


    constructor(
        public id: string, 
        public name: string, 
    ) {}

    get produceTransport() {
        return this._produceTransport;
    }

    set produceTransport(transport: msTypes.WebRtcTransport) {
        this._produceTransport = transport;
    }

    get consumeTransport() {
        return this._consumeTransport;
    }

    set consumeTransport(transport: msTypes.WebRtcTransport) {
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
}

export default User;