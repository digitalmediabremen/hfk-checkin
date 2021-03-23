import React from "react";
import { useTranslation } from "../../../localization";
import useReservationState from "../../../src/hooks/useReservationState";
import FormMultilineTextInput from "../../common/FormMultilineTextInput";

interface SetCommentSubpageProps {}

const SetCommentSubpage: React.FunctionComponent<SetCommentSubpageProps> = ({}) => {
    const [message, setMessage] = useReservationState("message");
    const { t } = useTranslation("request-message");

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value);
    };

    return (
        <>
            <style jsx>{``}</style>
            <FormMultilineTextInput
                textareaProps={{
                    value: message,
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
