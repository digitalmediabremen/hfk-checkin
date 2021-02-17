import React, {
    ChangeEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useTranslation } from "../../localization";
import FormElementBase from "./FormElementBase";
import FormElementLabel from "./FormElementLabel";
import "date-input-polyfill";
import { empty, notEmpty } from "../../src/util/TypeUtil";
import {
    assertDateString,
    fromDateString,
    getDateString,
    getFormattedDate,
    minDate,
} from "../../src/util/DateTimeUtil";

interface FormDateInputProps {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    minValue?: Date;
    label: string;
}

const FormDateInput: React.FunctionComponent<FormDateInputProps> = ({
    value: _value,
    onChange,
    minValue,
    label,
}) => {
    const { t, locale } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);

    const value =
        notEmpty(minValue) && notEmpty(_value)
            ? minDate(_value, minValue)
            : _value;

    const inputDate = value ? getDateString(value) : "";

    const handleChange = useCallback(
        (event: Event | ChangeEvent<HTMLInputElement>) => {
            // typecast event instances
            const e = (event as unknown) as ChangeEvent<HTMLInputElement>;
            const dateString = e.target.value as string | null;

            // validate input
            if (empty(dateString)) return onChange(undefined);
            assertDateString(dateString);
            const inputDate = fromDateString(dateString);
            const newDate = notEmpty(minValue)
                ? minDate(inputDate, minValue)
                : inputDate;
            onChange(newDate);
        },
        [minDate]
    );

    useEffect(() => {
        if (!inputRef.current) return;
        inputRef.current.addEventListener("change", handleChange);
        return () => {
            if (!inputRef.current) return;
            inputRef.current.removeEventListener("change", handleChange);
        };
    }, [inputRef]);

    const formattedDate = getFormattedDate(value, locale);

    return (
        <>
            <style jsx>{`
                .date-wrapper {
                    margin-left: -56px;
                    flex: 1;
                    position: relative;
                }

                .date-wrapper .pretty-value {
                    // position center
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                input,
                .pretty-value {
                    font-weight: bold;
                }

                input {
                    text-align: center;
                    background: none;
                    border: none;
                    padding: 0;
                    margin: 0;
                    color: blue;
                    opacity: 0;
                    display: block;
                    width: 100%;

                    /* safari date fix */
                    -webkit-appearance: textfield;
                    -moz-appearance: textfield;
                    min-height: 1.2em;
                }

                input[type="date"]::-webkit-datetime-edit {
                    text-align: center;
                    width: 100%;
                    background: red;
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
                    bottom: 0;
                    color: transparent;
                    cursor: pointer;
                    height: auto;
                    left: 0;
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: auto;
                }
            `}</style>
            <FormElementBase
                onClick={() => {
                    console.log("click");
                    inputRef.current?.focus();
                }}
            >
                <FormElementLabel name={label} />
                <div className="date-wrapper">
                    <span className="pretty-value">{formattedDate}</span>
                    <input
                        ref={inputRef}
                        type="date"
                        min="2021-03-01"
                        value={inputDate}
                        onChange={handleChange}
                    ></input>
                </div>
            </FormElementBase>
        </>
    );
};

export default FormDateInput;
