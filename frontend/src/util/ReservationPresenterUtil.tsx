import React, { Fragment } from "react";
import { Lock, Unlock } from "react-feather";
import { _t } from "../../localization";
import useTheme from "../hooks/useTheme";
import { Attendance, AttendanceUpdate } from "../model/api/MyProfile";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import Reservation from "../model/api/Reservation";
import Resource from "../model/api/Resource";
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

export const attendeePresenter = (a: Attendance, locale: string) => {
    const StrikeIfDenied = a.state === "denied" ? "s" : Fragment;
    return (
        <>
            <StrikeIfDenied>
                <b>
                    {a.first_name} {a.last_name}
                </b>
                {a.is_external && (
                    <> {_t(locale, "request-purpose", "Extern")}</>
                )}
            </StrikeIfDenied>
        </>
    );
};

export const requestedAttendeePresenter = (
    a: AttendanceUpdate,
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
                  requestedAttendeePresenter(a, locale)
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

export const resourceFormValuePresenter = (
    resource: Resource,
    locale: string,
    includeResourceNumber: boolean = true,
) => {
    const theme = useTheme();

    const PermissionIcon = resourcePermissionIcon(resource);
    return [
        ...insertIf([resource.display_numbers || ""], includeResourceNumber),
        <b>
            {resource.name}{" "}
            {resource.access_restricted && (
                <PermissionIcon
                    strokeWidth={(2 / 20) * 24}
                    height={theme.fontSize * 1.111}
                    width={theme.fontSize}
                    preserveAspectRatio="none"
                    style={{
                        verticalAlign: "text-bottom",
                        transform: "translateY(-2px)",
                    }}
                />
            )}
        </b>,
    ];
};
export const resourcePermissionIcon = (r: Resource) =>
    r.access_allowed_to_current_user ? Unlock : Lock;

export const purposeFormValuePresenter = (
    r: NewReservationBlueprint | Reservation,
    locale: string
) => (r.purpose ? getPurposeLabel(r.purpose, locale) : undefined);
