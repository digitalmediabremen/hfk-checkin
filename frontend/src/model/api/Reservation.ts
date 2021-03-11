import { Attendance } from "./MyProfile";
import Resource from "./Resource";

export type ReservationState =
    | "created"
    | "cancelled"
    | "confirmed"
    | "denied"
    | "requested";

export type ReservationPurpose =
    | "FOR_EXAM"
    | "FOR_COUNCIL_MEETING"
    | "FOR_PICKUP"
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

    attendees?: Attendance[];
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
    readonly state_verbose: string;
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

export type MyReservation = Pick<
    Reservation,
    "uuid" | "begin" | "end" | "state"
> & {
    readonly resource: Pick<
        Resource,
        "uuid" | "name" | "display_name" | "display_numbers"
    >;
};
