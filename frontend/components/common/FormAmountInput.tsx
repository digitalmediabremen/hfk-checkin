import React from "react";
import { Plus, Minus } from "react-feather";
import theme from "../../styles/theme";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";

interface FormAmountInputProps extends Omit<FormElementBaseProps, "noOutline"> {
    value: number;
    minValue?: number;
    maxValue?: number;
    onChange?: (value: number) => void;
}

const FormAmountInput: React.FunctionComponent<FormAmountInputProps> = ({
    value: _value,
    minValue,
    maxValue,
    onChange,
    ...formBaseElementProps
}) => {
    const calculateValue = (v: number) =>
        Math.max(Math.max(v, minValue || v), maxValue || v);

    const value = calculateValue(_value);
    const handleChange = (modifier: number) => {
        onChange?.(calculateValue(value + modifier));
    };

    const plusDisabled = !!maxValue && value === maxValue;
    const minusDisabled = !!minValue && value === minValue;

    return (
        <>
            <style jsx>{`
                .amount {
                    font-size: 48px;
                    font-weight: bold;
                }
                .control {
                    margin-left: auto;
                }

                button.button-circle {
                    border: 2px solid ${theme.primaryColor};
                    background-color: ${theme.secondaryColor};
                    color: ${theme.primaryColor};
                    height: ${theme.spacing(6)}px;
                    width: ${theme.spacing(6)}px;
                    border-radius: 50%;
                    cursor: pointer;
                    outline: none;
                }

                button.button-circle[disabled] {
                    border-color: ${theme.disabledColor};
                    color: ${theme.disabledColor};
                }

                .button-circle:active {
                    color: ${theme.secondaryColor};
                    background-color: ${theme.primaryColor};
                }

                .plus {
                    margin-right: ${theme.spacing(1)}px;
                }
            `}</style>
            <FormElementBase noOutline {...formBaseElementProps}>
                <span className="amount">{value}</span>
                <div className="control">
                    <button
                        disabled={plusDisabled}
                        onClick={() => handleChange(+1)}
                        className="button-circle plus"
                    >
                        <Plus />
                    </button>
                    <button
                        disabled={minusDisabled}
                        onClick={() => handleChange(-1)}
                        className="button-circle minus"
                    >
                        <Minus />
                    </button>
                </div>
            </FormElementBase>
        </>
    );
};

export default FormAmountInput;
