import { SFC, Children } from "react";
import theme from "../../styles/theme";
import FormElementWrapper from "./FormElementWrapper";

interface ButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export const Button: SFC<ButtonProps> = (props) => {
    const { children, ...otherProps } = props;

    return (
        <>
            <style jsx>{`
                .button {
                    border-radius: ${theme.borderRadius}px;
                    background-color: ${theme.primaryColor};
                    color: ${theme.secondaryColor};
                    border: none;
                    padding: ${theme.spacing(2)}px ${theme.spacing(1)}px};
                    font-size: 1.3em;
                    font-weight: bold;
                    width: 100%;
                }

                .button[disabled] {
                    background-color: ${theme.disabledColor}
                }

                .button:hover {
                    cursor: pointer;
                }
            `}</style>
            <FormElementWrapper>
                <button {...otherProps} className="button">
                    {children}
                </button>
            </FormElementWrapper>
        </>
    );
};
