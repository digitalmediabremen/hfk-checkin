import React from "react";
import TextareaAutosize, {
    TextareaAutosizeProps,
} from "react-textarea-autosize";
import css from "styled-jsx/css";
import useTheme from "../../src/hooks/useTheme";import FormElementBase, { FormElementBaseProps } from "./FormElementBase";

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
        margin: ${theme.spacing(.5)}px 0;
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
    const theme = useTheme();
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
