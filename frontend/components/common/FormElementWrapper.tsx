import React, { SFC } from "react";
import theme from "../../styles/theme";

const FormElementWrapper: SFC = (props) => {
    const { children } = props;

    return (
        <>
            <style jsx>{`
                div {
                    display: inline-block;
                    width: 100%;
                    margin-bottom: ${theme.spacing(2)}px;
                }
            `}</style>
            <div>{children}</div>
        </>
    );
};

export default FormElementWrapper;
