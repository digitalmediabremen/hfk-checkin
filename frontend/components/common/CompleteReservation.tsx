import React from "react";
import { Hash } from "react-feather";
import { useTranslation } from "../../localization";
import useTheme from "../../src/hooks/useTheme";
import Reservation from "../../src/model/api/Reservation";
import {
    attendeePresenter,
    attendeesFormValuePresenter,
    purposeFormValuePresenter,
} from "../../src/util/ReservationPresenterUtil";
import {
    getAttendanceStateIcon,
    getIcon,
    getStateLabel,
} from "../../src/util/ReservationUtil";
import * as format from "../../src/util/TimeFormatUtil";
import FormElement, { FormElementProps } from "./FormElement";
import Label from "./Label";
import ReservationComponent from "./Reservation";
import SectionTitle from "./SectionTitle";
import Subtitle from "./Subtitle";
import Title from "./Title";

interface CompleteReservationProps extends FormElementProps {
    reservation: Reservation;
    includeState?: boolean;
}

const CompleteReservationComponent: React.FunctionComponent<CompleteReservationProps> = ({
    reservation,
    includeState,
    ...formElementBaseProps
}) => {
    const { state, message, attendees, identifier } = reservation;
    const theme = useTheme();
    const { t, locale } = useTranslation("request");
    const purposeValue = purposeFormValuePresenter(reservation, locale);

    const formElementProps = {
        noPadding: true,
        noOutline: true,
        narrow: true,
    };

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
                    primary={isConfirmed}
                    narrow
                    noOutline={!isConfirmed}
                    value={getStateLabel(state, locale).toUpperCase()}
                />
            )}
            <ReservationComponent
                {...formElementBaseProps}
                reservation={reservation}
                bottomSpacing={3}
                includeIndentifier
            />
            {attendees && attendees.length > 0 && (
                <>
                    <SectionTitle bottomSpacing={-0.5}>
                        {t("Externe Personen")}
                    </SectionTitle>
                    {attendees?.map((attendee) => {
                        const AttendeeStateIcon = getAttendanceStateIcon(
                            attendee.state || "confirmed"
                        );
                        return (
                            <FormElement
                                labelIcon={
                                    <AttendeeStateIcon strokeWidth={1} />
                                }
                                {...formElementProps}
                                value={attendeePresenter(attendee, locale)}
                            />
                        );
                    })}
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
                    <SectionTitle bottomSpacing={-0.5}>
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
