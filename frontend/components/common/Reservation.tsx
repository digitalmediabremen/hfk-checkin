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
    includeDate?: boolean;
    includeTime?: boolean;
    includeResourceNumber?: boolean;
}

const ReservationComponent: React.FunctionComponent<ReservationProps> = ({
    reservation,
    includeState,
    includeIndentifier,
    includeDate: _includeDate,
    includeTime: _includeTime,
    includeResourceNumber: _includeResourceNumber,
    ...formElementBaseProps
}) => {
    const { resource, begin, end, state, identifier } = reservation;
    const includeTime = _includeTime ?? true;
    const includeDate = _includeDate ?? true;
    const includeResourceNumber = _includeResourceNumber ?? true;
    const { locale } = useTranslation("request");
    const dotted = state !== "confirmed";
    const disabled = state === "cancelled" || state === "denied";
    const value = [
        ...insertIf([resource.display_numbers], includeResourceNumber),
        <b>{resource.name}</b>,
        ...insertIf([format.date(begin, locale)], includeDate),
        ...insertIf([format.timeSpan(begin, end)], includeTime),
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
