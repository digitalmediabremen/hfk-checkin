import React, { useRef } from "react";
import { NonNullExpression } from "ts-morph";
import { useTranslation } from "../../localization";
import useGenderDiscrimination from "../../src/hooks/useGenderDiscrimination";
import useTheme from "../../src/hooks/useTheme";
import Reservation from "../../src/model/api/Reservation";
import {
    attendeePresenter,
    extraAttendeesPresenter,
    purposeFormValuePresenter,
} from "../../src/util/ReservationPresenterUtil";
import {
    getAttendanceStateIcon,
    getIcon,
    getStateLabel,
} from "../../src/util/ReservationUtil";
import FormElement, { FormElementProps } from "./FormElement";
import ReservationComponent from "./Reservation";
import SectionTitle from "./SectionTitle";

interface CompleteReservationProps extends FormElementProps {
    reservation: Reservation;
    includeState?: boolean;
}

const CompleteReservationComponent: React.FunctionComponent<CompleteReservationProps> =
    ({ reservation, includeState, ...formElementBaseProps }) => {
        const {
            state,
            message,
            attendees,
            number_of_extra_attendees: numberOfExtraAttendees,
        } = reservation;
        const theme = useTheme();
        const { t, locale } = useTranslation("request");
        const purposeValue = purposeFormValuePresenter(reservation, locale);
        const disabled = state === "cancelled" || state === "denied";

        const formElementProps: Partial<FormElementProps> = {
            noPadding: true,
            noOutline: true,
            density: "narrow",
            disabled,
        };

        const genderize = useGenderDiscrimination();

        const isConfirmed = state === "confirmed";

        const Icon = getIcon(state);
        return (
            <>
                <style jsx>
                    {`
                        .state-title {
                            display: flex;
                            align-items: center;
                            color: ${theme.primaryColor};
                            font-size: 1rem;
                            margin-bottom: ${theme.spacing(2)}px;
                            font-weight: bold;
                            line-height: 0;
                        }

                        .state-title span {
                            margin-left: ${theme.spacing(1)}px;
                            text-transform: capitalize;
                        }
                    `}
                </style>
                {includeState && (
                    <FormElement
                        labelIcon={<Icon />}
                        {...formElementBaseProps}
                        density="narrow"
                        noOutline
                        value={getStateLabel(state, locale).toUpperCase()}
                    />
                )}
                <ReservationComponent
                    {...formElementBaseProps}
                    reservation={reservation}
                    bottomSpacing={3}
                    includeIndentifier
                    disabled={disabled}
                />
                {attendees && attendees.length > 0 && (
                    <>
                        <SectionTitle bottomSpacing={0.5}>
                            {genderize(t("Teilnehmerinnen"), t("Teilnehmer"))}
                        </SectionTitle>
                        {attendees?.map((attendee, index, arr) => {
                            const AttendeeStateIcon = getAttendanceStateIcon(
                                attendee.state || "confirmed"
                            );
                            const lastItem = index === arr.length - 1;
                            const bottomSpacing =
                                !lastItem || !!numberOfExtraAttendees ? 0 : 2;
                            return (
                                <FormElement
                                    key={attendee.uuid}
                                    labelIcon={
                                        <AttendeeStateIcon strokeWidth={1} />
                                    }
                                    bottomSpacing={bottomSpacing}
                                    density="super-narrow"
                                    {...formElementProps}
                                    value={attendeePresenter(attendee, locale)}
                                />
                            );
                        })}
                        {!!numberOfExtraAttendees &&
                            numberOfExtraAttendees > 0 && (
                                <FormElement
                                    labelIcon={" "}
                                    density="super-narrow"
                                    {...formElementProps}
                                    value={extraAttendeesPresenter(
                                        numberOfExtraAttendees,
                                        locale
                                    )}
                                />
                            )}
                    </>
                )}
                {purposeValue && (
                    <>
                        <SectionTitle bottomSpacing={-0.5}>
                            {t("Buchungsgrund")}
                        </SectionTitle>
                        <FormElement
                            {...formElementProps}
                            maxRows={2}
                            value={purposeValue}
                        />
                    </>
                )}
                {message && (
                    <>
                        <SectionTitle bottomSpacing={1}>
                            {t("Nachricht")}
                        </SectionTitle>
                        <FormElement
                            {...formElementProps}
                            maxRows={10}
                            value={message}
                            isText
                        />
                    </>
                )}
            </>
        );
    };

export default CompleteReservationComponent;
