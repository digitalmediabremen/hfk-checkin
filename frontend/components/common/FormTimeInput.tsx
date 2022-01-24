import React, { ChangeEvent } from "react";
import css from "styled-jsx/css";
import { useTranslation } from "../../localization";
import useTheme from "../../src/hooks/useTheme";
import {
    assertTimeString,
    createTimeFromDate,
    fromTime,
    Time,
    timeFromTimeString,
} from "../../src/util/DateTimeUtil";
import { empty, notEmpty } from "../../src/util/TypeUtil";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";
import FormElementLabel from "./FormElementLabel";
import FormInput from "./FormInput";
import Modernizr from "modernizr";
import TimeField from "react-simple-timefield";
import useStatus from "../../src/hooks/useStatus";

const { className, styles } = css.resolve`
    input {
        text-align: center;
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        // opacity: 0;
        display: block;
        width: 100%;

        /* safari date fix */
        -webkit-appearance: textfield;
        -moz-appearance: textfield;
        min-height: 1.2rem;
        // opacity: 0;
    }

    input::-webkit-clear-button,
    input::-webkit-inner-spin-button {
        display: none;
    }

    input[type="time"]::-webkit-calendar-picker-indicator {
        display: block;
    }

    input {
        font-weight: bold;
    }
`;

interface FormTimeInputProps extends FormElementBaseProps {
    value?: Time;
    onChange?: (time: Time | undefined) => void;
    minValue?: Time;
    label: string;
    hasOverlap?: boolean;
    step?: number;
}

function useRoundTimeToNearestSlotSize() {
    const { setNotice } = useStatus();
    const { t } = useTranslation("request-time");

    return (time: Time, slotSizeInSeconds: number) => {
        const millis = time.getTime();
        const newMillis =
            Math.round(millis / (slotSizeInSeconds * 1000)) *
            slotSizeInSeconds *
            1000;
        const roundedTime = createTimeFromDate(new Date(newMillis));
        if (roundedTime.getTime() !== time.getTime()) {
            setNotice(
                t(
                    "Die Uhrzeit wurde auf den nächsten möglichen Zeitslot der Resource gerundet."
                )
            );
        }
        return roundedTime;
    };
}

const FormTimeInput: React.FunctionComponent<FormTimeInputProps> = ({
    value,
    minValue,
    onChange,
    label,
    hasOverlap,
    step,
    ...formElementBaseProps
}) => {
    const inputTimeString = value ? fromTime(value) : "";
    const { t } = useTranslation();
    const theme = useTheme();
    const browserSupportsNativeTimeInput = Modernizr.inputtypes.time;
    const roundTimeToNearestSlotSize = useRoundTimeToNearestSlotSize();

    const handleChange = (event: Event | ChangeEvent<HTMLInputElement>) => {
        const e = event as unknown as ChangeEvent<HTMLInputElement>;
        const timeString = e.target.value as string | null;

        // validate input
        if (empty(timeString) || timeString === "")
            return onChange?.(undefined);
        assertTimeString(timeString);
        let time = timeFromTimeString(timeString);

        onChange?.(time);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const timeString = e.target.value as string | null;
        // validate input
        if (empty(timeString) || timeString === "")
            return onChange?.(undefined);
        assertTimeString(timeString);
        let time = timeFromTimeString(timeString);
        if (notEmpty(step)) {
            time = roundTimeToNearestSlotSize(time, step);
        }
        onChange?.(time);
    };

    return (
        <>
            <style jsx>{`
                .date-wrapper {
                    margin-left: -56px;
                    flex: 1;
                    position: relative;
                }

                .date-wrapper .plus-one-day {
                    // position center
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    margin-left: ${theme.spacing(6)}px;
                    transform: translate(-50%, -50%);
                    font-weight: normal;
                }
            `}</style>
            {styles}
            <FormElementBase {...formElementBaseProps}>
                <FormElementLabel name={label} />
                <div className="date-wrapper">
                    {hasOverlap && (
                        <span className="plus-one-day">
                            {t("+{days}T", { days: 1 })}
                        </span>
                    )}
                    {browserSupportsNativeTimeInput ? (
                        <FormInput
                            style={{
                                textAlign: "center",
                            }}
                            type="time"
                            step={step}
                            value={inputTimeString}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        ></FormInput>
                    ) : (
                        <TimeField
                            style={{
                                textAlign: "center",
                            }}
                            input={<FormInput onBlur={handleBlur} />}
                            value={inputTimeString}
                            onChange={handleChange}
                        />
                    )}
                </div>
            </FormElementBase>
        </>
    );
};

export default FormTimeInput;
