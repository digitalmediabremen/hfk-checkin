import React, { useState } from "react";
import { useTranslation } from "../../../localization";
import useDelayedCallback from "../../../src/hooks/useDelayedCallback";
import useReservationState from "../../../src/hooks/useReservationState";
import FormMultilineTextInput from "../../common/FormMultilineTextInput";

interface SetCommentSubpageProps {}

const SetCommentSubpage: React.FunctionComponent<SetCommentSubpageProps> = ({}) => {
    const [message, setMessage] = useReservationState("message");
    const [messageLocalState, setMessageLocalState] = useState<string>();
    const { t } = useTranslation("request-message");

    const updateMessage = useDelayedCallback(setMessage, 200)

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateMessage(event.target.value)
        setMessageLocalState(event.target.value);
    };

    return (
        <>
            <style jsx>{``}</style>
            <FormMultilineTextInput
                textareaProps={{
                    value: messageLocalState,
                    onChange: handleChange,
                    minRows: 7,
                    placeholder: t(
                        "Bitte erläutere Deine Anfrage nach Bedarf. \n\nZum Beispiel kannst Du hier Angaben für die Werkstattleitung machen oder dem Raumteam wichtige Informationen übermitteln.",
                        {},
                        "message-placeholder"
                    ),
                }}
            />
        </>
    );
};

export default SetCommentSubpage;
