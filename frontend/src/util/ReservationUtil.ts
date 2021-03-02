import { CheckCircle, Clock, MinusCircle, XCircle } from "react-feather";
import NewReservation from "../model/api/NewReservation";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import { ReservationState } from "../model/api/Reservation";
import { assertNever } from "./TypeUtil";

export function getIcon(state: ReservationState) {
    if (state === "requested") return Clock;
    if (state === "confirmed") return CheckCircle;
    if (state === "denied") return MinusCircle;
    if (state === "cancelled") return XCircle;
    if (state === "created") return Clock;
    assertNever(state);
}

export function getLabel(state: ReservationState) {
    if (state === "requested") return "angefragt";
    if (state === "confirmed") return "bestätigt";
    if (state === "denied") return "abgelehnt";
    if (state === "cancelled") return "storniert";
    if (state === "created") return "erstellt";
    assertNever(state);
}

type AdditionalReservationRequestFields = Omit<
    NewReservation,
    | "begin"
    | "end"
    | "resource_uuid"
    | "exclusive_resource_usage"
    | "agreed_to_phone_contact"
>;

type MapToStringRecord<T> = Record<Exclude<keyof T, undefined>, string>;
type Entries<T extends {}> = {
    [K in Exclude<keyof T, undefined>]: [K, T[K]];
}[Exclude<keyof T, undefined>][];

type Keys<T extends {}> = {
    [K in Exclude<keyof T, undefined>]: K;
}[Exclude<keyof T, undefined>][];

const requestFieldLabelMap: MapToStringRecord<NewReservation> = {
    agreed_to_phone_contact: "Telefonkontakt",
    resource_uuid: "Raum",
    exclusive_resource_usage: "Alleinnutzung",
    attendees: "Externe Teilnehmer",
    begin: "Anfang",
    end: "Ende",
    message: "Nachricht",
    number_of_extra_attendees: "Weitere Teilnehmer",
    purpose: "Grund",
};

export function additionalFilledReservationRequestFields(
    res: NewReservation
): Keys<NewReservation> {
    const additional = [
        "attendees",
        "message",
        "number_of_extra_attendees",
        "purpose",
    ];
    return (Object.entries(res) as Entries<NewReservation>)
        .filter(([key, value]) => additional.includes(key))
        .filter(([key, value]) => value !== undefined)
        .filter(([key, value]) =>
            Array.isArray(value) || typeof value === "string"
                ? value.length > 0
                : true
        )
        .filter(([key, value]) =>
            typeof value === "number" ? value > 0 : true
        )
        .map(([key]) => key);
}

export function timeReservationRequestFields(
    res: NewReservation
): Keys<NewReservation> {
    return ["begin", "end"];
}

export function resourceReservationRequestFields(
    res: NewReservation
): Keys<NewReservation> {
    return ["resource_uuid", "exclusive_resource_usage"];
}

export function additionalFilledReservationRequestFieldsString(
    res: NewReservation
) {
    const fields = additionalFilledReservationRequestFields(res);
    const labels = fields.map((r) => requestFieldLabelMap[r]).join(", ");

    if (!labels) return "";

    return `sowie ${labels}`;
}

const insertIf = <Type extends any>(arr: Array<Type>, bool: boolean) =>
    bool ? arr : ([] as Array<Type>);

export function newReservationRequestFromTemplate(
    reservation: NewReservation,
    withTime: boolean,
    withResource: boolean,
    withAdditionalFields: boolean
) {
    const additionalFields = additionalFilledReservationRequestFields(
        reservation
    );
    const resourceFields = resourceReservationRequestFields(reservation);
    const timeFields = timeReservationRequestFields(reservation);

    const selectedFields = [
        ...insertIf(additionalFields, withAdditionalFields),
        ...insertIf(resourceFields, withResource),
        ...insertIf(timeFields, withTime),
    ] as const;

    const newReservationRequest: NewReservationBlueprint = Object.fromEntries(
        selectedFields.map((fieldName) => [fieldName, reservation[fieldName]])
    );

    return newReservationRequest;
}
