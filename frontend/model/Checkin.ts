import Profile from "./Profile";
import { Location } from "./Location";

export type LastCheckin = Omit<Checkin, "profile">;

export interface Checkin {
    id: number;
    time_entered: string;
    time_left: string | null;
    profile: Profile;
    location: Location;
}

export enum CheckinOrigin {
    QR_SCAN = "QR_SCAN",
    USER_MANUAL = "USER_MANUAL",
    ADMIN_MANUAL = "ADMIN_MANUAL",
    FOREIGN_SCAN = "FOREIGN_SCAN",
    PARENT_CHECKOUT = "PARENT_CHECKOUT",
    IMPORT = "PARENT_CHECKOUT",
    UNKNOWN = "UNKNOWN"
}
