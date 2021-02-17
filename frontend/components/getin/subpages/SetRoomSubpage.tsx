import React from "react";
import FormElementBase from "../../common/FormElementBase";
import FormInput from "../../common/FormInput";

interface SetRoomSubpageProps {}

const SetRoomSubpage: React.FunctionComponent<SetRoomSubpageProps> = ({}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event);
        return null;
    };
    return (
        <>
            <style jsx>{``}</style>
            <FormElementBase>
                <FormInput
                    placeholder="Raum einfügen"
                    onChange={handleChange}
                />
            </FormElementBase>
        </>
    );
};

export default SetRoomSubpage;
