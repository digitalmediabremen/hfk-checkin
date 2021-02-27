import classNames from "classnames";
import React, { Fragment, ReactNode } from "react";
import theme from "../styles/theme";
import EllipseText from "./common/EllipseText";

type FormMultilineValueProps = {
    value: ReactNode;
    maxRows?: number;
    text?: boolean;
}

const FormMultilineValue: React.FunctionComponent<FormMultilineValueProps> = ({
    value,
    maxRows,
    text
}) => {
    const [firstValue, ...otherValues] = !Array.isArray(value)
        ? [value]
        : value;
    const multiline = otherValues.length > 0;
    return (
        <>
            <style jsx>{`
                .form-value.multiline {
                    line-height: 1.25em;
                }

                .form-value.max-rows {
                    display: -webkit-box;
                    -webkit-line-clamp: ${maxRows};
                    -webkit-box-orient: vertical;
                    max-height: ${1.25 * (maxRows || 1) + 1}rem;
                    white-space: pre-line;
                }

                .form-value.text {
                    font-style: italic;
                }
                .form-value.text > span {
                    font-weight: normal;
                }

                .form-value {
                    line-height: 1.25em;
                    display: inline;
                    width: 100%;
                }

                .form-value > span {
                    font-weight: bold;
                }
            `}</style>
            <EllipseText>
                {(ellipsed) => (
                    <div
                        className={classNames("form-value", ellipsed, {
                            multiline,
                            "max-rows": !!maxRows,
                            "text": text
                        })}
                    >
                        <span>{firstValue}</span>
                        {otherValues.map((value, index) => (
                            <Fragment key={index}>
                                <br />
                                {value}
                            </Fragment>
                        ))}
                    </div>
                )}
            </EllipseText>
        </>
    );
};

export default FormMultilineValue;
