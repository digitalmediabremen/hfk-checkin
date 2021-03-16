import React, { useMemo } from "react";
import SmoothCollapse from "react-smooth-collapse";
import { useTranslation } from "../../../localization";
import useReservationState from "../../../src/hooks/useReservationState";
import useValidation from "../../../src/hooks/useValidation";
import { ReservationPurpose } from "../../../src/model/api/Reservation";
import { getPurposeLabel } from "../../../src/util/ReservationUtil";
import FormCheckbox from "../../common/FormCheckbox";
import FormMultilineTextInput from "../../common/FormMultilineTextInput";
import Notice from "../../common/Notice";

interface SetPurposeSubPageProps {}

const SetPurposeSubPage: React.FunctionComponent<SetPurposeSubPageProps> = ({}) => {
    const { t, locale } = useTranslation("request-purpose");
    const { hasError, getError } = useValidation();
    const [purpose, setPurpose] = useReservationState("purpose");
    const [purposeText, setPurposeText] = useReservationState("message");
    const handlePurposeTextChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setPurposeText(event.target.value);
    };

    const displayedPurposes: Array<ReservationPurpose | undefined> = [
        undefined,
        "FOR_PICKUP",
        "FOR_EXAM",
        "FOR_COUNCIL_MEETING",
        "OTHER",
    ];

    const Checkboxes = () =>
        useMemo(
            () => (
                <>
                    {displayedPurposes.map((p, index, arr) => (
                        <FormCheckbox
                            key={p || "normal"}
                            value={purpose === p}
                            onChange={(v) => setPurpose(v ? p : undefined)}
                            label={getPurposeLabel(p, locale)}
                            bottomSpacing={index === arr.length - 1 ? 3 : 1}
                        />
                    ))}
                </>
            ),
            [purpose, displayedPurposes]
        );

    return (
        <>
            <style jsx>{``}</style>
            <SmoothCollapse expanded={hasError("needsExceptionReason")}>
                <Notice
                    error
                    bottomSpacing={2}
                    title={getError("needsExceptionReason").join("\n")}
                ></Notice>
            </SmoothCollapse>
            <Notice bottomSpacing={1}>
                {t("Bitte ergänze deine Anfrage mit folgender Information.")}
            </Notice>

            <Checkboxes />
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
        </>
    );
};

export default SetPurposeSubPage;
