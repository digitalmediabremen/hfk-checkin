import React, { useState } from "react";
import { useTranslation } from "../../../localization";
import useDelayedCallback from "../../../src/hooks/useDelayedCallback";
import useReservationState from "../../../src/hooks/useReservationState";
import useReservationPurposeText from "../../../src/hooks/useReservationPurposeMessage";
import useValidation from "../../../src/hooks/useValidation";
import theme from "../../../styles/theme";
import Fade from "../../common/Fade";
import FormCheckbox from "../../common/FormCheckbox";
import FormMultilineTextInput from "../../common/FormMultilineTextInput";
import Notice from "../../common/Notice";

interface SetPurposeSubPageProps {}

const SetPurposeSubPage: React.FunctionComponent<SetPurposeSubPageProps> = ({}) => {
    const { t } = useTranslation("request-purpose");
    const { hasError } = useValidation();
    const [purpose, setPurpose] = useReservationState("purpose");
    const [purposeText, setPurposeText] = useReservationState("message");
    const purposeLabel = useReservationPurposeText();
    const handlePurposeTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPurposeText(event.target.value)
    }

    return (
        <>
            <style jsx>{``}</style>
            <Notice bottomSpacing={1}>
                {t(
                    "Solltest du grade an einer Abschlussarbeit sitzen oder aus anderen trifftigen Gründen auf den Raum angewiesen sein kannst du hier deine Situation schildern"
                )}
            </Notice>

            <FormCheckbox
                value={purpose === undefined}
                onChange={(v) => setPurpose(undefined)}

                label={purposeLabel(undefined)}
                bottomSpacing={0.5}
            />
            <FormCheckbox
                value={purpose === "EXAM"}
                onChange={(v) => setPurpose(v ? "EXAM" : undefined)}
                label={purposeLabel("EXAM")}
                bottomSpacing={0.5}
            />
            <FormCheckbox
                value={purpose === "COUNCIL_MEETING"}
                onChange={(v) => setPurpose(v ? "COUNCIL_MEETING" : undefined)}
                label={purposeLabel("COUNCIL_MEETING")}
                bottomSpacing={0.5}
            />
            <FormCheckbox
                value={purpose === "OTHER"}
                onChange={(v) => setPurpose(v ? "OTHER" : undefined)}
                label={purposeLabel("OTHER")}
                bottomSpacing={3}
            />
            {purpose === "OTHER" && (
                <FormMultilineTextInput
                    bottomSpacing={4}
                    textareaProps={{
                        value: purposeText,
                        onChange: handlePurposeTextChange,
                        maxRows: 6,
                        placeholder: t("Begründung"),
                    }}
                />
            )}

            {/* <FormMultilineTextInput /> */}
            <Fade in={hasError("needsExceptionReason")}>
                <Notice
                    error
                    bottomSpacing={2}
                    title={t("Bitte gib hier einen Ausnahmegrund an.")}
                >
                    {t(
                        "Bitte wähle ein anderes Datum aus oder gib eine Ausnahmeregelung an."
                    )}
                </Notice>
            </Fade>
        </>
    );
};

export default SetPurposeSubPage;
