import classNames from "classnames";
import React, { forwardRef, ReactNode } from "react";
import css from "styled-jsx/css";
import useTheme from "../../src/hooks/useTheme";
import EllipseText from "./EllipseText";
import FormElementBase, { FormElementBaseProps, FormElementBaseRefType } from "./FormElementBase";

interface NewButtonProps extends FormElementBaseProps {
    children: string;
    iconRight?: ReactNode;
    iconLeft?: ReactNode;
}

const { className, styles } = css.resolve`
    // .form-element-{
    //     transform: scale(0.9);
    // }
`;

const NewButton = forwardRef<FormElementBaseRefType, NewButtonProps>(({
    children,
    onClick,
    iconLeft,
    iconRight,
    noOutline,
    narrow,
    href,
    ...formElementBaseProps
}, ref) => {
    const theme = useTheme();
    const hasIcon = !!iconLeft || !!iconRight;
    const componentType = !!href ? "a" : "button";
    return (
        <>
            <style jsx>{`
                div {
                    width: 100%;
                    flex: 1;
                    position: relative;
                }

                div.center {
                    margin: 0 ${iconRight ? -theme.spacing(4) : 0}px 0
                        ${iconLeft ? -theme.spacing(4) : 0}px;
                }

                h3 {
                    display: block;
                    margin: 0;
                    padding: 0;
                    text-align: left;
                    font-size: 1rem;
                    // line-height: 1em;
                    width: 100%;
                    text-transform: uppercase;
                    text-decoration: underline;
                    text-decoration-thickness: 2px;
                }

                div.center h3 {
                    text-align: center;
                    padding: 0 ${hasIcon ? theme.spacing(4) : 0}px 0
                        ${hasIcon ? theme.spacing(4) : 0}px;
                    text-decoration: none;
                }

                .icon {
                    flex: 0 0 ${theme.spacing(4)}px;
                    width: ${theme.spacing(4)}px;
                    line-height: 0;
                }

                .icon.right {
                    text-align: right;
                    margin-right: ${-theme.spacing(0)}px;
                }

                .icon.left {
                    text-align: left;
                    margin-left: ${-theme.spacing(0)}px;
                }
            `}</style>
            <FormElementBase
                narrow
                noPadding={noOutline}
                noOutline={noOutline}
                {...formElementBaseProps}
                onClick={onClick}
                href={href}
                componentType={componentType}
                ref={ref}
            >
                {iconLeft && <span className="icon left">{iconLeft}</span>}
                <div className={classNames({ center: !noOutline })}>
                    <EllipseText>
                        {ellipseClass => (
                            <h3 className={ellipseClass}>{children}</h3>
                        )}
                    </EllipseText>
                </div>
                {iconRight && <span className="icon right">{iconRight}</span>}
            </FormElementBase>
        </>
    );
});

export default NewButton;
