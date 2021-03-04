import classNames from "classnames";
import React, { Fragment, ReactNode } from "react";
import { ArrowRight } from "react-feather";
import { appUrls } from "../../config";
import useTheme from "../../src/hooks/useTheme";import FormMultilineValue from "../FormMultilineValue";
import EllipseText from "./EllipseText";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";
import FormElementLabel from "./FormElementLabel";

export interface FormElementProps extends FormElementBaseProps {
    label?: string;
    shortLabel?: string;
    labelIcon?: ReactNode;
    arrow?: true;
    actionIcon?: ReactNode;
    onIconClick?: () => void;
    value?: ReactNode | ReactNode[];
    maxRows?: number;
    isText?: boolean;
}

const FormElement: React.FunctionComponent<FormElementProps> = ({
    label,
    shortLabel,
    labelIcon,
    arrow,
    actionIcon,
    onIconClick,
    value,
    maxRows,
    isText,
    ...formElementBaseProps
}) => {
    const theme = useTheme();
    const handleIconClick = (
        event: React.MouseEvent<HTMLSpanElement, MouseEvent>
    ) => {
        event.stopPropagation();
        onIconClick?.();
    };
    return (
        <>
            <style jsx>{`
                .push-right {
                    margin-left: auto;
                    text-align: right;
                    line-height: 0;
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

                .label-icon {
                    padding-right: ${theme.spacing(1)}px;
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
                {!label && labelIcon && <span className="label-icon">{labelIcon}</span>}
                {value && (
                    <FormMultilineValue
                        maxRows={maxRows}
                        text={isText}
                        value={value}
                    />
                )}
                {(arrow || actionIcon) && (
                    <span
                        className={classNames("push-right", {
                            "icon-interactable": !!onIconClick,
                        })}
                        {...(!!onIconClick
                            ? { onClick: handleIconClick }
                            : undefined)}
                    >
                        {actionIcon && actionIcon}
                        {!actionIcon && arrow && (
                            <ArrowRight size="24" strokeWidth={1} />
                        )}
                    </span>
                )}
            </FormElementBase>
        </>
    );
};

export default FormElement;
