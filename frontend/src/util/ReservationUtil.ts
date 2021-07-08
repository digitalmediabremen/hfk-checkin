import { CheckCircle, Clock, MinusCircle, UserCheck, UserX, Watch, XCircle } from "react-feather";
import { _t } from "../../localization";
import { AttendanceState } from "../model/api/MyProfile";
import NewReservation from "../model/api/NewReservation";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import { ReservationState } from "../model/api/Reservation";
import { ReservationPurpose } from "../model/api/ReservationPurpose";
import { assertNever } from "./TypeUtil";

export function getIcon(state: ReservationState) {
    if (state === "requested") return Clock;
    if (state === "confirmed") return CheckCircle;
    if (state === "denied") return MinusCircle;
    if (state === "cancelled") return XCircle;
    if (state === "created") return Clock;
    assertNever(state);
}

export function getAttendanceStateIcon(state: AttendanceState) {
    if (state === "confirmed") return UserCheck;
    if (state === "denied") return UserX;
    if (state === "requested") return Clock;
    assertNever(state);
}

export function getStateLabel(state: ReservationState, locale: string) {
    if (state === "requested") return _t(locale, "reservation", "angefragt");
    if (state === "confirmed") return _t(locale, "reservation", "bestätigt");
    if (state === "denied") return _t(locale, "reservation", "abgelehnt");
    if (state === "cancelled") return _t(locale, "reservation", "storniert");
    if (state === "created") return _t(locale, "reservation", "erstellt");
    assertNever(state);
}

type MapToStringRecord<T> = Record<Exclude<keyof T, undefined>, string>;
type Entries<T extends {}> = {
    [K in Exclude<keyof T, undefined>]: [K, T[K]];
}[Exclude<keyof T, undefined>][];

type Keys<T extends {}> = {
    [K in Exclude<keyof T, undefined>]: K;
}[Exclude<keyof T, undefined>][];

const getRequestFieldLabelMap = (
    locale: string
): MapToStringRecord<NewReservation> => ({
    agreed_to_phone_contact: _t(locale, "request", "Telefonkontakt"),
    resource_uuid: _t(locale, "request", "Raum"),
    exclusive_resource_usage: _t(locale, "request", "Alleinnutzung"),
    attendees: _t(locale, "request", "Externe Personen"),
    begin: _t(locale, "request", "Anfang"),
    end: _t(locale, "request", "Ende"),
    message: _t(locale, "request", "Nachricht"),
    number_of_extra_attendees: _t(locale, "request", "Weitere Personen"),
    purpose: _t(locale, "request", "Grund"),
    templateId: ""
});

// returns the bookable range for a requested resource in days
export function calculateBookableRange(reservation?: NewReservationBlueprint) {
    return {
        range: reservation?.resource?.reservable_max_days_in_advance || 14,
        resource: reservation?.resource,
    };
}

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
    res: NewReservation,
    locale: string
) {
    const labelMap = getRequestFieldLabelMap(locale);
    const fields = additionalFilledReservationRequestFields(res);
    const labels = fields.map((r) => labelMap[r]).join(", ");

    if (!labels) return "";

    return _t(locale, "common", "sowie {fields}", { fields: labels });
}

export const insertIf = <Type extends any>(arr: Array<Type>, bool: boolean) =>
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

    console.log("new", newReservationRequest);

    return newReservationRequest;
}

export function getPurposeLabel(
    key: ReservationPurpose | undefined,
    locale: string
) {
    return key
        ? getPurposeLabelMap(locale)[key]
        : _t(locale, "request-purpose", "Normale Buchung");
}

export function getPurposeLabelMap(
    locale: string
): Record<ReservationPurpose, string> {
    return {
        FOR_EXAM: _t(
            locale,
            "request-purpose",
            "Prüfung"
        ),
        FOR_EXAM_PREPARATION: _t(
            locale,
            "request-purpose",
            "Prüfungsvorbereitung"
        ),
        FOR_PICKUP: _t(
            locale,
            "request-purpose",
            "Abholung"
        ),
        FOR_COUNCIL_MEETING: _t(
            locale,
            "request-purpose",
            "Gremiensitzung"
        ),
        FOR_TEACHING: _t(
            locale,
            "request-purpose",
            "Lehrveranstaltung"
        ),
        OTHER: _t(
            locale,
            "request-purpose",
            "Anderer Grund"
        ),
    };
}