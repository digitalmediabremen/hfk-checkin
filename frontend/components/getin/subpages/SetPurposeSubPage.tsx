import React from "react";
import { useTranslation } from "../../../localization";
import theme from "../../../styles/theme";
import FormCheckbox from "../../common/FormCheckbox";
import Notice from "../../common/Notice";

interface SetPurposeSubPageProps {}

const SetPurposeSubPage: React.FunctionComponent<SetPurposeSubPageProps> = ({}) => {
    const { t } = useTranslation();
    return (
        <>
            <style jsx>{``}</style>
            <Notice bottomSpacing={2}>
                {t(
                    "Solltest du grade an einer Abschlussarbeit sitzen oder aus anderen trifftigen Gründen auf den Raum angewiesen sein kannst du hier deine Situation schildern"
                )}
            </Notice>
            <FormCheckbox
                value={true}
                label={t("Ich buche für eine Prüfung")}
            />
            <FormCheckbox
                value={false}
                label={t("Ich buche für eine Gremiensitzung")}
            />
            <FormCheckbox value={true} label={t("Anderer Grund")} />
            {/* <FormMultilineTextInput /> */}
        </>
    );
};

export default SetPurposeSubPage;
