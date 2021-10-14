import classNames from "classnames";
import React, { forwardRef, ReactNode } from "react";
import useTheme from "../../src/hooks/useTheme";
import { assertNever } from "../../src/util/TypeUtil";

export type VerticalDensityType = "super-narrow" | "narrow" | "normal" | "wide";
export interface FormElementBaseProps {
    children?: ReactNode;
    componentType?: "a" | "div" | "li" | "button";
    primary?: boolean;
    noBottomSpacing?: boolean;
    bottomSpacing?: number;
    extendedWidth?: boolean;
    noOutline?: boolean;
    className?: string;
    density?: VerticalDensityType;
    disabled?: boolean;
    noPadding?: boolean;
    zIndex?: number;
    maxHeight?: string;
    dotted?: boolean;
    width?: "adaptive" | "full" | "half" | "third";
    above?: boolean;
    onClick?: () => void;
    href?: string;
}

export type FormElementBaseRefType = HTMLButtonElement &
    HTMLLIElement &
    HTMLAnchorElement &
    HTMLDivElement;

export function calculateMinHeightSpacing(
    density: VerticalDensityType | undefined
) {
    if (density === "super-narrow") return 4;
    else if (density === "narrow") return 5;
    else if (density === "normal" || !density) return 7;
    else if (density === "wide") return 9;
    assertNever(density);
}

const FormElementBase = forwardRef<
    FormElementBaseRefType,
    FormElementBaseProps
>(function FormElementBase(
    {
        componentType,
        noBottomSpacing,
        bottomSpacing,
        extendedWidth,
        onClick,
        children,
        noOutline,
        primary,
        density,
        className,
        disabled,
        noPadding,
        maxHeight,
        zIndex,
        dotted,
        width,
        above,
        href,
    },
    ref
) {
    const theme = useTheme();
    const ComponentType = componentType || "div";
    const outline = !noOutline;
    const interactable = !disabled && (!!onClick || !!href);

    const calculateMargin = () => {
        if (extendedWidth) return -theme.spacing(1.5) + 1;
        return 0;
    };

    const calculateWidth = () => {
        const DIVISOR_MAPPING = {
            full: 1,
            half: 2,
            third: 3,
        };

        if (width === "adaptive") return "fit-content";
        const divisor = DIVISOR_MAPPING[width || "full"];
        const spaceBetween = extendedWidth
            ? theme.spacing(3) + 2
            : theme.spacing(0) + 4;
        const gutter = (-(divisor - 1) * spaceBetween) / divisor;
        const percentage = 100 / divisor;
        const extendedPixelWidth = theme.spacing(3) - 2;
        const addPixels = extendedWidth ? extendedPixelWidth + gutter : gutter;
        return `calc(${percentage}% + ${addPixels}px)`;
    };

    const minHeightSpacing = calculateMinHeightSpacing(density);
    return (
        <>
            <style jsx>{`
                .form-element-base {
                    z-index: ${zIndex || 1};
                    position: relative;
                    overflow: hidden;
                    border: none;
                    display: flex;
                    width: ${calculateWidth()};
                    align-items: center;

                    margin-bottom: ${noBottomSpacing
                        ? 0
                        : theme.spacing(bottomSpacing ?? 1)}px;
                    margin-left: ${calculateMargin()}px;
                    margin-right: ${calculateMargin()}px;

                    padding: 0px;

                    min-height: ${theme.spacing(minHeightSpacing)}px;
                    height: min-content;
                    color: ${theme.primaryColor};
                    background-color: inherit;

                    line-height: 1.25rem;
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
                    user-select: none;
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

                .form-element-base.padding:not(.outline) {
                    padding: ${theme.spacing(0.5)}px ${theme.spacing(1) + 4}px;
                }

                .form-element-base.padding.outline {
                    padding: ${theme.spacing(0.5)}px ${theme.spacing(1) + 2}px;
                }

                .form-element-base.outline.disabled {
                    border-color: ${theme.disabledColor};
                }

                .form-element-base:not(.outline) {
                    background-color: transparent;
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

                .form-element-base.outline.above.primary {
                    background-color: ${theme.primaryColor};
                }

                .form-element-base.outline.above:not(.primary) {
                    background-color: ${theme.secondaryColor};
                }
            `}</style>
            <ComponentType
                ref={ref}
                {...(componentType === "button" && disabled
                    ? { disabled: true }
                    : undefined)}
                {...(componentType === "a" && !!href ? { href } : undefined)}
                onClick={onClick}
                className={classNames("form-element-base", className, {
                    outline,
                    dotted,
                    primary,
                    interactable,
                    disabled,
                    padding: !noPadding,
                    scroll: !!maxHeight,
                    above,
                })}
            >
                {children}
            </ComponentType>
        </>
    );
});

export default FormElementBase;
