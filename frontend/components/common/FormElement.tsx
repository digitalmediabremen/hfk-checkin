import classNames from "classnames";
import React, { Fragment, ReactNode } from "react";
import { ArrowRight } from "react-feather";
import { appUrls } from "../../config";
import theme from "../../styles/theme";
import FormMultilineValue from "../FormMultilineValue";
import EllipseText from "./EllipseText";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";
import FormElementLabel from "./FormElementLabel";

export interface FormElementProps extends FormElementBaseProps {
    label?: string;
    shortLabel?: string;
    arrow?: true;
    icon?: ReactNode;
    onIconClick?: () => void;
    value?: string | string[];
}

const FormElement: React.FunctionComponent<FormElementProps> = ({
    label,
    shortLabel,
    arrow,
    icon,
    onIconClick,
    value,
    ...formElementBaseProps
}) => {
    const handleIconClick = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        event.stopPropagation();
        onIconClick?.();
    }
    return (
        <>
            <style jsx>{`
                .push-right {
                    margin-left: auto;
                    text-align: right;
                }

                .icon-interactable {
                    position: relative;
                    padding: ${theme.spacing(2)}px;
                    margin: -${theme.spacing(2)}px;
                    border-radius: ${theme.borderRadius * 2}px;
                    display: inline-block;
                    width: ${24 + theme.spacing(2 * 2)}px;
                    height: ${24 + theme.spacing(2 * 2)}px;
                    touch-action: manipulation;
                }

                .icon-interactable > :global(svg) {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .icon-interactable:active {
                    background: ${theme.shadePrimaryColor(1)};
                    color: ${theme.secondaryColor};
                }

                .icon-interactable:hover {
                    cursor: pointer;
                }
            `}</style>
            <FormElementBase {...formElementBaseProps}>
                {label && (
                    <FormElementLabel
                        name={label}
                        shortName={shortLabel}
                        extendedWidth={!value}
                    />
                )}
                {value && (
                    <FormMultilineValue value={value} />
                )}
                {(arrow || icon) && (
                    <span
                        className={classNames("push-right", {
                            "icon-interactable": !!onIconClick,
                        })}
                        onClick={handleIconClick}
                    >
                        {icon && icon}
                        {arrow && <ArrowRight size="24" strokeWidth={1} />}
                    </span>
                )}
            </FormElementBase>
        </>
    );
};

export default FormElement;
