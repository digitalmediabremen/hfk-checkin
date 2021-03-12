import { locale } from "yargs";
import { _t } from "../../localization";
import { Attendance, AttendanceUpdate } from "../model/api/MyProfile";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import Reservation from "../model/api/Reservation";
import { getFormattedDate } from "./DateTimeUtil";
import { getPurposeLabel, insertIf } from "./ReservationUtil";
import { timeSpan } from "./TimeFormatUtil";

export const timeFormValuePresenter = (
    r: NewReservationBlueprint,
    locale: string
): string[] | undefined => {
    const { begin, end } = r;
    if (!begin || !end) return undefined;
    return [getFormattedDate(begin, locale) || "", timeSpan(begin, end)];
};

export const attendeePresenter = (
    a: Pick<AttendanceUpdate, "last_name" | "first_name">,
    locale: string
) => (
    <>
        <b>
            {a.first_name} {a.last_name}
        </b>{" "}
        {_t(locale, "request-purpose", "Extern")}
    </>
);

export const attendeesFormValuePresenter = (
    r: NewReservationBlueprint | Reservation,
    locale: string
) => {
    const { attendees, number_of_extra_attendees: extraAttendees } = r;
    const show =
        (!!attendees && attendees.length > 0) ||
        (extraAttendees && extraAttendees > 0);
    return show
        ? [
              ...(((attendees as unknown) as AttendanceUpdate[])?.map((a) =>
                  attendeePresenter(a, locale)
              ) || []),
              ...insertIf(
                  [
                      <>
                          +{extraAttendees || 0}{" "}
                          {_t(locale, "request-purpose", "weitere")}
                      </>,
                  ],
                  (extraAttendees || 0) !== 0
              ),
          ]
        : undefined;
};

export const resourceFormValuePresenter = (r: NewReservationBlueprint) =>
    r.resource
        ? [r.resource.display_numbers || "", <b>{r.resource.name}</b>]
        : undefined;

export const purposeFormValuePresenter = (
    r: NewReservationBlueprint | Reservation,
    locale: string
) => (r.purpose ? getPurposeLabel(r.purpose, locale) : undefined);
