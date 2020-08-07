import os from 'os';
import * as mediasoup from 'mediasoup';
import { types as msTypes } from 'mediasoup';


export default () => {
    const createMsWorkers = async (workers: msTypes.Worker[]) => {
        for (let i = 0; i < os.cpus().length; i++) {
            const worker = await mediasoup.createWorker({
                logLevel: 'debug',
                rtcMinPort: 10000,
                rtcMaxPort: 20100
            })
            worker.appData.routers = {}
            workers.push(worker);
        }
    }

    return { createMsWorkers };
}