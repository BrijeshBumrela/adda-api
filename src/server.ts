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

const meetings: Meet[] = [];
const workers: msTypes.Worker[] = [];


const { createMsWorkers } = msServices();
const { routes } = apiServices(meetings);

app.use('/', routes);

createMsWorkers(workers);

io.on('connection', socket => socketService(socket, meetings))




