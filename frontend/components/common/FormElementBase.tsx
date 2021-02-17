import classNames from "classnames";
import React from "react";
import theme from "../../styles/theme";

export interface FormElementBaseProps {
    button?: true;
    noBottomSpacing?: true;
    bottomSpacing?: number;
    extendedWidth?: true;
    onClick?: () => void;
    noOutline?: boolean;
}

const FormElementBase: React.FunctionComponent<FormElementBaseProps> = ({
    button,
    noBottomSpacing,
    bottomSpacing,
    extendedWidth,
    onClick,
    children,
    noOutline,
}) => {
    const ComponentType = button ? "button" : "div";
    const outline = !noOutline;
    return (
        <>
            <style jsx>{`
                .form-element-base {
                    display: flex;
                    align-items: center;

                    margin-bottom: ${noBottomSpacing
                        ? 0
                        : theme.spacing(bottomSpacing || 1)}px;
                    margin-left: ${extendedWidth
                        ? -theme.spacing(1.5) + 1
                        : 0}px;
                    margin-right: ${extendedWidth
                        ? -theme.spacing(1.5) + 1
                        : 0}px;
                    min-height: ${theme.spacing(7)}px;
                    color: ${theme.primaryColor};

                    line-height: 0;
                }

                .form-element-base:hover {
                    cursor: ${onClick ? "pointer": "inherit"};
                }

                .outline {
                    border-radius: ${theme.borderRadius}px;
                    border: 2px solid ${theme.primaryColor};
                    padding: ${theme.spacing(0.5)}px ${theme.spacing(1) + 2}px;
                }
            `}</style>
            <ComponentType
                onClick={onClick}
                className={classNames("form-element-base", { outline })}
            >
                {children}
            </ComponentType>
        </>
    );
};

export default FormElementBase;
