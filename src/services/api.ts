import Meet from "../models/Meet";
import { v4 as uuid4 } from 'uuid';
import User from "../models/User";
import utils from "../utils/utils";
import express from 'express'


const routes = express.Router();


export default (meetings: Meet[]) => {
    const { findMeeting } = utils(meetings);

    routes.post('/create', (req, res) => {
        const { name, meetName }: { name: string; meetName: string } = req.body;

        const hostuser = new User(uuid4(), name);
        const meeting = new Meet(uuid4(), meetName, hostuser);
        meetings.push(meeting);

        return res.status(201).json({
            meeting_id: meeting.id,
            user: hostuser
        });
    });

    routes.post('/join', (req, res) => {
        const { name, meetId }: { name: string; meetId: string } = req.body;

        const user = new User(uuid4(), name);
        const meeting = findMeeting(meetId);

        if (meeting instanceof Meet) {
            meeting.addUser(user);

            return res.status(201).json({
                meeting_id: meeting.id,
                user
            });
        }
    });

    return { routes }
};
