import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Minus, Plus, Square } from "react-feather";
import { useTranslation } from "../../../localization";
import { Button } from "../../common/Button";
import Divider from "../../common/Divider";
import FormAmountInput from "../../common/FormAmountInput";
import FormCheckbox from "../../common/FormCheckbox";
import FormElementBase from "../../common/FormElementBase";
import NewButton from "../../common/NewButton";
import Notice from "../../common/Notice";
import SectionTitle from "../../common/SectionTitle";
import SubPage from "../../common/SubPage";

export interface SetPersonSubpageProps {
    onAddExternalPerson: () => void;
}

const SetPersonSubpage: React.FunctionComponent<SetPersonSubpageProps> = ({
    onAddExternalPerson,
}) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState(1);
    const [checked, setChecked] = useState(false);

    return (
        <>
            <style jsx>{``}</style>
            <SectionTitle>{t("Studierende hinzufügen")}</SectionTitle>
            <FormAmountInput
                value={amount}
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
            <NewButton
                onClick={onAddExternalPerson}
                iconRight={<ArrowRight strokeWidth={1} />}
                bottomSpacing={3}
            >
                {t("Externe hinzufügen")}
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
