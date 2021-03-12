import React from "react";
import { useTranslation } from "../../localization";
import Reservation from "../../src/model/api/Reservation";
import {
    getIcon,
    getStateLabel,
    insertIf,
} from "../../src/util/ReservationUtil";
import * as format from "../../src/util/TimeFormatUtil";
import FormElement, { FormElementProps } from "./FormElement";
import Label from "./Label";

interface ReservationProps extends FormElementProps {
    reservation: Reservation;
    includeState?: boolean;
    includeIndentifier?: boolean;
}

const ReservationComponent: React.FunctionComponent<ReservationProps> = ({
    reservation,
    includeState,
    includeIndentifier,
    ...formElementBaseProps
}) => {
    const { resource, begin, end, state, identifier } = reservation;
    const { locale } = useTranslation("request");
    const dotted = state !== "confirmed";
    const disabled = state === "cancelled" || state === "denied";
    const value = [
        resource.display_numbers,
        <b>{resource.name}</b>,
        format.date(begin, locale),
        format.timeSpan(begin, end),
        ...insertIf(
            [<Label>{getStateLabel(state, locale)}</Label>],
            !!includeState
        ),
        ...insertIf(
            [<Label>{`Nr: ${identifier}`}</Label>],
            !!includeIndentifier
        ),
    ];

    const formElementProps = {
        ...formElementBaseProps,
        disabled,
        dotted,
    };
    const Icon = getIcon(state);

    return (
        <FormElement
            labelIcon={includeState ? <Icon strokeWidth={2} /> : undefined}
            {...formElementProps}
            value={value}
        />
    );
};

export default ReservationComponent;
