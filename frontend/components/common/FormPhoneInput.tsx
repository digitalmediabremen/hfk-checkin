import { AsYouType } from "libphonenumber-js";
import React, { forwardRef } from "react";
import FormTextInput, { FormTextInputProps } from "./FormTextInput";

interface FormPhoneInputProps extends FormTextInputProps {}

const FormPhoneInput = forwardRef<HTMLInputElement, FormPhoneInputProps>(
    ({ type, onChange, ...formTextInputProps }, ref) => {
        const handleChange = (value: string) => {
            const formattedValue = new AsYouType().input(value);
            onChange?.(formattedValue);
        };
        return (
            <FormTextInput
                ref={ref}
                type="tel"
                onChange={handleChange}
                {...formTextInputProps}
            />
        );
    }
);

export default FormPhoneInput;
