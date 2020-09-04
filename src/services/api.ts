import express, { Request, Response } from 'express';
import Meet from '../models/Meet';
import { v4 as uuid4 } from 'uuid';
import utils from '../utils/utils';
import { types as msTypes } from 'mediasoup';
import config from '../config';

export default (meetings: Meet[], workers: msTypes.Worker[]) => {
    const { genRandNumber } = utils(meetings);

    const router = express.Router();

    router.post('/', async (req: Request, res: Response) => {
        const { name } = req.body;
        const meeting = new Meet(uuid4(), name);
        meetings.push(meeting);

        /**
         * Assigning a new router
        */
        const selectedWorker = workers[genRandNumber(workers.length)]
        const router = await selectedWorker.createRouter({ mediaCodecs: config.mediasoup.router.mediaCodecs })
        meeting.router = router;

        return res.status(201).send(meeting.id);
    })

    return { router } 
}