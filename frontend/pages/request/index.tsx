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
import SubpageCollection from "../../components/getin/subpages/SubpageCollection";
import { requestSubpages } from "../../config";
import features from "../../features";
import { useTranslation, _t } from "../../localization";
import useLocalStorage from "../../src/hooks/useLocalStorage";
import useReservationState, {
    useReservationRequest
} from "../../src/hooks/useReservationState";
import useSubmitReservation from "../../src/hooks/useSubmitReservation";
import useValidation from "../../src/hooks/useValidation";
import MyProfile from "../../src/model/api/MyProfile";
import NewReservationBlueprint from "../../src/model/api/NewReservationBlueprint";
import { getFormattedDate } from "../../src/util/DateTimeUtil";
import { getPurposeLabel } from "../../src/util/ReservationUtil";
import { timeSpan } from "../../src/util/TimeFormatUtil";

const timeFormValuePresenter = (
    r: NewReservationBlueprint,
    locale: string
): string[] | undefined => {
    const { begin, end } = r;
    if (!begin || !end) return undefined;
    return [getFormattedDate(begin, locale) || "", timeSpan(begin, end)];
};

const attendeesFormValuePresenter = (
    r: NewReservationBlueprint,
    locale: string
) => {
    const { attendees, number_of_extra_attendees: extraAttendees } = r;
    const module = "request-purpose";
    const show =
        (!!attendees && attendees.length > 0) ||
        (extraAttendees && extraAttendees > 0);
    return show
        ? [
              ...(attendees?.map((a) => (
                  <>
                      <b>
                          {a.first_name} {a.last_name}
                      </b>{" "}
                      {_t(locale, module, "Extern")}
                  </>
              )) || []),
              (extraAttendees || 0) !== 0 && (
                  <>
                      +{extraAttendees || 0} {_t(locale, module, "weitere")}
                  </>
              ),
          ]
        : undefined;
};

const resourceFormValuePresenter = (r: NewReservationBlueprint) =>
    r.resource
        ? [r.resource.display_numbers || "", <b>{r.resource.name}</b>]
        : undefined;

const purposeFormValuePresenter = (r: NewReservationBlueprint, locale: string) => 
    r.purpose ? getPurposeLabel(r.purpose, locale) : undefined

const Subpages = <SubpageCollection />;

const RequestRoomPage: NextPage<{ profile: MyProfile }> = ({ profile }) => {
    const { t, locale } = useTranslation();
    const { handlerProps, direction, activeSubPage } = useSubPage(
        requestSubpages
    );
    const { hasError } = useValidation();

    const ValidationIcon = <AlertCircle />;

    const { reservation } = useReservationRequest();
    const { purpose, message: comment } = reservation;

    const { submit, loading } = useSubmitReservation();

    const [agreedToPhoneContact, setAgreedToPhoneContact] = useReservationState(
        "agreed_to_phone_contact"
    );
    useLocalStorage("atpc", agreedToPhoneContact, undefined, (set) => {
        setAgreedToPhoneContact(set);
    });

    const LoadingIcon = <LoadingInline invertColor loading={loading} />;

    return (
        <Layout
            direction={direction}
            activeSubPage={activeSubPage}
            subPages={Subpages}
        >
            <FormElement
                {...handlerProps("time")}
                label={t("Datum und Uhrzeit")}
                value={timeFormValuePresenter(reservation, locale)}
                shortLabel={t("Zeit")}
                arrow
                actionIcon={
                    hasError("exceedsBookableRange") &&
                    ValidationIcon
                }
                extendedWidth
            />
            <FormElement
                {...handlerProps("resource")}
                value={resourceFormValuePresenter(reservation)}
                label={t("Raum")}
                shortLabel={t("Raum")}
                arrow
                actionIcon={
                    hasError("missingResourcePermissions") &&
                    ValidationIcon
                }
                extendedWidth
                bottomSpacing={2}
            />
            <SectionTitle center>{t("optionale angaben")}</SectionTitle>
            <FormElement
                {...handlerProps("attendees")}
                value={attendeesFormValuePresenter(reservation, locale)}
                label={t("Externe Personen")}
                shortLabel={t("Pers.")}
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
                dotted={!hasError("needsExceptionReason") && !purposeFormValuePresenter(reservation, locale)}
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
            >
                {t("Anfragen")}
            </NewButton>
        </Layout>
    );
};

export default showIf(() => features.getin, needsProfile(RequestRoomPage));
