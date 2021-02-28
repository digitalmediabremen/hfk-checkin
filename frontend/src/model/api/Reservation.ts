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
    /**
     * @TJS-format date-time
     */
    begin: Date;
    /**
     * @TJS-format date-time
     */
    end: Date;
    resource_uuid: string;


    attendees?: Writable<SimpleProfile>[];
    number_of_extra_attendees?: number;
    message?: string;
    purpose?: ReservationPurpose;
    agreed_to_phone_contact?: boolean;
    exclusive_resource_usage?: boolean;

    readonly uuid: string;
    readonly resource: Resource;
    readonly organizer: SimpleProfile;
    readonly state: ReservationStatus;
    readonly number_of_attendees: number;
    /**
     * @TJS-format date-time
     */
    readonly created_at: Date;
    /**
     * @TJS-format date-time
     */
    readonly updated_at: Date;
}
