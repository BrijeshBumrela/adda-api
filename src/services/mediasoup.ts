import os from 'os';
import * as mediasoup from 'mediasoup';
import { types as msTypes } from 'mediasoup';
import config from '../config';


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

    const createWebRTCTransport = async (router: msTypes.Router) => {
        const { maxIncomingBitrate, initialAvailableOutgoingBitrate } = config.mediasoup.webRtcTransport;

        const transport = await router.createWebRtcTransport({
            listenIps: config.mediasoup.webRtcTransport.listenIps,
            enableUdp: true
        })

        if (maxIncomingBitrate) {
            await transport.setMaxIncomingBitrate(maxIncomingBitrate);
        }

        const { iceParameters, iceCandidates, dtlsParameters } = transport;

        return {
            params: {
                id: transport.id,
                iceParameters,
                iceCandidates,
                dtlsParameters
            }, 
            transport
        }
    }

    return { createMsWorkers, createWebRTCTransport };
}