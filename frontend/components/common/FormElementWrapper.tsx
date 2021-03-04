import React, { SFC } from "react";
import useTheme from "../../src/hooks/useTheme";
interface FormElementWrapperProps {
    noBottomMargin?: true
}

const FormElementWrapper: SFC<FormElementWrapperProps> = ({children, noBottomMargin}) => {
    const theme = useTheme();
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
