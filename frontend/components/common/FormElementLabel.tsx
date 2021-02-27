import classNames from "classnames";
import React from "react";
import theme from "../../styles/theme";
import EllipseText from "./EllipseText";

interface FormElementLabelProps {
    name: string;
    shortName?: string;
    extendedWidth?: boolean;
}

const FormElementLabel: React.FunctionComponent<FormElementLabelProps> = ({
    name,
    shortName,
    extendedWidth,
}) => {
    const displayName = (!extendedWidth && shortName) || name;

    return (
        <>
            <style jsx>{`
                .form-label {
                    min-width: 0;
                    font-size: 0.75rem;
                    line-height: 1em;
                    text-transform: Uppercase;
                    color: ${theme.disabledColor};

                    margin-bottom: -1px;
                    padding-right: ${theme.spacing(1)}px;
                }

                .form-label.constrain-width {
                    flex: 0 0 ${theme.spacing(7)}px;
                }
            `}</style>
            <EllipseText>
                {(ellipsed) => (
                    <label
                        className={classNames("form-label", ellipsed, {
                            "constrain-width": !extendedWidth,
                        })}
                        
                    >
                        {displayName}
                    </label>
                )}
            </EllipseText>
        </>
    );
};

export default FormElementLabel;
