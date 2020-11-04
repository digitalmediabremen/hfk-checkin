import React, { SFC, useRef, useEffect } from "react";
import useDigitInput, { InputAttributes } from "react-digit-input";
import theme from "../../styles/theme";

interface LocationCodeInputProps {
    code: string;
    onChange: (code: string) => void;
    disabled?: boolean;
}

const DigitInputElement = React.forwardRef<
    HTMLInputElement,
    Omit<InputAttributes, "ref"> & {
        autoFocus?: boolean;
        outline?: true;
        disabled?: boolean;
    }
>(({ outline, disabled, ...props }, ref) => {
    return (
        <>
            <style jsx>{`
                label {
                    position: relative;
                    width: 1em;
                    height: 1.3em;
                    font-size: 1em;
                }
                input {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    opacity: 0;
                }

                label:focus-within div {
                    // border: 2px solid black;
                }

                @keyframes blink {
                    0% {
                        opacity: 0;
                    }
                    49% {
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                }

                label:focus-within .cursor {
                    animation: blink 1s infinite reverse;
                    animation-timing-function: linear;
                    border-left: 2px solid black;
                    position: absolute;
                    width: 100%;
                    top: 0.2em;
                    right: 0;
                    bottom: 0.15em;
                    left: 0.2em;
                }

                div.digit {
                    // font-weight: bold;
                    color: ${outline ? "black" : theme.primaryColor};
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    text-align: center;
                    align-items: center;
                }

                .outline {
                    outline: 2px solid ${theme.primaryColor};
                    outline-offset: -1px;
                }
            `}</style>
            <label>
                <div className={`digit ${outline ? "outline" : ""}`}>
                    {props.value}
                </div>
                <div className="cursor"></div>
                {outline && (
                    <input
                        disabled={disabled}
                        {...props}
                        ref={ref}
                        inputMode="decimal"
                        type="tel"
                    />
                )}
            </label>
        </>
    );
});

const LocationCodeInput: SFC<LocationCodeInputProps> = (props) => {
    const { code, onChange, disabled } = props;

    const handleChange = (code: string) => {
        if (disabled) return;
        onChange(code.replace(/ /g, ""));
    };

    const digits = useDigitInput({
        acceptedCharacters: /^[0-9]$/,
        length: 4,
        value: code,
        onChange: handleChange,
    });

    return (
        <>
            <style jsx>{`
                div {
                    font-size: 18vw;
                    margin-left: -3vw;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    justify-content: center;
                }
                @media screen and (min-width: 500px) {
                    div {
                        font-size: 6em;
                        margin-left: -.15em;
                    }
                }
            `}</style>
            <div>
                <DigitInputElement value="#" />
                <DigitInputElement outline autoFocus {...digits[0]} />
                <DigitInputElement outline {...digits[1]} />
                <DigitInputElement outline {...digits[2]} />
                <DigitInputElement outline {...digits[3]} />
            </div>
        </>
    );
};

export default LocationCodeInput;
