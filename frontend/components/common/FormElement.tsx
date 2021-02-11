import classNames from "classnames";
import React, { Fragment } from "react";
import { ArrowRight } from "react-feather";
import { appUrls } from "../../config";
import theme from "../../styles/theme";
import EllipseText from "./EllipseText";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";

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
    const multiline = !!otherValues;
    const shownLabel = (value !== undefined && shortLabel) || label;
    return (
        <>
            <style jsx>{`
                .push-right {
                    margin-left: auto;
                }

                .multiline {
                    line-height: 1.3em;
                }

                .form-value {
                }

                .form-label {
                    min-width: 0;
                    font-size: 12px;
                    line-height: 12px;
                    text-transform: Uppercase;
                    color: ${theme.disabledColor};

                    margin-bottom: -1px;
                    padding-right: ${theme.spacing(1)}px;
                }

                .form-label.constrain-width {
                    flex: 0 1 ${theme.spacing(7)}px;
                }
            `}</style>
            <FormElementBase extendedWidth {...formElementBaseProps}>
                <span
                    className={classNames("form-label", {
                        "constrain-width": !!value,
                    })}
                >
                    <EllipseText>{shownLabel}</EllipseText>
                </span>
                {value && (
                    <div className={classNames("form-value", { multiline })}>
                        <b>{firstValue}</b>
                        {otherValues.map((value) => (
                            <Fragment key={value}>
                                <br />
                                {value}
                            </Fragment>
                        ))}
                    </div>
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
