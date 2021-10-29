import theme from "../../styles/theme";
import React, { FunctionComponent } from "react";
import useTheme from "../../src/hooks/useTheme";
import classNames from "classnames";

interface FormGroupProps {
    sameLine?: boolean;
}

const FormGroup: FunctionComponent<FormGroupProps> = ({
    children,
    sameLine,
}) => {
    const theme = useTheme();
    return (
        <>
            <style jsx>{`
                :root {
                    marginbottom: ${theme.spacing(2)}px;
                }

                div.same-line > div {
                    padding-right: ${theme.spacing(4)}px;
                }

                div.same-line > div:last-child {
                    padding-right: 0;
                }

                div.same-line {
                    display: flex;
                }
            `}</style>
            <div
                className={classNames({
                    "same-line": sameLine,
                })}
            >
                {React.Children.map(children, (child) => {
                    return <div>{child}</div>;
                })}
            </div>
        </>
    );
};

export default FormGroup;
