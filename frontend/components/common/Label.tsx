import SectionTitle from "./SectionTitle"


import React from "react";

interface LabelProps {
    children: string
}

const Label: React.FunctionComponent<LabelProps> = ({
    children
}) => {
    return <SectionTitle noMarginBottom>{children}</SectionTitle>
};

export default Label;