import { SFC, Children, useEffect, useState, useCallback, useRef } from "react";
import theme from "../../styles/theme";
import FormElementWrapper from "./FormElementWrapper";

export interface ButtonProps {
    onClick: () => void;
    onTouchStart?: () => void;
    onTouchEnd?: () => void;
    disabled?: boolean;
    outline?: true;
    noBottomMargin?: true;
}

export const ButtonWithLoading: SFC<ButtonProps & { loading: boolean }> = ({
    loading,
    children,
    onClick,
    ...props
}) => {
    const handleClick = () => {
        if (!loading) onClick();
    };
    return (
        <Button {...props} onClick={handleClick}>
            {children}
            {loading && " ..."}
        </Button>
    );
};

export const Button: SFC<ButtonProps> = (props) => {
    const { children, outline, noBottomMargin, ...otherProps } = props;

    return (
        <>
            <style jsx>{`
                .not-selectable {
                    -webkit-touch-callout: none; /* iOS Safari */
                    -webkit-user-select: none; /* Safari */
                    -khtml-user-select: none; /* Konqueror HTML */
                    -moz-user-select: none; /* Old versions of Firefox */
                    -ms-user-select: none; /* Internet Explorer/Edge */
                    user-select: none;
                }

                .button {
                    background-color: ${theme.primaryColor};
                    border-radius: ${theme.borderRadius}px;
                    color: ${theme.secondaryColor};
                    border: none;
                    padding: ${theme.spacing(2)}px ${theme.spacing(1)}px};
                    font-size: 1.3em;
                    font-weight: bold;
                    width: 100%;
                    transition: transform .05s;
                    text-transform: uppercase;
                }

                .button.outline {
                    border: 2px solid ${theme.primaryColor};
                    background-color: inherit;
                    color: ${theme.primaryColor}
                }

                .button[disabled] {
                    background-color: ${theme.disabledColor}
                }

                .button:hover, .button:active {
                    cursor: pointer;
                    transform: scale(0.95);
                }
            `}</style>
            <FormElementWrapper noBottomMargin={noBottomMargin}>
                <button
                    className={`button not-selectable ${
                        outline ? "outline" : ""
                    }`}
                    onContextMenu={(e) => e.preventDefault()}
                    {...otherProps}
                >
                    {children}
                </button>
            </FormElementWrapper>
        </>
    );
};
