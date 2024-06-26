import React from "react";
import { ArrowRight, UserPlus, X } from "react-feather";
import { requestSubpages } from "../../../config";
import { useTranslation } from "../../../localization";
import useReservationState, {
    useReservationArrayState,
} from "../../../src/hooks/useReservationState";
import {
    requestedAttendeeFormValuePresenter,
    requestedAttendeePresenterString,
} from "../../../src/util/ReservationPresenterUtil";
import useSubPage from "../../api/useSubPage";
import { useAppState } from "../../common/AppStateProvider";
import Divider from "../../common/Divider";
import FormAmountInput from "../../common/FormAmountInput";
import FormElement from "../../common/FormElement";
import MyProfileFormElement from "../../common/MyProfileFormElement";
import NewButton from "../../common/NewButton";
import Notice from "../../common/Notice";
import SectionTitle from "../../common/SectionTitle";

export interface SetPersonSubpageProps {}

const SetPersonSubpage: React.FunctionComponent<SetPersonSubpageProps> =
    ({}) => {
        const { t, locale } = useTranslation("request-attendees");
        const [_amount, _setAmount] = useReservationState(
            "number_of_extra_attendees"
        );
        const [attendees, , removeAttendee] =
            useReservationArrayState("attendees");
        const amountAttendees = attendees?.length || 0;
        const amount = _amount || 0;
        const setAmount = (value: number) => {
            _setAmount(value);
        };

        const { goForward } = useSubPage(requestSubpages);

        return (
            <>
                {/* <SectionTitle>{t("HfK-Mitglieder anmelden")}</SectionTitle>
                <FormAmountInput
                    value={amount}
                    label={
                        amountAttendees > 0 ? `+${amountAttendees}` : undefined
                    }
                    minValue={0}
                    maxValue={50}
                    onChange={setAmount}
                    bottomSpacing={2}
                />
                <Notice>
                    {t(
                        "Gib die Anzahl der HfK-Mitglieder an, die an dieser Buchung teilnehmen."
                    )}
                </Notice>
                <Divider /> */}
                <MyProfileFormElement />
                <Divider />
                <SectionTitle>{t("Externe Teilnehmer anmelden")}</SectionTitle>
                {attendees?.map((profile, index) => {
                    const attendeeLabel = requestedAttendeePresenterString(
                        profile,
                        locale
                    );
                    const deleteConfirmText = t(
                        "Möchtest du {name} aus der Liste entfernen?",
                        { name: attendeeLabel }
                    );
                    return (
                        <FormElement
                            key={profile.phone}
                            value={requestedAttendeeFormValuePresenter(
                                profile,
                                locale
                            )}
                            onClick={() =>
                                goForward("attendee-set", `${index}`)
                            }
                            extendedWidth
                            actionIcon={<X strokeWidth={2} />}
                            onIconClick={() => {
                                const c = window.confirm(deleteConfirmText);
                                if (c) removeAttendee(index);
                            }}
                        ></FormElement>
                    );
                })}
                <NewButton
                    // noOutline={amountAttendees > 0}
                    extendedWidth
                    onClick={() =>
                        goForward("attendee-set", `${attendees?.length || 0}`)
                    }
                    iconRight={<ArrowRight strokeWidth={1} />}
                    iconLeft={<UserPlus strokeWidth={1} />}
                    bottomSpacing={3}
                >
                    {amountAttendees === 0
                        ? t("Teilnehmer||Teilnehmerin hinzufügen")
                        : t("Weitere hinzufügen")}
                </NewButton>

                <Notice>
                    {t(
                        "HfK externe Teilnehmer||Teilnehmerinnen müssen vorab angemeldet werden. Deine Anfrage wird an das Dekanat Kunst und Design geschickt und geprüft. Dieser Vorgang kann deine Raumanfrage verzögern."
                    )}
                </Notice>
                <Notice>
                    {t(
                        "Bitte nenne den Grund des Aufenthaltes der o.g. Person/en."
                    )}
                    <br />
                    <br />
                    <NewButton
                        noOutline
                        iconRight={<ArrowRight strokeWidth={1} />}
                        onClick={() => goForward("message")}
                    >
                        {t("Aufenthaltsgrund angeben")}
                    </NewButton>
                </Notice>
            </>
        );
    };

export default SetPersonSubpage;
