import MyProfile from "./MyProfile";
import Location from "./Location";

export type LastCheckin = Omit<Checkin, "profile">;

export default interface Checkin {
    id: number;
    time_entered: string;
    time_left: string | null;
    profile: MyProfile;
    location: Location;
    is_active: boolean;
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
