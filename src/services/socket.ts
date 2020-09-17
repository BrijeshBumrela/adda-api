import { Socket, Server } from "socket.io";
import Meet from "../models/Meet";
import utils from "../utils/utils";
import User from "../models/User";
import msServices from "../services/mediasoup";
import { types as msTypes } from "mediasoup";

export default async (socket: Socket, meetings: Meet[], io: Server) => {
    const { findUserAndMeeting, findMeeting } = utils(meetings);
    const { createWebRTCTransport, createConsumer } = msServices();

    const {
        name,
        meetingId
    }: { name: string; meetingId: string } = socket.handshake.query;

    const user = new User(socket.id, name);
    const meeting = findMeeting(meetingId);

    if (!meeting) throw new Error("Meeting not found");

    meeting.addUser(user);

    console.log('connected by socket');

    socket.join(meeting.id);

    socket.on("getRouterCapabilities", (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!user) throw new Error("User not found");
        if (!meeting) throw new Error("Meeting not found");
        callback(meeting.router.rtpCapabilities);
    });

    socket.on("createProducerTransport", async (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!user) throw new Error("User not found");
        if (!meeting) throw new Error("Meeting not found");
        if (!meeting.router) throw new Error("User is not connected");

        const { params, transport } = await createWebRTCTransport(
            meeting.router
        );
        user.produceTransport = transport;
        callback(params);
    });

    socket.on("connectProducerTransport", async (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!user) throw new Error("User not found");
        if (!meeting) throw new Error("Meeting not found");
        if (!meeting.router) throw new Error("User is not connected");

        const transport = user.produceTransport;

        try {
            await transport.connect({ dtlsParameters: data.dtlsParameters });
        } catch (e) {
            console.error(e);
        } finally {
            callback();
        }
    });

    socket.on("createConsumerTransport", async (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!user) throw new Error("User not found");
        if (!meeting) throw new Error("Meeting not found");
        if (!meeting.router) throw new Error("User is not connected");

        const { params, transport } = await createWebRTCTransport(
            meeting.router
        );

        user.consumeTransport = transport;
        callback(params);
    });

    socket.on("connectConsumerTransport", async (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!user) throw new Error("User not found");
        if (!meeting) throw new Error("Meeting not found");
        if (!meeting.router) throw new Error("User is not connected");

        const transport = user.consumeTransport;

        try {
            await transport.connect({ dtlsParameters: data.dtlsParameters });
        } catch (e) {
            console.error(e);
        } finally {
            callback();
        }
    });

    socket.on("produce", async (data, callback) => {
        const {
            kind,
            rtpParameters
        }: {
            kind: msTypes.MediaKind;
            rtpParameters: msTypes.RtpParameters;
        } = data;
        const [user, meeting] = findUserAndMeeting(socket.id);

        if (!user) throw new Error("User not found");
        if (!meeting) throw new Error("Meeting not found");
        if (!meeting.router) throw new Error("User is not connected");

        try {
            const producer = await user.produceTransport.produce({
                kind,
                rtpParameters
            });
            user.producer = producer;

            callback({ id: producer.id });

            socket.to(meeting.id).emit("newProducer", {
                socketId: socket.id,
                producerId: producer.id,
                kind
            });
        } catch (e) {
            callback({ error: e.message });
        }
    });

    socket.on("consume", async (data, callback) => {
        const {
            rtpCapabilities,
            userId,
            transportId,
            kind
        }: {
            rtpCapabilities: msTypes.RtpCapabilities;
            userId: string;
            transportId: string;
            kind: msTypes.MediaKind;
        } = data;

        const [user, meeting] = findUserAndMeeting(socket.id);

        if (!user) throw new Error("User not found");
        if (!meeting) throw new Error("Meeting not found");
        if (!meeting.router) throw new Error("User is not connected");

        const producerUser = findUserAndMeeting(userId)[0];

        if (!producerUser)
            throw new Error("Producer for this consumer does not exist");

        const producer = producerUser.producer;
        const router = meeting.router;

        if (!producer) throw new Error("Producer peer is not producing");

        const result = await createConsumer(
            producer,
            rtpCapabilities,
            user.consumeTransport,
            router
        );
        if (!result) throw new Error("Some error occured");

        const { consumer, meta } = result;

        consumer.on("producerpause", async () => {
            await consumer.pause();
            socket
                .to(user.id)
                .emit("consumerPause", { producerId: consumer.producerId });
        });

        consumer.on("producerresume", async () => {
            await consumer.resume();
            socket
                .to(user.id)
                .emit("consumerResume", { producerId: consumer.producerId });
        });

        user.addConsumer(consumer);

        callback(meta);
    });

    socket.on(
        "pauseProducer",
        async ({ producerUserId }: { producerUserId: string }, callback) => {
            const [user, meeting] = findUserAndMeeting(producerUserId);
            if (!user || !meeting) throw new Error("User not found");
            await user.producer.pause();
            callback();
        }
    );

    socket.on(
        "resumeProducer",
        async ({ producerUserId }: { producerUserId: string }, callback) => {
            const [user, meeting] = findUserAndMeeting(producerUserId);
            if (!user || !meeting) throw new Error("User not found");
            await user.producer.resume();
            callback();
        }
    );

    socket.on("resume", async (data, callback) => {
        const {
            consumerId,
            socketId,
            kind
        }: {
            consumerId: string;
            socketId: string;
            kind: msTypes.MediaKind;
        } = data;

        const [user, meeting] = findUserAndMeeting(socket.id);

        if (!user) throw new Error("User not found");
        if (!meeting) throw new Error("Meeting not found");
        if (!meeting.router) throw new Error("User is not connected");

        const producerUser = findUserAndMeeting(socketId)[0];

        if (!producerUser || !producerUser.producer)
            throw new Error("Producer not found");

        const consumer = user.getConsumer(consumerId);
        if (!consumer) throw new Error("Consumer object not found");
        await consumer.resume();

        callback();
    });

    socket.on("disconnect", () => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (meeting instanceof Meet && user instanceof User) {
            const host = meeting.getHost();

            meeting.removeUser(socket.id);

            if (meeting.friends.length == 0) {
                meetings = meetings.filter(each => each.id === meeting.id);
                return;
            }

            const newHost = meeting.getHost();

            if (host.id !== newHost.id) {
                // * Send socket stating the user about becoming the host
                io.in(meeting.id).emit("newHost", { hostId: newHost.id });
            }

            // Inform all room members about leaving of a member
            io.in(meeting.id).emit("UserLeft", { id: user.id });
        }
    });

    socket.on("getusers", (data, callback) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!meeting || !user) throw new Error("Meeting not found");
        const prevUsers = meeting.friends
            .filter(friend => friend.id !== user.id)
            .map(friend => ({ id: friend.id, name: friend.name }));

        callback(prevUsers);
    });

    socket.on("messageSend", (data: string) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!meeting || !user) throw new Error("Meeting not found");
        socket
            .to(meeting.id)
            .emit("messageRecv", { message: data, user: user.name });
    });

    socket.on("pauseSend", () => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!meeting || !user) throw new Error("Meeting not found");

        if (meeting.isHost(user)) {
            socket.to(meeting.id).emit("pauseRecv");
        }
    });

    socket.on("playSend", () => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!meeting || !user) throw new Error("Meeting not found");

        if (meeting.isHost(user)) {
            socket.to(meeting.id).emit("playRecv");
        }
    });

    socket.on("seekSend", (seconds: number) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!meeting || !user) throw new Error("Meeting not found");

        if (meeting.isHost(user)) {
            socket.to(meeting.id).emit("seekRecv", seconds);
        }
    });

    socket.on("nextSend", () => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!meeting || !user) throw new Error("Meeting not found");

        if (meeting.isHost(user)) {
            meeting.nextSong();
            socket.to(meeting.id).emit("nextRecv");
        }
    });

    socket.on("getExistingAudioProducers", (_, cb) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!meeting || !user) throw new Error("Meeting not found");

        const existingProducers = meeting.friends
            .filter(friend => friend.producer && !friend.producer.paused)
            .map(friend => ({ id: friend.id, kind: friend.producer.kind }));
        cb(existingProducers);
    });

    socket.on("queueSend", (songs, cb) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!meeting || !user) throw new Error("Meeting not found");

        meeting.songs = songs;

        socket.to(meeting.id).emit("queueRecv", songs);
    });

    socket.on("queueRecv", (_, cb) => {
        const [user, meeting] = findUserAndMeeting(socket.id);
        if (!meeting || !user) throw new Error("Meeting not found");
        cb(meeting.songs);
    });

    // Inform all room members about the addition of new member
    io.in(meeting.id).emit("UserAdded", { name: user.name, id: user.id });
};
