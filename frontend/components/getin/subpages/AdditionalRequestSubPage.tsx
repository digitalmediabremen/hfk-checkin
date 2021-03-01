import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Copy, PlusSquare } from "react-feather";
import { appUrls } from "../../../config";
import { useTranslation } from "../../../localization";
import useReservation from "../../../src/hooks/useReservation";
import useResource from "../../../src/hooks/useResource";
import NewReservation from "../../../src/model/api/NewReservation";
import NewReservationBlueprint from "../../../src/model/api/NewReservationBlueprint";
import {
    additionalFilledReservationRequestFields,
    additionalFilledReservationRequestFieldsString,
    resourceReservationRequestFields,
    timeReservationRequestFields,
} from "../../../src/util/ReservationUtil";
import * as format from "../../../src/util/TimeFormatUtil";
import { useAppState } from "../../common/AppStateProvider";
import FormElement from "../../common/FormElement";
import Loading, { LoadingInline } from "../../common/Loading";
import NewButton from "../../common/NewButton";
import SectionTitle from "../../common/SectionTitle";

interface AdditionalRequestSubPageProps {}

const insertIf = <Type extends any>(arr: Array<Type>, bool: boolean) =>
    bool ? arr : ([] as Array<Type>);

const NewRequestFromTemplate: React.FunctionComponent<{
    reservationRequestTemplate: NewReservation;
}> = ({ reservationRequestTemplate: reservation }) => {
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
        const resource = api.result;

        const handleNewRequestFromTemplate = (
            withTime: boolean,
            withResource: boolean,
            withAdditionalFields: boolean
        ) => {
            const additionalFields = additionalFilledReservationRequestFields(
                reservation
            );
            const resourceFields = resourceReservationRequestFields(
                reservation
            );
            const timeFields = timeReservationRequestFields(reservation);

            const selectedFields = [
                ...insertIf(additionalFields, withAdditionalFields),
                ...insertIf(resourceFields, withResource),
                ...insertIf(timeFields, withTime),
            ] as const;

            const newReservationRequest: NewReservationBlueprint = {
                ...Object.fromEntries(
                    selectedFields.map((fieldName) => [
                        fieldName,
                        reservation[fieldName],
                    ])
                ),
                // add resource called from the api
                resource
            };

            console.log(newReservationRequest);

            dispatch({
                type: "updateReservationRequest",
                reservation: newReservationRequest,
            });
            router.push(appUrls.request());
        };
        return (
            <>
                <FormElement
                    value={[resource.display_numbers, <b>{resource.name}</b>]}
                    actionIcon={<Copy />}
                    extendedWidth
                    onClick={() =>
                        handleNewRequestFromTemplate(false, true, false)
                    }
                />
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
                    bottomSpacing={2}
                    maxRows={5}
                    onClick={() =>
                        handleNewRequestFromTemplate(false, true, true)
                    }
                />
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
            </>
        );
    };

    return (
        <Loading loading={api.state === "loading"}>
            <SectionTitle>
                {t("AUS VOHERIGER ANFRAGE ÜBERNEHMEN")}{" "}
            </SectionTitle>
            {Content()}
        </Loading>
    );
};

const AdditionalRequestSubPage: React.FunctionComponent<AdditionalRequestSubPageProps> = ({}) => {
    const { t } = useTranslation();
    const { appState } = useAppState();
    const { reservationRequestTemplate } = appState;
    console.log("reservationrequest from template after done", reservationRequestTemplate)


    return (
        <>
            <NewButton
                extendedWidth
                iconRight={<PlusSquare />}
                bottomSpacing={4}
            >
                {t("Neue Anfrage")}
            </NewButton>

            {reservationRequestTemplate && (
                <NewRequestFromTemplate
                    reservationRequestTemplate={reservationRequestTemplate}
                />
            )}
        </>
    );
};

export default AdditionalRequestSubPage;
