import React from "react";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";
import FormInput from "./FormInput";

interface FormTextInputProps extends FormElementBaseProps {
    value?: string;
    label: string;
    onChange?: (value: string) => void;
}

const FormTextInput: React.FunctionComponent<FormTextInputProps> = ({
    value: _value,
    onChange,
    label,
    ...formElementBaseProps
}) => {
    const value = _value || "";
    return (
        <>
            <style jsx>{``}</style>
            <FormElementBase {...formElementBaseProps}>
                <FormInput
                    placeholder={label}
                    value={value}
                    onChange={(event) => onChange?.(event.target.value)}
                />
            </FormElementBase>
        </>
    );
};

export default FormTextInput;
