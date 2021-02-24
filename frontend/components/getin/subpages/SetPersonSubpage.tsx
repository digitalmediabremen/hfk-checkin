import React from "react";
import { ArrowRight, Delete } from "react-feather";
import { useTranslation } from "../../../localization";
import useReservationState from "../../../src/hooks/useReservation";
import Divider from "../../common/Divider";
import FormAmountInput from "../../common/FormAmountInput";
import FormCheckbox from "../../common/FormCheckbox";
import FormElement from "../../common/FormElement";
import NewButton from "../../common/NewButton";
import Notice from "../../common/Notice";
import SectionTitle from "../../common/SectionTitle";

export interface SetPersonSubpageProps {
    onAddExternalPerson: (param?: string) => void;
}

const remove_item = function(arr: Array<any>, value: unknown) {
    var b = '' as any;
    for (b in arr) {
     if (arr[b] === value) {
      arr.splice(b, 1);
      break;
     }
    }
    return arr;
   };
   

const SetPersonSubpage: React.FunctionComponent<SetPersonSubpageProps> = ({
    onAddExternalPerson,
}) => {
    const { t } = useTranslation();

    const [_amount, _setAmount] = useReservationState(
        "number_of_extra_attendees"
    );
    const [attendees, setAttendees] = useReservationState("attendees");
    const amountAttendees = attendees?.length || 0;
    const amount = (_amount || 0) + 1;
    const setAmount = (value: number) => {
        _setAmount(value - 1);
    };

    const [checked, setChecked] = useReservationState(
        "exclusive_resource_usage"
    );

    return (
        <>
            <style jsx>{``}</style>
            <SectionTitle>{t("Studierende hinzufügen")}</SectionTitle>
            <FormAmountInput
                value={amount}
                label={amountAttendees > 0 ? `+${amountAttendees}` : undefined}
                minValue={1}
                onChange={setAmount}
                bottomSpacing={2}
            />
            <Notice>
                {t(
                    "Gib die Anzahl der Studierenden an, die an dieser Buchung teilnehmen."
                )}
            </Notice>
            <FormCheckbox
                value={checked}
                label={t("Ich beanspruche den ganzen Raum")}
                onChange={setChecked}
                noBottomSpacing
            />
            <Divider />
            <SectionTitle>{t("HfK externe Person anmelden")}</SectionTitle>
            {attendees?.map((profile, index) => (
                <FormElement
                    key={index}
                    value={[
                        `${profile.first_name} ${profile.last_name} (Extern)`,
                        `Tel: ${profile.phone}`
                    ]}
                    onClick={() => onAddExternalPerson(`${index}`)}
                    extendedWidth
                    icon={<Delete strokeWidth={2} />}
                    onIconClick={() => {
                        const c = window.confirm(`${t("Delete")} "${profile.first_name} ${profile.last_name} (Extern)"?`);
                        if (c) setAttendees(remove_item(attendees, profile));
                    }}
                ></FormElement>
            ))}
            <NewButton
                noOutline={amountAttendees > 0}
                extendedWidth={amountAttendees === 0}
                onClick={() => onAddExternalPerson(`${attendees?.length || 0}`)}
                iconRight={<ArrowRight strokeWidth={1} />}
                bottomSpacing={3}
            >
                {amountAttendees === 0 ? t("Externe hinzufügen"): t("Weitere Externe hinzufügen")}
            </NewButton>

            <Notice>
                {t(
                    "HfK externe Personen müssen angemeldet werden. Bitte nenne den Grund des Aufenthaltes der o.g. Person/en. Deine Anfrage wird an das Corona Office geschickt und geprüft. Dieser Vorgang kann deine Raumanfrage verzögern"
                )}
            </Notice>
        </>
    );
};

export default SetPersonSubpage;
