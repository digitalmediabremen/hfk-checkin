import { notEmpty, Writable, WritableKeys } from "../../util/TypeUtil";
import Profile, { SimpleProfile } from "./Profile";

interface Resource {}

enum ReservationStatus {
    REQUESTED = "requested",
}

export type ReservationPurpose =
    | "WORKSHOP_USAGE"
    | "EXAM"
    | "COUNCIL_MEETING"
    | "OTHER";

export default interface Reservation {
    readonly uuid: string;
    readonly resource: Resource[];
    resource_uuid: string;
    attendees?: SimpleProfile[];
    readonly organizer: SimpleProfile;
    readonly status: ReservationStatus;
    /**
     * @TJS-format date-time
     */
    begin: Date;
    /**
     * @TJS-format date-time
     */
    end: Date;
    readonly total_number_of_attendees: number;
    number_of_extra_attendees?: number;
    comment?: string;
    purpose?: ReservationPurpose;
    agreed_to_phone_contact: boolean;
    // organizer_not_attending (deprecated?)
    exclusive_resource_usage?: boolean;
    /**
     * @TJS-format date-time
     */
    readonly created_at: Date;
    /**
     * @TJS-format date-time
     */
    readonly updated_at: Date;
    readonly is_deleted: boolean;
}
