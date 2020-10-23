import React, { SFC } from "react";
import theme from "../../styles/theme";

interface FormElementWrapperProps {
    noBottomMargin?: true
}

const FormElementWrapper: SFC<FormElementWrapperProps> = ({children, noBottomMargin}) => {
    return (
        <>
            <style jsx>{`
                div {
                    display: inline-block;
                    width: 100%;
                    margin-bottom: ${theme.spacing(2)}px;
                }

                div.no-bottom-margin {
                    margin-bottom: 0px;
                }
            `}</style>
            <div className={`${noBottomMargin ? "no-bottom-margin" : ""}`}>{children}</div>
        </>
    );
};

export default FormElementWrapper;
