import React from "react";
import TextareaAutosize, {
    TextareaAutosizeProps,
} from "react-textarea-autosize";
import css from "styled-jsx/css";
import theme from "../../styles/theme";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";

interface FormMultilineTextInputProps extends FormElementBaseProps {
    textareaProps?: Omit<TextareaAutosizeProps, "ref">;
}

const { styles, className } = css.resolve`
    textarea {
        color: ${theme.primaryColor};
        width: 100%;
        resize: none;
        border: none;
        outline: none;
    }

    textarea::placeholder {
        font-style: italic;
        color: ${theme.disabledColor}
    }
`;

const FormMultilineTextInput: React.FunctionComponent<FormMultilineTextInputProps> = ({
    textareaProps,
    ...formElementBaseProps
}) => {
    return (
        <>
            <style jsx>{``}</style>
            <FormElementBase {...formElementBaseProps}>
                <TextareaAutosize {...textareaProps} className={className} />
            </FormElementBase>
            {styles}
        </>
    );
};

export default FormMultilineTextInput;
