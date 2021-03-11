import React from "react";
import { useTranslation } from "../../localization";
import { MyReservation } from "../../src/model/api/Reservation";
import { getIcon, getLabel } from "../../src/util/ReservationUtil";
import * as format from "../../src/util/TimeFormatUtil";
import FormElement, { FormElementProps } from "./FormElement";
import { FormElementBaseProps } from "./FormElementBase";
import Label from "./Label";

interface ReservationProps extends FormElementProps {
    reservation: MyReservation;
}

const ReservationComponent: React.FunctionComponent<ReservationProps> = ({
    reservation,
    ...formElementBaseProps
}) => {
    const { resource, begin, end, state } = reservation;
    const { locale } = useTranslation();
    const dotted = state !== "confirmed";
    const value = [
        resource.display_numbers,
        <b>{resource.name}</b>,
        format.date(begin, locale),
        format.timeSpan(begin, end),
        <Label>{getLabel(state)}</Label>,
    ];
    const Icon = getIcon(state);
    return (
        <FormElement
            labelIcon={<Icon strokeWidth={1} />}
            dotted={dotted}
            {...formElementBaseProps}
            value={value}
        />
    );
};

export default ReservationComponent;
