import classNames from "classnames";
import React from "react";
import useTheme from "../../src/hooks/useTheme";
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
    superNarrow?: boolean;
    disabled?: boolean;
    noPadding?: boolean;
    zIndex?: number;
    maxHeight?: string;
    dotted?: boolean;
    adaptiveWidth?: boolean;
    above?: boolean;
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
    superNarrow,
    className,
    disabled,
    noPadding,
    maxHeight,
    zIndex,
    dotted,
    adaptiveWidth,
    above
}) => {
    const theme = useTheme();
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

                    min-height: ${theme.spacing(
                        superNarrow ? 4 : narrow ? 5 : 7
                    )}px;
                    color: ${theme.primaryColor};
                    background-color: ${theme.secondaryColor};

                    user-select: none;
                }

                .form-element-base.adaptive-width {
                    width: fit-content;
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

                .form-element-base.outline.dotted {
                    border-style: dotted;
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
                    overflow-y: auto;
                    overflow-x: hidden;
                    max-height: ${maxHeight || "none"};
                }

                .form-element-base.scroll::-webkit-scrollbar {
                    display: none;
                }

                .form-element-base.outline.above {
                    box-shadow: ${theme.boxShadow()};
                }
            `}</style>
            <ComponentType
                disabled={disabled}
                onClick={onClick}
                className={classNames("form-element-base", className, {
                    outline,
                    dotted,
                    primary,
                    interactable: !disabled && onClick,
                    disabled: disabled,
                    padding: !noPadding,
                    scroll: !!maxHeight,
                    "adaptive-width": adaptiveWidth,
                    above
                })}
            >
                {children}
            </ComponentType>
        </>
    );
};

export default FormElementBase;
