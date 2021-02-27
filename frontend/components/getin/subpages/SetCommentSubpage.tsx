import React from "react";
import { useTranslation } from "../../../localization";
import useReservationState from "../../../src/hooks/useReservation";
import FormMultilineTextInput from "../../common/FormMultilineTextInput";

interface SetCommentSubpageProps {}

const SetCommentSubpage: React.FunctionComponent<SetCommentSubpageProps> = ({}) => {
    const [comment, setComment] = useReservationState("comment");
    const { t } = useTranslation();

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(event.target.value);
    };

    return (
        <>
            <style jsx>{``}</style>
            <FormMultilineTextInput
                textareaProps={{
                    value: comment,
                    onChange: handleChange,
                    minRows: 7,
                    placeholder: t(
                        "Bitte erläutere Deine Anfrage nach Bedarf. \n\nZum Beispiel kannst Du hier Angaben für die Werkstattleitung machen oder dem Raumteam wichtige Informationen übermitteln."
                    ),
                }}
            />
        </>
    );
};

export default SetCommentSubpage;
