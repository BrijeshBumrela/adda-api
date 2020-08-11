import { Socket, Server } from "socket.io";
import Meet from "../models/Meet";
import utils from '../utils/utils'
import User from "../models/User";
import msServices from '../services/mediasoup';

export default async (socket: Socket, meetings: Meet[], io: Server) => {
    const { findUserAndMeeting, findMeeting } = utils(meetings);
    const { createWebRTCTransport } = msServices();

    const { name, meetingId }: { name: string; meetingId: string } = socket.handshake.query;

    const user = new User(socket.id, name);
    const meeting = findMeeting(meetingId);

    if (!meeting) throw new Error("Meeting not found");

    meeting.addUser(user);

    socket.join(meeting.id);

    socket.on('getRouterCapabilities', (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!user) throw new Error("User not found")
        if (!meeting) throw new Error("Meeting not found")
        console.log(meeting.router);
        callback(meeting.router.rtpCapabilities);
    })

    socket.on("createProducerTransport", async (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!user) throw new Error("User not found")
        if (!meeting) throw new Error("Meeting not found")
        if (!meeting.router) throw new Error("User is not connected")

        const { params, transport } = await createWebRTCTransport(meeting.router);

        user.produceTransport = transport;
        callback(params);
    })

    socket.on("connectProducerTransport", async (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
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
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!user) throw new Error("User not found")
        if (!meeting) throw new Error("Meeting not found")
        if (!meeting.router) throw new Error("User is not connected")

        const { params, transport } = await createWebRTCTransport(meeting.router);

        user.consumeTransport = transport;
        callback(params);
    })

    socket.on("connectConsumerTransport", async (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
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
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (meeting instanceof Meet) {
            meeting.removeUser(socket.id);

            // Inform all room members about leaving of a member
            io.in(meeting.id).emit("UserUpdated",  meeting.friends.map(friend => ({ name: friend.name, id: friend.id })));
        }
    })

    // Inform all room members about the addition of new member
    io.in(meeting.id).emit("UserUpdated", meeting.friends.map(friend => ({ name: friend.name, id: friend.id })));
}



