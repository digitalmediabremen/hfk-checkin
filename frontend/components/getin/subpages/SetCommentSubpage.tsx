import React from "react";
import useReservationState from "../../../src/hooks/useReservation";
import FormMultilineTextInput from "../../common/FormMultilineTextInput";

interface SetCommentSubpageProps {}

const SetCommentSubpage: React.FunctionComponent<SetCommentSubpageProps> = ({}) => {
    const [comment, setComment] = useReservationState("comment");

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
                }}
            />
        </>
    );
};

export default SetCommentSubpage;
