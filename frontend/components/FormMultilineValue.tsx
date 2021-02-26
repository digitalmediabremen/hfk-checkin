import classNames from "classnames";
import React, { Fragment, ReactNode } from "react";
import EllipseText from "./common/EllipseText";

interface FormMultilineValueProps {
    value?: ReactNode | ReactNode[];
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
                    line-height: 1.3em;
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
