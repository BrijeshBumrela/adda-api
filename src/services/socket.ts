import { Socket } from "socket.io";
import Meet from "../models/Meet";
import utils from '../utils/utils'

export default (socket: Socket, meetings: Meet[]) => {
    const { findMeeting, findUserAndMeeting } = utils(meetings);

    const [user, meeting] = findUserAndMeeting(socket.handshake.query.user);

    if (meeting && user) {
        meeting.addUser(user);
        socket.join(meeting.id);
    }

    socket.on('disconnect', () => {
        const [user, meeting] = findUserAndMeeting(socket.id, 'socket_id');
        if (meeting instanceof Meet) meeting.removeUser(socket.id);
    })
}



