

import classNames from "classnames";
import React, { forwardRef, InputHTMLAttributes } from "react";
import useTheme from "../../src/hooks/useTheme";
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
    className,
    ...inputProps
}, ref) => {
    const theme = useTheme();
    return (
        <>
            <style jsx>{`
                input {
                        background: none;
                        border: none;
                        padding: 0;
                        margin: 0;
                        color: blue;
                        // opacity: 0;
                        display: block;
                        width: 100%;
                
                        /* safari date fix */
                        -webkit-appearance: textfield;
                        -moz-appearance: textfield;
                        min-height: 1.2rem;
                        // opacity: 0;
                    }
                
                    input {
                        font-weight: bold;
                    }

                    input[type="date"]::-webkit-datetime-edit {
                        text-align: center;
                        width: 100%;
                    }

                    input::placeholder {
                        color: ${theme.disabledColor};
                        font-weight: normal;
                        font-style: italic;
                    }
    
                    // ::-webkit-datetime-edit
                    input::-webkit-datetime-edit-fields-wrapper {
                    }
                    // ::-webkit-datetime-edit-month-field
                    // ::-webkit-datetime-edit-day-field
                    // ::-webkit-datetime-edit-year-field
                    // ::-webkit-datetime-edit-text,
                    input::-webkit-clear-button,
                    input::-webkit-inner-spin-button {
                        display: none;
                    }
    
                    input[type="date"]::-webkit-calendar-picker-indicator {
                        background: transparent;
                        bottom: -24px;
                        color: transparent;
                        cursor: pointer;
                        height: auto;
                        left: -16px;
                        position: absolute;
                        right: -16px;
                        top: -24px;
                        width: auto;
                    }
                }
            `}</style>
            <input ref={ref} className={classNames("reset", className)} {...inputProps}></input>
        </>
    );
});

export default FormInput;