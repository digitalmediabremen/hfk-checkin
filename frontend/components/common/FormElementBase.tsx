import classNames from "classnames";
import React from "react";
import theme from "../../styles/theme";

export interface FormElementBaseProps {
    button?: true;
    primary?: boolean;
    noBottomSpacing?: true;
    bottomSpacing?: number;
    extendedWidth?: boolean;
    onClick?: () => void;
    noOutline?: boolean;
    className?: string;
    narrow?: boolean;
    disabled?: boolean;
}

const FormElementBase: React.FunctionComponent<FormElementBaseProps> = ({
    button,
    noBottomSpacing,
    bottomSpacing,
    extendedWidth,
    onClick,
    children,
    noOutline,
    primary,
    narrow,
    className,
    disabled,
}) => {
    const ComponentType = button ? "button" : "div";
    const outline = !noOutline;
    const interactable = !!onClick;

    const calculateMargin = () => {
        if (extendedWidth) return -theme.spacing(1.5) + 1;
        return 0;
    };
    return (
        <>
            <style jsx>{`
                .form-element-base {
                    overflow: hidden;
                    border: none;
                    display: flex;
                    width: ${extendedWidth
                        ? `calc(100% + ${theme.spacing(3) - 2}px)`
                        : "100%"};

                    align-items: center;

                    margin-bottom: ${noBottomSpacing
                        ? 0
                        : theme.spacing(bottomSpacing || 1)}px;
                    margin-left: ${calculateMargin()}px;
                    margin-right: ${calculateMargin()}px;

                    padding: 0;

                    min-height: ${theme.spacing(narrow ? 6 : 7)}px;
                    color: ${theme.primaryColor};
                    background-color: ${theme.secondaryColor};

                    user-select: none;
                }

                .form-element-base.disabled {
                    color: ${theme.disabledColor};
                }

                .form-element-base.primary {
                    background-color: ${theme.primaryColor};
                    color: ${theme.secondaryColor};
                }

                .form-element-base.primary.disabled {
                    background-color: ${theme.disabledColor};
                }

                .form-element-base.interactable:hover {
                    cursor: pointer;
                }

                .form-element-base.interactable {
                    transition: transform 0.2s;
                    touch-action: manipulation;
                }

                .form-element-base.interactable:active {
                    transform: scale(0.98);
                }

                .form-element-base.outline {
                    border-radius: ${theme.borderRadius}px;
                    border: 2px solid ${theme.primaryColor};
                    padding: ${theme.spacing(0.5)}px ${theme.spacing(1) + 2}px;
                }

                .form-element-base.outline.disabled {
                    border-color: ${theme.disabledColor};
å                }

                .form-element-base:not(.outline) {
                }
            `}</style>
            <ComponentType
                disabled={disabled}
                onClick={onClick}
                className={classNames("form-element-base", className, {
                    outline,
                    primary,
                    interactable: !disabled,
                    disabled: disabled
                })}
            >
                {children}
            </ComponentType>
        </>
    );
};

export default FormElementBase;
