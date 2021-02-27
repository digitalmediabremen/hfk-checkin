import React from "react";
import { Plus, Minus } from "react-feather";
import theme from "../../styles/theme";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";

interface FormAmountInputProps extends Omit<FormElementBaseProps, "noOutline"> {
    value: number;
    minValue?: number;
    maxValue?: number;
    label?: string;
    onChange?: (value: number) => void;
}

const FormAmountInput: React.FunctionComponent<FormAmountInputProps> = ({
    value: _value,
    label,
    minValue,
    maxValue,
    onChange,
    ...formBaseElementProps
}) => {
    const calculateValue = (v: number) =>
        Math.min(Math.max(v, minValue || v), maxValue || v);

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
                    font-size: 3rem;
                    font-weight: bold;
                }

                .label {
                    color: ${theme.shadeDisabledColor(.7)};
                    font-weight: normal;
                }
                .control {
                    margin-left: auto;
                    margin-bottom: -8px;
                }

                button.button-circle {
                    position: relative;
                    border: 2px solid ${theme.primaryColor};
                    background-color: ${theme.secondaryColor};
                    color: ${theme.primaryColor};
                    height: ${theme.spacing(6)}px;
                    width: ${theme.spacing(6)}px;
                    border-radius: 50%;
                    cursor: pointer;
                    outline: none;
                    touch-action: manipulation;
                }

                button.button-circle > :global(svg) {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
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
                <span key={value} className="amount">
                    {value}
                    {" "}{label && (
                        <span className="label">
                            {label}
                        </span>
                    )}
                </span>
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
