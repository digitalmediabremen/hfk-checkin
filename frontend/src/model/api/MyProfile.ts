import { Writable } from "../../util/TypeUtil";
import { LastCheckin } from "./Checkin";
import Locale from "./Locale";

export default interface MyProfile extends PrivateProfile {
    readonly verified: boolean;
    readonly last_checkins: Array<LastCheckin>;
    preferred_language: Locale | null;
    // readonly reservations: Array<MyReservation>;
}

interface PrivateProfile extends BaseProfile {
    phone: string | null;
    /**
     * @TJS-format email
     */
    readonly email: string | null;
    keycard_number: string | null;
    readonly keycard_requested_at_at: Date | null;
}

export interface BaseProfile {
    readonly id: number;
    readonly display_name: string;
    first_name: string;
    last_name: string;
}

export type AttendanceState = "requested" | "confirmed" | "denied";

export interface Attendance extends Omit<BaseProfile, "id"> {
    readonly profile_id: number;
    readonly uuid: string;
    readonly is_external: boolean;
    readonly is_organizer: boolean;
    readonly state: AttendanceState | null;
}

export type ProfileUpdate = Writable<MyProfile>;

export type AttendanceUpdate = Writable<
    Attendance & Pick<PrivateProfile, "phone">
>;
