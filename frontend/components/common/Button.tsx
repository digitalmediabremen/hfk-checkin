import { SFC, ReactNode } from "react";
import theme from "../../styles/theme";
import FormElementWrapper from "./FormElementWrapper";
import { LoadingInline } from "./Loading";

export interface ButtonProps {
    onClick: () => void;
    onTouchStart?: () => void;
    onTouchEnd?: () => void;
    disabled?: boolean;
    outline?: true;
    noBottomMargin?: true;
    withBackIcon?: true;
    iconComponent?: ReactNode;
}

export const ButtonWithLoading: SFC<ButtonProps & { loading: boolean }> = ({
    loading,
    children,
    onClick,
    outline,
    ...props
}) => {
    const handleClick = () => {
        if (!loading) onClick();
    };
    return (
        <Button
            {...props}
            onClick={handleClick}
            outline={outline}
            iconComponent={loading ? "..." : undefined}
        >
            {children}
        </Button>
    );
};

export const Button: SFC<ButtonProps> = (props) => {
    const {
        children,
        outline,
        noBottomMargin,
        withBackIcon,
        iconComponent,
        ...otherProps
    } = props;

    const hasIcon = iconComponent || withBackIcon;

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
                    font-size: 1.0em;
                    font-weight: bold;
                    width: 100%;
                    transition: transform .05s;
                    text-transform: uppercase;
                }

                .button > span {
                    font-size: 1.3em;
                    font-weight: bold;
                    position: relative;
                    width: auto;
                    ${hasIcon ? "margin: 0 1.9em;" : ""}
                }

                .back-icon {
                    position: absolute;
                    left: -1.7em;
                    line-height: 1.0em;
                    width: 0;
                }

                .button.outline {
                    border: 2px solid ${theme.primaryColor};
                    background-color: inherit;
                    color: ${theme.primaryColor}
                }

                .button[disabled] {
                    background-color: ${theme.disabledColor}
                }

                 .button:active {
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
                    <span>
                        {(iconComponent || withBackIcon) && (
                            <span className="back-icon">{iconComponent || "←"}</span>
                        )}
                        {children}
                    </span>
                </button>
            </FormElementWrapper>
        </>
    );
};
