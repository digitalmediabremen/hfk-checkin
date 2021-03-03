import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Copy, PlusSquare } from "react-feather";
import { appUrls } from "../../../config";
import { useTranslation } from "../../../localization";
import useResource from "../../../src/hooks/useResource";
import NewReservation from "../../../src/model/api/NewReservation";
import NewReservationBlueprint from "../../../src/model/api/NewReservationBlueprint";
import {
    additionalFilledReservationRequestFields,
    additionalFilledReservationRequestFieldsString,
    newReservationRequestFromTemplate,
} from "../../../src/util/ReservationUtil";
import * as format from "../../../src/util/TimeFormatUtil";
import { useAppState } from "../../common/AppStateProvider";
import FormElement from "../../common/FormElement";
import Loading from "../../common/Loading";
import NewButton from "../../common/NewButton";
import SectionTitle from "../../common/SectionTitle";

interface AdditionalRequestSubPageProps {}

const NewRequestFromTemplate: React.FunctionComponent<{
    reservationRequestTemplate: NewReservation;
    onSubmit: (newRes: NewReservationBlueprint) => void;
}> = ({ reservationRequestTemplate: reservation, onSubmit }) => {
    const { resource_uuid } = reservation;
    const { t, locale } = useTranslation();
    const { dispatch } = useAppState();
    const router = useRouter();

    const api = useResource();
    useEffect(() => {
        api.request(resource_uuid);
    }, []);

    useEffect(() => {}, [api.state]);

    if (api.state === "initial" || api.state === "error") return null;

    const Content = () => {
        if (api.state !== "success") return;
        const hasAdditionalFields =
            additionalFilledReservationRequestFields(reservation).length > 0;
        const resource = api.result;

        const handleNewRequestFromTemplate = (
            withTime: boolean,
            withResource: boolean,
            withAdditionalFields: boolean
        ) => {
            const newReservationRequest: NewReservationBlueprint = {
                ...newReservationRequestFromTemplate(
                    reservation,
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
                <SectionTitle>{t("Raum übernehmen")}</SectionTitle>
                <FormElement
                    value={[resource.display_numbers, <b>{resource.name}</b>]}
                    actionIcon={<Copy />}
                    extendedWidth
                    onClick={() =>
                        handleNewRequestFromTemplate(false, true, false)
                    }
                    bottomSpacing={hasAdditionalFields ? 1 : 4}
                />
                {hasAdditionalFields && (
                    <FormElement
                        value={[
                            resource.display_numbers,
                            <b>{resource.name}</b>,
                            additionalFilledReservationRequestFieldsString(
                                reservation
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
                <SectionTitle>{t("Zeit übernehmen")}</SectionTitle>
                <FormElement
                    value={[
                        <b>{format.date(reservation.begin, locale)}</b>,
                        format.timeSpan(reservation.begin, reservation.end),
                    ]}
                    actionIcon={<Copy />}
                    extendedWidth
                    onClick={() =>
                        handleNewRequestFromTemplate(true, false, false)
                    }
                />
                {hasAdditionalFields && (
                    <FormElement
                        maxRows={5}
                        value={[
                            <b>{format.date(reservation.begin, locale)}</b>,
                            format.timeSpan(reservation.begin, reservation.end),
                            additionalFilledReservationRequestFieldsString(
                                reservation
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

    return <Loading loading={api.state === "loading"}>{Content()}</Loading>;
};

const AdditionalRequestSubPage: React.FunctionComponent<AdditionalRequestSubPageProps> = ({}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { appState, dispatch } = useAppState();
    const { reservationRequestTemplate } = appState;

    const handleNewReservationRequest = (
        reservation?: NewReservationBlueprint
    ) => {
        console.log("sdfsd");
        dispatch({
            type: "updateReservationRequest",
            reservation: undefined,
        });
        dispatch({
            type: "updateReservationRequest",
            reservation,
        });
        router.push(appUrls.request());
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

            {reservationRequestTemplate && (
                <NewRequestFromTemplate
                    onSubmit={handleNewReservationRequest}
                    reservationRequestTemplate={reservationRequestTemplate}
                />
            )}
        </>
    );
};

export default AdditionalRequestSubPage;
