import { Socket } from "socket.io";
import Meet from "../models/Meet";
import utils from '../utils/utils'
import User from "../models/User";
import { v4 as uuid4 } from 'uuid';
import msServices from '../services/mediasoup';

export default async (socket: Socket, meetings: Meet[]) => {
    const { findUserAndMeeting, findMeeting } = utils(meetings);
    const { createWebRTCTransport } = msServices();

    const { name, meetingId }: { name: string; meetingId: string } = socket.handshake.query;

    const user = new User(uuid4(), name);
    const meeting = findMeeting(meetingId);

    if (!meeting) throw new Error("Meeting not found");

    meeting.addUser(user);

    socket.join(meeting.id);

    socket.on('getRouterCapabilities', (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id, 'socket_id');
        if (!user) throw new Error("User not found")
        if (!meeting) throw new Error("Meeting not found")
        callback(meeting.router.rtpCapabilities);
    })

    socket.on("createProducerTransport", async (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id, 'socket_id');
        if (!user) throw new Error("User not found")
        if (!meeting) throw new Error("Meeting not found")
        if (!meeting.router) throw new Error("User is not connected")

        const { params, transport } = await createWebRTCTransport(meeting.router);

        user.produceTransport = transport;
        callback(params);
    })

    socket.on("connectProducerTransport", async (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id, 'socket_id');
        if (!user) throw new Error("User not found")
        if (!meeting) throw new Error("Meeting not found")
        if (!meeting.router) throw new Error("User is not connected")

        const transport = user.produceTransport;

        try {
            await transport.connect({ dtlsParameters: data.dtlsParameters })
        } catch(e) {
            console.error(e);
        } finally {
            callback();
        }
    })

    socket.on("createConsumerTransport", async (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id, 'socket_id');
        if (!user) throw new Error("User not found")
        if (!meeting) throw new Error("Meeting not found")
        if (!meeting.router) throw new Error("User is not connected")

        const { params, transport } = await createWebRTCTransport(meeting.router);

        user.consumeTransport = transport;
        callback(params);
    })

    socket.on("connectConsumerTransport", async (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id, 'socket_id');
        if (!user) throw new Error("User not found")
        if (!meeting) throw new Error("Meeting not found")
        if (!meeting.router) throw new Error("User is not connected")

        const transport = user.consumeTransport;

        try {
            await transport.connect({ dtlsParameters: data.dtlsParameters })
        } catch(e) {
            console.error(e);
        } finally {
            callback();
        }
    })

    socket.on('disconnect', () => {
        const [user, meeting] = findUserAndMeeting(socket.id, 'socket_id');
        if (meeting instanceof Meet) {
            meeting.removeUser(socket.id);
            socket.to(meeting.id).emit("UserUpdated", meeting.friends);
        }
    })

    socket.to(meeting.id).emit("UserUpdated", meeting.friends);
}



