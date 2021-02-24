import "date-input-polyfill";
import React, { ChangeEvent, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "../../localization";
import {
    assertDateString,
    fromDateString,
    getDateString,
    getFormattedDate,
    maxDate,
    minDate,
} from "../../src/util/DateTimeUtil";
import { empty, notEmpty } from "../../src/util/TypeUtil";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";
import FormElementLabel from "./FormElementLabel";
import FormInput from "./FormInput";

interface FormDateInputProps extends FormElementBaseProps {
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
    ...formElementBaseProps
}) => {
    const { t, locale } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function im() {}
        im();
    });

    const value =
        notEmpty(minValue) && notEmpty(_value)
            ? maxDate(_value, minValue)
            : _value;

    const inputDate = value ? getDateString(value) : "";

    const handleChange = useCallback(
        (event: Event | ChangeEvent<HTMLInputElement>) => {
            // typecast event instances
            const e = (event as unknown) as ChangeEvent<HTMLInputElement>;
            const dateString = e.target.value as string | null;

            // validate input
            if (empty(dateString) || dateString === "")
                return onChange(undefined);
            assertDateString(dateString);
            const inputDate = fromDateString(dateString);
            const newDate = notEmpty(minValue)
                ? maxDate(inputDate, minValue)
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

                .pretty-value {
                    font-weight: bold;
                }
            `}</style>
            <FormElementBase
                {...formElementBaseProps}
                onClick={() => {
                    inputRef.current?.focus();
                    inputRef.current?.click();
                }}
            >
                <FormElementLabel name={label} />
                <div className="date-wrapper">
                    <span className="pretty-value">{formattedDate}</span>
                    <FormInput
                        style={{
                            textAlign: "center",
                            opacity: 0,
                        }}
                        ref={inputRef}
                        type="date"
                        {...(notEmpty(minValue)
                            ? { min: getDateString(minValue) }
                            : undefined)}
                        value={inputDate}
                        onChange={handleChange}
                    ></FormInput>
                </div>
            </FormElementBase>
        </>
    );
};

export default FormDateInput;
