import http from 'http';
import express from 'express';
import socket from 'socket.io';
import Meet from './models/Meet';
import socketService from './services/socket';
import bodyParser from 'body-parser';
import { types as msTypes } from 'mediasoup';
import msServices from './services/mediasoup';
import apiServices from './services/api';
import cors from 'cors';
import config from './config';

const app = express()
const server = http.createServer(app);
const io = socket(server);

server.listen(8000);
app.use(bodyParser.json());
app.use(cors());

// List of meetings that are currently going on
const meetings: Meet[] = [];

const tempMeeting = new Meet('8ebc7dcb-e660-47d7-9f51-0b0483382f9a', 'something');
meetings.push(tempMeeting)

// List of workers used by mediasoup to create the routers(rooms)
const workers: msTypes.Worker[] = [];


const { createMsWorkers } = msServices();
const { router: apiRouter } = apiServices(meetings, workers);

app.use(apiRouter)

io.on('connection', socket => socketService(socket, meetings, io))

const somebullshit = async () => {
    // 4ac8423a-4f11-47e8-abfe-0dcc1e46dc09
    await createMsWorkers(workers);
    const meeting = new Meet("4ac8423a-4f11-47e8-abfe-0dcc1e46dc09", "my meet");
    meetings.push(meeting);

    const selectedWorker = workers[0]
    const router = await selectedWorker.createRouter({ mediaCodecs: config.mediasoup.router.mediaCodecs })
    meeting.router = router;
}

somebullshit()