import Profile from "./Profile";
import { Location } from "./Location";

export interface ProfileWithLastCheckins extends Profile {
    last_checkins: Array<LastCheckin>

};

export type LastCheckin = Omit<Checkin, "profile">;

export interface Checkin {
    time_rntered: string;
    time_left: string;
    profile: ProfileWithLastCheckins;
    location: Location;
}
