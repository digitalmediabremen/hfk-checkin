import Profile from "./Profile";
import { Location } from "./Location";

export type LastCheckin = Omit<Checkin, "profile">;

export interface Checkin {
    time_entered: string;
    time_left: string;
    profile: Profile;
    location: Location;
}
