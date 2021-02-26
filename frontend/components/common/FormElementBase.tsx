import classNames from "classnames";
import React from "react";
import theme from "../../styles/theme";

export interface FormElementBaseProps {
    componentType?: "button" | "li" | "div";
    primary?: boolean;
    noBottomSpacing?: true;
    bottomSpacing?: number;
    extendedWidth?: boolean;
    onClick?: () => void;
    noOutline?: boolean;
    className?: string;
    narrow?: boolean;
    disabled?: boolean;
    noPadding?: boolean;
    zIndex?: number;
    maxHeight?: string;
}

const FormElementBase: React.FunctionComponent<FormElementBaseProps> = ({
    componentType,
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
    noPadding,
    maxHeight,
    zIndex,
}) => {
    const ComponentType = componentType || "div";
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
                    z-index: ${zIndex || 1};
                    position: relative;
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

                    min-height: ${theme.spacing(narrow ? 5 : 7)}px;
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
                }

                .form-element-base.padding {
                    padding: ${theme.spacing(0.5)}px ${theme.spacing(1) + 2}px;
                }

                .form-element-base.outline.disabled {
                    border-color: ${theme.disabledColor};
                }

                .form-element-base:not(.outline) {
                }

                .form-element-base.scroll {
                    align-items: flex-start;
                    overflow: auto;
                    max-height: ${maxHeight || "none"};
                }
            `}</style>
            <ComponentType
                disabled={disabled}
                onClick={onClick}
                className={classNames("form-element-base", className, {
                    outline,
                    primary,
                    interactable: !disabled && onClick,
                    disabled: disabled,
                    padding: !noPadding,
                    scroll: !!maxHeight,
                })}
            >
                {children}
            </ComponentType>
        </>
    );
};

export default FormElementBase;
