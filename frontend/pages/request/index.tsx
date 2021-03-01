import { NextPage } from "next";
import React from "react";
import { AlertCircle } from "react-feather";
import needsProfile from "../../components/api/needsProfile";
import showIf from "../../components/api/showIf";
import useSubPage from "../../components/api/useSubPage";
import FormCheckbox from "../../components/common/FormCheckbox";
import FormElement from "../../components/common/FormElement";
import Layout from "../../components/common/Layout";
import NewButton from "../../components/common/NewButton";
import SubpageCollection from "../../components/getin/subpages/SubpageCollection";
import { requestSubpages } from "../../config";
import features from "../../features";
import { useTranslation } from "../../localization";
import useReservationState, {
    useReservationRequest,
} from "../../src/hooks/useReservationState";
import useReservationPurposeText from "../../src/hooks/useReservationPurposeMessage";
import useValidation from "../../src/hooks/useValidation";
import MyProfile from "../../src/model/api/MyProfile";
import {
    createTime,
    fromTime,
    getFormattedDate,
    smallerThan,
} from "../../src/util/DateTimeUtil";
import useSubmitReservation from "../../src/hooks/useSubmitReservation";
import { DotPulse, LoadingInline } from "../../components/common/Loading";
import { timeSpan } from "../../src/util/TimeFormatUtil";

const presentTimeLabel = (start?: Date, end?: Date): string[] | undefined => {
    if (!start || !end) return undefined;
    return [
        getFormattedDate(start, "de") || "",
        timeSpan(start, end),
    ];
};

const Subpages = <SubpageCollection />;

const RequestRoomPage: NextPage<{ profile: MyProfile }> = ({ profile }) => {
    const { t } = useTranslation();
    const { handlerProps, direction, activeSubPage } = useSubPage(
        requestSubpages
    );
    const { hasError } = useValidation();

    const ValidationIcon = <AlertCircle />;

    const { reservation } = useReservationRequest();
    const {
        attendees,
        number_of_extra_attendees: extraAttendees,
        begin: start,
        end,
        resource,
        purpose,
        message: comment,
    } = reservation;

    const { submit, loading } = useSubmitReservation();

    const purposeLabel = useReservationPurposeText();

    const [phoneCallback, setPhoneCallback] = useReservationState(
        "agreed_to_phone_contact"
    );

    const LoadingIcon = <LoadingInline invertColor loading={loading} />

    return (
        <Layout
            direction={direction}
            activeSubPage={activeSubPage}
            subPages={Subpages}
        >
            <FormElement
                {...handlerProps("resource")}
                value={
                    resource
                        ? [
                              resource.display_numbers || "",
                              <b>{resource.name}</b>,
                          ]
                        : undefined
                }
                label={t("Raum auswählen")}
                shortLabel={t("Raum")}
                arrow
                actionIcon={
                    hasError("missingResourcePermissions") &&
                    hasError("needsExceptionReason") &&
                    ValidationIcon
                }
                extendedWidth
            />
            <FormElement
                {...handlerProps("time")}
                label={t("Zeitangaben tätigen")}
                value={presentTimeLabel(start, end)}
                shortLabel={t("Zeit")}
                arrow
                actionIcon={
                    hasError("exceedsBookableRange") &&
                    hasError("needsExceptionReason") &&
                    ValidationIcon
                }
                extendedWidth
            />
            <FormElement
                {...handlerProps("attendees")}
                value={[
                    ...(attendees?.map((a) => (
                        <>
                            <b>
                                {a.first_name} {a.last_name}
                            </b>{" "}
                            (Extern)
                        </>
                    )) || []),
                    (extraAttendees || 0) !== 0 && (
                        <>+{extraAttendees || 0} weitere</>
                    ),
                ]}
                label={t("Teilnehmer")}
                shortLabel={t("Pers.")}
                arrow
                extendedWidth
            />
            <FormElement
                {...handlerProps("purpose")}
                value={purpose ? [purposeLabel(purpose)] : undefined}
                label={t("Buchungsgrund")}
                shortLabel={t("Grund")}
                arrow
                actionIcon={hasError("needsExceptionReason") && ValidationIcon}
                extendedWidth
                maxRows={2}
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
            />
            <FormCheckbox
                extendedWidth
                small
                value={phoneCallback || false}
                onChange={(v) => setPhoneCallback(v)}
                label={t(
                    "Bitte ruft mich bei Rückfragen zu dieser Buchung unter {phone} zurück.",
                    { phone: profile.phone! }
                )}
                bottomSpacing={3}
            />
            <NewButton
                primary
                onClick={submit}
                iconRight={LoadingIcon}
            >
                {t("Anfragen")}
            </NewButton>
        </Layout>
    );
};

export default showIf(() => features.getin, needsProfile(RequestRoomPage));
