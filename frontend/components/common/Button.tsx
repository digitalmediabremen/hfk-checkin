import { SFC, Children } from "react";
import theme from "../../styles/theme";
import FormElementWrapper from "./FormElementWrapper";

interface ButtonProps {
    onClick: () => void;
    disabled?: boolean;
    outline?: true;
}

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
                }
            `}</style>
            <FormElementWrapper>
                <button className={`button ${outline ? "outline" : ""}`} {...otherProps}>
                    {children}
                </button>
            </FormElementWrapper>
        </>
    );
};
