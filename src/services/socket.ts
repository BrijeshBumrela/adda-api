import { Socket } from "socket.io";
import Meet from "../models/Meet";
import utils from '../utils/utils'
import User from "../models/User";
import { v4 as uuid4 } from 'uuid';
import { types as msTypes } from 'mediasoup';
import config from "../config";

export default async (socket: Socket, meetings: Meet[], workers: msTypes.Worker[]) => {
    const { findUserAndMeeting, findMeeting, genRandNumber } = utils(meetings);

    const { name, 
        meetName, 
        isHost, 
        meetingId 
    }: { name: string; 
        meetName?: string; 
        isHost?: boolean; 
        meetingId: string 
    } = socket.handshake.query;



    const user = new User(uuid4(), name);
    let meeting: Meet;

    if (meetName && isHost) {
        /**
         * Create a new meeting
        */
        meeting = new Meet(uuid4(), meetName, user);

        /**
         * Assigning a new router
        */
        const selectedWorker = workers[genRandNumber(workers)]
        const router = await selectedWorker.createRouter({ mediaCodecs: config.mediasoup.router.mediaCodecs })
        meeting.router = router;


    } else {
        const getMeeting = findMeeting(meetingId);
        if (!getMeeting) throw new Error("Meeting not found")
        meeting = getMeeting;
        meeting.addUser(user);
    }

    socket.join(meeting.id);

    socket.on('getRouterCapabilities', (data, callback) => {

    })


    socket.on('disconnect', () => {
        const [user, meeting] = findUserAndMeeting(socket.id, 'socket_id');
        if (meeting instanceof Meet) meeting.removeUser(socket.id);
    })
}



