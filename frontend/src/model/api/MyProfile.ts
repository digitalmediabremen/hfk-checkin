import { Writable } from "../../util/TypeUtil";
import { LastCheckin } from "./Checkin";

export default interface MyProfile extends PrivateProfile {
    readonly verified: boolean;
    readonly last_checkins: Array<LastCheckin>;
}

interface PrivateProfile extends BaseProfile {
    phone: string | null;
    /**
     * @TJS-format email
     */
    email: string;
}

export interface BaseProfile {
    readonly id: number;
    readonly display_name: string;
    first_name: string;
    last_name: string;
}

type AttendanceState = "requested" | "confirmed" | "denied";

export interface Attendance extends Omit<BaseProfile, "id"> {
    readonly profile_id: number;
    readonly uuid: string;
    readonly is_external: boolean;
    readonly state: AttendanceState | null;
}

export type ProfileUpdate = Writable<MyProfile>;

export type AttendanceUpdate = Writable<Attendance & PrivateProfile>;