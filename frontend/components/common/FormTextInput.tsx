import classNames from "classnames";
import React, { forwardRef, InputHTMLAttributes, MutableRefObject, useCallback, useRef } from "react";
import { ReferenceEntry } from "ts-morph";
import { isNullishCoalesce } from "typescript";
import theme from "../../styles/theme";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";
import FormInput from "./FormInput";

interface FormTextInputProps
    extends FormElementBaseProps,
        Pick<InputHTMLAttributes<HTMLInputElement>, "name" | "type"> {
    value?: string;
    label?: string;
    onChange?: (value: string) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
}

const FormTextInput = forwardRef<HTMLInputElement, FormTextInputProps>(
    (
        {
            value: _value,
            onChange,
            onBlur,
            label,
            error,
            bottomSpacing: _bottomErrorSpacing,
            name,
            type,
            ...formElementBaseProps
        },
        ref
    ) => {
        const value = _value || "";
        const bottomErrorSpacing = _bottomErrorSpacing || 2;
        const bottomSpacing = error ? 0.5 : bottomErrorSpacing;
        return (
            <>
                <style jsx>{`
                .value-wrapper {
                    // margin-left: -56px;
                    flex: 1;
                    position: relative;
                }

                .value-wrapper :global(input) {
                    position: relative;
                    // color: rgba(0,0,0,0);
                    // opacity: 0;
                    // line-height: 30px;
                    z-index: 100;
                }

                .value-wrapper:not(.error) .pretty-value {
                    display: none;
                }

                .value-wrapper.error .pretty-value {
                    white-space: pre;
                    display: block;
                    position: absolute;
                    top: 50%;
                    // left: 0%;
                    transform: translate(0, -30%);
                    font-weight: bold;
                    color: rgba(0, 0, 0, 0);
                    background-image: ${`url("data:image/svg+xml;charset=utf8,%3Csvg id='squiggle-link' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:ev='http://www.w3.org/2001/xml-events' viewBox='0 0 20 4'%3E%3Cstyle type='text/css'%3E%3C/style%3E%3Cpath fill='none' stroke='${theme.primaryColor}' stroke-width='2' style='transform: scaleX(0.5)' class='squiggle' d='M0,3.5 c 5,0,5,-3,10,-3 s 5,3,10,3 c 5,0,5,-3,10,-3 s 5,3,10,3'/%3E%3C/svg%3E");`}
                    background-position: 0 100%;
                    background-size: auto 4px;
                    background-repeat: repeat-x;
                    text-decoration: none;
                    z-index: 1;
                    user-select: none;   
                }

                .error-message {
                    margin-bottom: ${theme.spacing(bottomErrorSpacing || 1)}px;
                    color: ${theme.primaryColor};
                    font-size: 12px;
                    font-weight: bold;
                    padding-left: 12px;
                }
            `}</style>
                <FormElementBase
                    {...formElementBaseProps}
                    bottomSpacing={bottomSpacing}
                >
                    <div className={classNames("value-wrapper", { error })}>
                        <span className="pretty-value" key={value}>
                            {value || label || ""}
                        </span>
                        <FormInput
                            onBlur={onBlur}
                            ref={ref}
                            name={name}
                            type={type}
                            placeholder={label}
                            value={value}
                            onChange={(event) => onChange?.(event.target.value)}
                        />
                    </div>
                </FormElementBase>
                {error && <div className="error-message">{error}</div>}
            </>
        );
    }
);

export default FormTextInput;
