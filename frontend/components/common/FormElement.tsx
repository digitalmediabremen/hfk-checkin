import classNames from "classnames";
import React, { Fragment } from "react";
import { ArrowRight } from "react-feather";
import { appUrls } from "../../config";
import theme from "../../styles/theme";
import EllipseText from "./EllipseText";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";
import FormElementLabel from "./FormElementLabel";

export interface FormElementProps extends FormElementBaseProps {
    label: string;
    shortLabel?: string;
    arrow?: true;
    value?: string | string[];
}

const FormElement: React.FunctionComponent<FormElementProps> = ({
    label,
    shortLabel,
    arrow,
    value,
    ...formElementBaseProps
}) => {
    const [firstValue, ...otherValues] = !Array.isArray(value)
        ? [value]
        : value;
    const multiline = otherValues.length > 0;
    return (
        <>
            <style jsx>{`
                .push-right {
                    margin-left: auto;
                }

                .form-value.multiline {
                    line-height: 1.3em;
                }

                .form-value {
                    line-height: 1em;
                    display: inline;
                    width: 100%;
                }
            `}</style>
            <FormElementBase extendedWidth {...formElementBaseProps}>
                <FormElementLabel
                    name={label}
                    shortName={shortLabel}
                    extendedWidth={!value}
                />
                {value && (
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
                )}
                {arrow && (
                    <span className="push-right">
                        <ArrowRight size="24" strokeWidth={1} />
                    </span>
                )}
            </FormElementBase>
        </>
    );
};

export default FormElement;
