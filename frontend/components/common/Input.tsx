import { SFC, Children, ChangeEvent } from "react";
import theme from "../../styles/theme";
import FormElementWrapper from "./FormElementWrapper";

export interface InputProps {
    onChange: (e: ChangeEvent<any>) => void;
    value: string;
    name: string;
    label: string;
    onBlur?: (e: any) => void;
    disabled?: boolean;
    focus?: boolean;
    error?: string;
}

export const Input: SFC<InputProps> = (props) => {
    const {
        value,
        label,
        children,
        name,
        onChange,
        onBlur,
        focus,
        disabled,
        error,
        ...otherProps
    } = props;

    const handleChange = (e: ChangeEvent<any>) => {
        onChange(e);
    };

    const handleBlur = (e: any) => {
        onBlur && onBlur(e);
    };

    return (
        <>
            <style jsx>{`
                label {
                    display: block;
                    padding-bottom: ${theme.spacing(0.5)}px;
                    color: ${theme.primaryColor};
                    width: 100%;
                }
                input {
                    color: ${theme.textColor};
                    border-radius: ${theme.borderRadius}px;
                    border: 2px solid gray;
                    padding: ${theme.spacing(2)}px ${theme.spacing(1)}px;
                    font-size: 1.3em;
                    font-weight: bold;
                    width: 100%;
                }
                input:focus {
                    border: 2px solid ${theme.primaryColor};
                }

                input[disabled] {
                    color: ${theme.disabledColor};
                }
            `}</style>
            <FormElementWrapper>
                <label htmlFor={name}>{label}</label>
                <input
                    {...otherProps}
                    id={name}
                    name={name}
                    type="text"
                    value={value}
                    disabled={disabled}
                    onBlur={handleBlur}
                    {...(!disabled ? { onChange: handleChange } : undefined)}
                    {...(focus ? { autoFocus: true } : undefined)}
                />
                {error && <div>{error}</div>}
            </FormElementWrapper>
        </>
    );
};
