import React, { useMemo, useState } from "react";
import { useTranslation } from "../../../localization";
import useDelayedCallback from "../../../src/hooks/useDelayedCallback";
import useReservationState from "../../../src/hooks/useReservationState";
import ReservationPurpose from "../../../src/model/api/ReservationPurpose";
import { getPurposeLabel } from "../../../src/util/ReservationUtil";
import FormCheckbox from "../../common/FormCheckbox";
import FormMultilineTextInput from "../../common/FormMultilineTextInput";
import Notice from "../../common/Notice";

interface SetPurposeSubPageProps {}

const SetPurposeSubPage: React.FunctionComponent<SetPurposeSubPageProps> =
    ({}) => {
        const { t, locale } = useTranslation("request-purpose");
        const [purpose, setPurpose] = useReservationState("purpose");
        const [purposeText, setPurposeText] = useReservationState("message");
        const [purposeTextLocalState, setpurposeTextLocalState] =
            useState<string>(purposeText || "");

        const updatePurposeText = useDelayedCallback(setPurposeText, 200);
        const handlePurposeTextChange = (
            event: React.ChangeEvent<HTMLTextAreaElement>
        ) => {
            const text = event.target.value;
            setpurposeTextLocalState(text);
            updatePurposeText(text);
        };

        const displayedPurposes: Array<ReservationPurpose | undefined> = [
            undefined,
            "FOR_PICKUP",
            "FOR_EXAM",
            "FOR_EXAM_PREPARATION",
            "FOR_COUNCIL_MEETING",
            "FOR_TEACHING",
            "OTHER",
        ];

        const Checkboxes = () =>
            useMemo(
                () => (
                    <>
                        {displayedPurposes.map((p, index, arr) => {
                            const lastItem = index === arr.length - 1;
                            const bottomSpacing = lastItem ? 3 : 1;
                            return (
                                <>
                                    <FormCheckbox
                                        key={p || "normal"}
                                        value={purpose === p}
                                        onChange={(v) =>
                                            setPurpose(v ? p : undefined)
                                        }
                                        label={getPurposeLabel(p, locale)}
                                        bottomSpacing={bottomSpacing}
                                    />
                                    {p === "FOR_TEACHING" && (
                                        <Notice bottomSpacing={2}>
                                            {t(
                                                "Dieser Buchungsgrund soll zur Anmeldung einer Lehrveranstaltung durch Lehrende verwendet werden."
                                            )}
                                        </Notice>
                                    )}
                                </>
                            );
                        })}
                    </>
                ),
                [purpose, displayedPurposes]
            );

        return (
            <>
                <style jsx>{``}</style>
                <Notice bottomSpacing={1}>
                    {t(
                        "Bitte ergänze deine Anfrage mit folgender Information."
                    )}
                </Notice>

                <Checkboxes />
                {purpose === "OTHER" && (
                    <FormMultilineTextInput
                        bottomSpacing={4}
                        textareaProps={{
                            value: purposeTextLocalState,
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
