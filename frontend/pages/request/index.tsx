import { NextPage } from "next";
import React from "react";
import { AlertCircle } from "react-feather";
import needsProfile from "../../components/api/needsProfile";
import showIf from "../../components/api/showIf";
import useSubPage from "../../components/api/useSubPage";
import FormCheckbox from "../../components/common/FormCheckbox";
import FormElement from "../../components/common/FormElement";
import Layout from "../../components/common/Layout";
import { LoadingInline } from "../../components/common/Loading";
import NewButton from "../../components/common/NewButton";
import SectionTitle from "../../components/common/SectionTitle";
import Subtitle from "../../components/common/Subtitle";
import SubpageCollection from "../../components/getin/subpages/SubpageCollection";
import { requestSubpages } from "../../config";
import features from "../../features";
import { useTranslation } from "../../localization";
import useLocalStorage from "../../src/hooks/useLocalStorage";
import useReservationState, {
    useReservationRequest,
} from "../../src/hooks/useReservationState";
import useSubmitReservation from "../../src/hooks/useSubmitReservation";
import useValidation from "../../src/hooks/useValidation";
import MyProfile from "../../src/model/api/MyProfile";
import {
    timeFormValuePresenter,
    useResourceFormValuePresenter,
    attendeesFormValuePresenter,
    purposeFormValuePresenter,
} from "../../src/util/ReservationPresenterUtil";

const Subpages = <SubpageCollection />;

const RequestRoomPage: NextPage<{ profile: MyProfile }> = ({ profile }) => {
    const { t, locale } = useTranslation("request");
    const { handlerProps, direction, activeSubPage } =
        useSubPage(requestSubpages);
    const { hasError } = useValidation();

    const ValidationIcon = <AlertCircle />;

    const { reservation } = useReservationRequest();
    const { message: comment } = reservation;

    const { submit, loading } = useSubmitReservation();

    const resourceFormValuePresenter = useResourceFormValuePresenter();

    const [agreedToPhoneContact, setAgreedToPhoneContact] = useReservationState(
        "agreed_to_phone_contact"
    );

    const LoadingIcon = <LoadingInline invertColor loading={loading} />;
    const title = t("Neue Anfrage");

    return (
        <Layout
            direction={direction}
            activeSubPage={activeSubPage}
            subPages={Subpages}
            title={title}
        >
            <Subtitle>{title}</Subtitle>
            <FormElement
                {...handlerProps("resource")}
                value={
                    reservation?.resource
                        ? resourceFormValuePresenter(reservation.resource)
                        : undefined
                }
                label={t("Raum")}
                shortLabel={t("Raum")}
                arrow
                actionIcon={
                    hasError("missingResourcePermissions") && ValidationIcon
                }
                extendedWidth
                bottomSpacing={2}
            />
            <FormElement
                {...handlerProps("time")}
                label={t("Datum und Uhrzeit")}
                value={timeFormValuePresenter(reservation, locale)}
                shortLabel={t("Zeit")}
                arrow
                actionIcon={hasError("exceedsBookableRange") && ValidationIcon}
                extendedWidth
            />
            <SectionTitle center>{t("optionale angaben")}</SectionTitle>
            <FormElement
                {...handlerProps("attendees")}
                value={attendeesFormValuePresenter(reservation, locale)}
                label={t("Teilnehmer||Teilnehmerinnen")}
                shortLabel={t("Teiln.")}
                arrow
                extendedWidth
                dotted={!attendeesFormValuePresenter(reservation, locale)}
            />
            <FormElement
                {...handlerProps("purpose")}
                value={purposeFormValuePresenter(reservation, locale)}
                label={t("Buchungsgrund")}
                shortLabel={t("Grund")}
                arrow
                actionIcon={hasError("needsExceptionReason") && ValidationIcon}
                extendedWidth
                maxRows={2}
                dotted={
                    !hasError("needsExceptionReason") &&
                    !purposeFormValuePresenter(reservation, locale)
                }
            />
            <FormElement
                {...handlerProps("message")}
                value={comment}
                label={t("Nachricht")}
                shortLabel={t("Nach.")}
                bottomSpacing={1}
                arrow
                maxRows={3}
                isText
                extendedWidth
                dotted={!comment}
            />
            <FormCheckbox
                extendedWidth
                small
                value={agreedToPhoneContact || false}
                onChange={(v) => setAgreedToPhoneContact(v)}
                label={t(
                    "Meine Telefonnummer ({phone}) darf für Rückfragen verwendet werden.",
                    { phone: profile.phone! }
                )}
                bottomSpacing={3}
            />
            <NewButton
                primary
                onClick={submit}
                iconRight={LoadingIcon}
                disabled={loading}
                extendedWidth
                noBottomSpacing
            >
                {t("Anfragen")}
            </NewButton>
        </Layout>
    );
};

export default showIf(() => features.getin, needsProfile(RequestRoomPage));
