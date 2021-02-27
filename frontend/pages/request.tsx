import { NextPage } from "next";
import React from "react";
import { AlertCircle } from "react-feather";
import needsProfile from "../components/api/needsProfile";
import showIf from "../components/api/showIf";
import useSubPage from "../components/api/useSubPage";
import FormCheckbox from "../components/common/FormCheckbox";
import FormElement from "../components/common/FormElement";
import Layout from "../components/common/Layout";
import NewButton from "../components/common/NewButton";
import SubpageCollection from "../components/getin/subpages/SubpageCollection";
import { requestSubpages } from "../config";
import features from "../features";
import { useTranslation } from "../localization";
import useReservationState, {
    useReservation,
} from "../src/hooks/useReservation";
import useReservationPurposeText from "../src/hooks/useReservationPurposeMessage";
import useValidation from "../src/hooks/useValidation";
import Profile from "../src/model/api/Profile";
import {
    createTime,
    fromTime,
    getFormattedDate,
    smallerThan,
} from "../src/util/DateTimeUtil";

const presentTimeLabel = (start?: Date, end?: Date): string[] | undefined => {
    if (!start || !end) return undefined;
    const overlap = smallerThan(
        createTime(end.getHours(), end.getMinutes()),
        createTime(start.getHours(), start.getMinutes())
    );
    return [
        getFormattedDate(start, "de") || "",
        `${fromTime(start)} — ${fromTime(end)} ${overlap ? "+1 Tag" : ""}`,
    ];
};

const Subpages = <SubpageCollection />

const RequestRoomPage: NextPage<{ profile: Profile }> = ({ profile }) => {
    const { t } = useTranslation();
    const { handlerProps, direction, activeSubPage } = useSubPage(
        requestSubpages
    );
    const { hasError } = useValidation();

    const ValidationIcon = <AlertCircle />;

    const {
        attendees,
        number_of_extra_attendees: extraAttendees,
        start,
        end,
        resource,
        purpose,
        purpose_text,
    } = useReservation();

    const purposeLabel = useReservationPurposeText();

    const [phoneCallback, setPhoneCallback] = useReservationState(
        "agreed_to_phone_contact"
    );

    return (
        <Layout
            direction={direction}
            activeSubPage={activeSubPage}
            subPages={Subpages}
        >
            <style jsx>{``}</style>
            <div>
                <FormElement
                    {...handlerProps("raum")}
                    value={
                        resource
                            ? [resource.name, resource.display_numbers || ""]
                            : undefined
                    }
                    label={t("Raum auswählen")}
                    shortLabel={t("Raum")}
                    arrow
                    icon={
                        hasError("missingResourcePermissions") && ValidationIcon
                    }
                    extendedWidth
                />
                <FormElement
                    {...handlerProps("zeit")}
                    label={t("Zeitangaben tätigen")}
                    value={presentTimeLabel(start, end)}
                    shortLabel={t("Zeit")}
                    arrow
                    icon={
                        hasError("exceedsBookableRange") &&
                        hasError("needsExceptionReason") &&
                        ValidationIcon
                    }
                    extendedWidth
                />
                <FormElement
                    {...handlerProps("personen")}
                    value={[
                        ...(attendees?.map(
                            (a) => `${a.first_name} ${a.last_name} (Extern)`
                        ) || []),
                        `+${(extraAttendees || 0) + 1} weitere`,
                    ]}
                    label={t("Personen")}
                    shortLabel={t("Pers.")}
                    arrow
                    extendedWidth
                />
                <FormElement
                    {...handlerProps("grund")}
                    value={
                        purpose
                            ? [
                                  purposeLabel(purpose),
                                  (purpose === "OTHER" && purpose_text) || "",
                              ]
                            : undefined
                    }
                    label={t("Buchungsgrund")}
                    shortLabel={t("Grund")}
                    arrow
                    icon={hasError("needsExceptionReason") && ValidationIcon}
                    extendedWidth
                />
                <FormElement
                    {...handlerProps("nachricht")}
                    value={["erste Zeile", "zweite Zeile"]}
                    label={t("Nachricht")}
                    shortLabel={t("Nach.")}
                    bottomSpacing={1}
                    arrow
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
                <NewButton primary onClick={() => {}}>
                    {t("Anfragen")}
                </NewButton>
            </div>
        </Layout>
    );
};

export default showIf(() => features.getin, needsProfile(RequestRoomPage));
