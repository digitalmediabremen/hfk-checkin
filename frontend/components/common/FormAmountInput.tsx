import React, { useEffect } from "react";
import { Plus, Minus } from "react-feather";
import useLongButtonPress from "../../src/hooks/useLongButtonPress";
import useTheme from "../../src/hooks/useTheme";
import { notEmpty } from "../../src/util/TypeUtil";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";

interface FormAmountInputProps extends Omit<FormElementBaseProps, "noOutline"> {
    value: number;
    minValue?: number;
    maxValue?: number;
    label?: string;
    onChange?: (currentValue: number) => void;
}

const FormAmountInput: React.FunctionComponent<FormAmountInputProps> = ({
    value: _value,
    label,
    minValue,
    maxValue,
    onChange,
    ...formBaseElementProps
}) => {
    const theme = useTheme();
    const calculateValue = (v: number) =>
        Math.min(
            Math.max(v, notEmpty(minValue) ? minValue : v),
            notEmpty(maxValue) ? maxValue : v
        );

    const value = calculateValue(_value);
    const handleChange = (modifier: number) => {
        onChange?.(calculateValue(value + modifier));
    };

    const plusDisabled = !!maxValue && value === maxValue;
    const minusDisabled = !!minValue && value === minValue;

    const longButtonPressDecreaseHandlers = useLongButtonPress(
        () => handleChange(-1),
        () => handleChange(-2),
        100
    );

    const longButtonPressIncreaseHandlers = useLongButtonPress(
        () => handleChange(1),
        () => handleChange(2),
        100
    );

    return (
        <>
            <style jsx>{`
                .amount {
                    font-size: 3rem;
                    font-weight: bold;
                }

                .label {
                    color: ${theme.shadeDisabledColor(0.7)};
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
                    -webkit-touch-callout: none;
                    user-select: none;
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
            <FormElementBase noPadding noOutline {...formBaseElementProps}>
                <span key={value} className="amount">
                    {value} {label && <span className="label">{label}</span>}
                </span>
                <div className="control">
                    <button
                        disabled={plusDisabled}
                        {...longButtonPressIncreaseHandlers}
                        className="button-circle plus"
                    >
                        <Plus />
                    </button>
                    <button
                        disabled={minusDisabled}
                        {...longButtonPressDecreaseHandlers}
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
