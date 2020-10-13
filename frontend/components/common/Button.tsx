import { SFC, Children } from "react";
import theme from "../../styles/theme";
import FormElementWrapper from "./FormElementWrapper";

interface ButtonProps {
    onClick: () => void;
    disabled?: boolean;
    outline?: true;
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
    const { children, outline, ...otherProps } = props;

    return (
        <>
            <style jsx>{`
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

                .button:hover {
                    cursor: pointer;
                    transform: scale(1.025);
                }
            `}</style>
            <FormElementWrapper>
                <button
                    className={`button ${outline ? "outline" : ""}`}
                    {...otherProps}
                >
                    {children}
                </button>
            </FormElementWrapper>
        </>
    );
};
