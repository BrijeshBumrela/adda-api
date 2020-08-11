import http from 'http';
import express from 'express';
import socket from 'socket.io';
import Meet from './models/Meet';
import socketService from './services/socket';
import bodyParser from 'body-parser';
import { types as msTypes } from 'mediasoup';
import msServices from './services/mediasoup';
import apiServices from './services/api';

const app = express()
const server = http.createServer(app);
const io = socket(server);

server.listen(8000);
app.use(bodyParser.json());

// List of meetings that are currently going on
const meetings: Meet[] = [];

// List of workers used by mediasoup to create the routers(rooms)
const workers: msTypes.Worker[] = [];


const { createMsWorkers } = msServices();
const { router: apiRouter } = apiServices(meetings, workers);

app.use(apiRouter)
createMsWorkers(workers);

io.on('connection', socket => socketService(socket, meetings, workers))