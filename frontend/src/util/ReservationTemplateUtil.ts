import NewReservation from "../model/api/NewReservation";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import Reservation from "../model/api/Reservation";

export function createTemplateFromReservation(
    r: Reservation
): NewReservation {
    return {
        begin: r.begin,
        end: r.end,
        resource_uuid: r.resource_uuid,
        agreed_to_phone_contact: r.agreed_to_phone_contact,
        attendees: undefined,
        exclusive_resource_usage: r.exclusive_resource_usage,
        message: r.message || undefined,
        number_of_extra_attendees: r.number_of_extra_attendees,
        purpose: r.purpose || undefined
    };
}
