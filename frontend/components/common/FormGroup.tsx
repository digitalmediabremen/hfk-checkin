import theme from "../../styles/theme";
import React, { FunctionComponent } from "react";
import useTheme from "../../src/hooks/useTheme";
import classNames from "classnames";
import { empty } from "../../src/util/TypeUtil";

interface FormGroupProps {
    sameLine?: boolean;
    pushRightAfter?: number;
    bottomSpacing?: number;
}

const FormGroup: FunctionComponent<FormGroupProps> = ({
    children,
    sameLine,
    pushRightAfter,
    bottomSpacing,
}) => {
    const theme = useTheme();
    return (
        <>
            <style jsx>{`

                div.same-line > div {
                    padding-right: ${theme.spacing(4)}px;
                }

                div.same-line > div:last-child {
                    padding-right: 0;
                }

                div.same-line {
                    display: flex;
                    margin-bottom: ${theme.spacing(
                        empty(bottomSpacing) ? 2 : bottomSpacing
                    )}px;
                }

                .push-right {
                    margin-left: auto;
                    text-align: right;
                    line-height: 0;
                }
            `}</style>
            <div
                className={classNames({
                    "same-line": sameLine,
                })}
            >
                {React.Children.map(children, (child, index) => {
                    return (
                        <div
                            className={classNames({
                                "push-right":
                                    index === (pushRightAfter || 999999),
                            })}
                        >
                            {child}
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default FormGroup;
