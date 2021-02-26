import classNames from "classnames";
import React, { Fragment } from "react";
import EllipseText from "./common/EllipseText";

interface FormMultilineValueProps {
    value?: string | string[];
}

const FormMultilineValue: React.FunctionComponent<FormMultilineValueProps> = ({
    value,
}) => {
    const [firstValue, ...otherValues] = !Array.isArray(value)
        ? [value]
        : value;
    const multiline = otherValues.length > 0;
    return (
        <>
            <style jsx>{`
                .form-value.multiline {
                    line-height: 21px;
                }

                .form-value {
                    line-height: 1em;
                    display: inline;
                    width: 100%;
                }
            `}</style>
            <EllipseText>
                {(ellipsed) => (
                    <div
                        className={classNames("form-value", ellipsed, {
                            multiline,
                        })}
                    >
                        <b>{firstValue}</b>
                        {otherValues.map((value) => (
                            <Fragment key={value}>
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
