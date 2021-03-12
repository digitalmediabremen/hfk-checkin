import { useRouter } from "next/router";
import React from "react";
import { Copy, PlusSquare } from "react-feather";
import { appUrls } from "../../../config";
import { useTranslation } from "../../../localization";
import NewReservationBlueprint from "../../../src/model/api/NewReservationBlueprint";
import Reservation from "../../../src/model/api/Reservation";
import { createTemplateFromReservation } from "../../../src/util/ReservationTemplateUtil";
import {
    additionalFilledReservationRequestFields,
    additionalFilledReservationRequestFieldsString,
    newReservationRequestFromTemplate,
} from "../../../src/util/ReservationUtil";
import * as format from "../../../src/util/TimeFormatUtil";
import { useAppState } from "../../common/AppStateProvider";
import FormElement from "../../common/FormElement";
import NewButton from "../../common/NewButton";
import SectionTitle from "../../common/SectionTitle";

export interface AdditionalRequestSubPageProps {
    reservation: Reservation;
}

const NewRequestFromTemplate: React.FunctionComponent<{
    reservation: Reservation;
    onSubmit: (newRes: NewReservationBlueprint) => void;
}> = ({ reservation, onSubmit }) => {
    const { appState } = useAppState();

    const reservationRequestTemplate = (() => {
        const { reservationRequestTemplate } = appState;
        // localstorage template corresponds to current reservation
        if (reservationRequestTemplate?.templateId === reservation.uuid) {
            return reservationRequestTemplate;
        }
        return createTemplateFromReservation(reservation);
    })();

    const { resource } = reservation;
    const { t, locale } = useTranslation();
    const hasAdditionalFields =
        additionalFilledReservationRequestFields(reservationRequestTemplate)
            .length > 0;

    const handleNewRequestFromTemplate = (
        withTime: boolean,
        withResource: boolean,
        withAdditionalFields: boolean
    ) => {
        const newReservationRequest: NewReservationBlueprint = {
            ...newReservationRequestFromTemplate(
                reservationRequestTemplate,
                withTime,
                withResource,
                withAdditionalFields
            ),
            // add resource retrieved from the api
            ...(withResource ? { resource } : undefined),
        };

        onSubmit(newReservationRequest);
    };
    return (
        <>
            <SectionTitle bottomSpacing={1}>
                {t("Raum übernehmen")}
            </SectionTitle>
            <FormElement
                value={[resource.display_numbers, <b>{resource.name}</b>]}
                actionIcon={<Copy />}
                extendedWidth
                onClick={() => handleNewRequestFromTemplate(false, true, false)}
                bottomSpacing={hasAdditionalFields ? 1 : 4}
            />
            {hasAdditionalFields && (
                <FormElement
                    value={[
                        resource.display_numbers,
                        <b>{resource.name}</b>,
                        additionalFilledReservationRequestFieldsString(
                            reservationRequestTemplate,
                            locale
                        ),
                    ]}
                    actionIcon={<Copy />}
                    extendedWidth
                    bottomSpacing={4}
                    maxRows={5}
                    onClick={() =>
                        handleNewRequestFromTemplate(false, true, true)
                    }
                />
            )}
            <SectionTitle bottomSpacing={1}>
                {t("Zeit übernehmen")}
            </SectionTitle>
            <FormElement
                value={[
                    <b>
                        {format.date(reservationRequestTemplate.begin, locale)}
                    </b>,
                    format.timeSpan(
                        reservationRequestTemplate.begin,
                        reservationRequestTemplate.end
                    ),
                ]}
                actionIcon={<Copy />}
                extendedWidth
                onClick={() => handleNewRequestFromTemplate(true, false, false)}
            />
            {hasAdditionalFields && (
                <FormElement
                    maxRows={5}
                    value={[
                        <b>
                            {format.date(
                                reservationRequestTemplate.begin,
                                locale
                            )}
                        </b>,
                        format.timeSpan(
                            reservationRequestTemplate.begin,
                            reservationRequestTemplate.end
                        ),
                        additionalFilledReservationRequestFieldsString(
                            reservationRequestTemplate,
                            locale
                        ),
                    ]}
                    actionIcon={<Copy />}
                    extendedWidth
                    onClick={() =>
                        handleNewRequestFromTemplate(true, false, true)
                    }
                />
            )}
        </>
    );
};

const AdditionalRequestSubPage: React.FunctionComponent<AdditionalRequestSubPageProps> = ({
    reservation,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { dispatch } = useAppState();

    const handleNewReservationRequest = (
        reservation?: NewReservationBlueprint
    ) => {
        dispatch({
            type: "updateReservationRequest",
            reservation: undefined,
        });
        dispatch({
            type: "updateReservationRequest",
            reservation,
        });
        router.push(appUrls.request);
    };

    return (
        <>
            <NewButton
                extendedWidth
                iconRight={<PlusSquare />}
                bottomSpacing={4}
                onClick={() => handleNewReservationRequest(undefined)}
            >
                {t("Neue Anfrage")}
            </NewButton>

            <NewRequestFromTemplate
                onSubmit={handleNewReservationRequest}
                reservation={reservation}
            />
        </>
    );
};

export default AdditionalRequestSubPage;
