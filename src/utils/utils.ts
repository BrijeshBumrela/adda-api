import User from "../models/User";
import Meet from "../models/Meet";

export default (meetings: Meet[]) => {
    const findMeeting = (id: string) => meetings.find(meeting => meeting.id === id);

    const findUser = (id: string, field?: string) => {
        const key = field || 'id';

        let user: User | undefined;

        meetings.forEach(meeting => {
            if (meeting.host && meeting.host[key] === id) {
                user = meeting.host;
                return;
            }
            meeting.friends.forEach(friend => {
                if (friend[key] === id) {
                    user = friend;
                    return;
                }
            })
        })

        return user;
    }

    // this function takes two arguments
    /**
     * 
     * @param id - value of the string that is to be compared in the friends array
     * @param field - (optional) field that you want to compare (default `id`)
     */
    const findUserAndMeeting = (id: string, field: string = id): [ User | null, Meet | null ] => {
        let user: User | null = null;
        let userMeeting: Meet | null = null;
    
        meetings.forEach(meeting => {
            meeting.friends.forEach(friend => {
                if (friend[field] === id) {
                    user = friend;
                    userMeeting = meeting;
                    return;
                }
            })
        })
    
        return [user, userMeeting];
    }

    const genRandNumber = (array: Array<any>) => {
        return Math.floor(Math.random() * array.length);
    }

    return { findMeeting, findUserAndMeeting, genRandNumber, findUser }
}
