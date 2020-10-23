import Profile from "./Profile";
import { Location } from "./Location";

export type LastCheckin = Omit<Checkin, "profile">;

export interface Checkin {
    time_entered: string;
    time_left: string | null;
    profile: Profile;
    location: Location;
}

export enum CheckinOrigin {
    QR_SCAN = "0",
    USER_MANUAL = "1",
    ADMIN_MANUAL = "2",
    FOREIGN_SCAN = "3",
    PARENT_CHECKOUT = "4",
    IMPORT = "5",
    UNKNOWN = "6"
}
