import { Attendance, BaseProfile } from "./MyProfile";

interface Resource {}

type ReservationState =
    | "created"
    | "cancelled"
    | "confirmed"
    | "denied"
    | "requested";

export type ReservationPurpose =
    | "WORKSHOP_USAGE"
    | "EXAM"
    | "COUNCIL_MEETING"
    | "OTHER";

export default interface Reservation {
    /**
     * @TJS-format date-time
     */
    begin: Date;
    /**
     * @TJS-format date-time
     */
    end: Date;
    resource_uuid: string;

    attendees: Attendance[];
    number_of_extra_attendees?: number;
    message?: string | null;
    purpose?: ReservationPurpose | null;
    agreed_to_phone_contact?: boolean;
    exclusive_resource_usage?: boolean;

    readonly uuid: string;
    readonly identifier: string;
    readonly resource: Resource;
    // readonly organizer: BaseProfile;
    readonly state: ReservationState;
    readonly is_own: boolean;
    readonly number_of_attendees: number;
    readonly has_priority: boolean;
    readonly need_manual_confirmation: boolean;
    /**
     * @TJS-format date-time
     */
    readonly created_at: Date;
    // /**
    //  * @TJS-format date-time
    //  */
    // readonly updated_at: Date;
}
