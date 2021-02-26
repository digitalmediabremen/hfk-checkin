import classNames from "classnames";
import React, { ReactNode } from "react";
import { ArrowRight } from "react-feather";
import css from "styled-jsx/css";
import theme from "../../styles/theme";
import EllipseText from "./EllipseText";
import FormElementBase, { FormElementBaseProps } from "./FormElementBase";

interface NewButtonProps extends FormElementBaseProps {
    children: string;
    onClick?: () => void;
    iconRight?: ReactNode;
    iconLeft?: ReactNode;
}

const { className, styles } = css.resolve`
    // .form-element-{
    //     transform: scale(0.9);
    // }
`;

const NewButton: React.FunctionComponent<NewButtonProps> = ({
    children,
    onClick,
    iconLeft,
    iconRight,
    noOutline,
    narrow,
    ...formElementBaseProps
}) => {
    const hasIcon = !!iconLeft || !!iconRight;
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
                    line-height: 16px;
                    width: 100%;
                    text-transform: uppercase;
                    text-decoration: underline;
                }

                div.center h3 {
                    text-align: center;
                    padding: 0 ${hasIcon ? theme.spacing(4) : 0}px 0
                    ${hasIcon ? theme.spacing(4) : 0}px;
                    text-decoration: none;
                }

                .icon {
                    flex: 0 0 ${theme.spacing(4)}px;
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
            <FormElementBase narrow noPadding={noOutline} noOutline={noOutline} {...formElementBaseProps} onClick={onClick} componentType="button">
                {iconLeft && <span className="icon left">{iconLeft}</span>}
                <div className={classNames({"center": !noOutline})}>
                    <EllipseText>
                        {(ellipseClass) => (
                            <h3 className={ellipseClass}>{children}</h3>
                        )}
                    </EllipseText>
                </div>
                {iconRight && <span className="icon right">{iconRight}</span>}
            </FormElementBase>
        </>
    );
};

export default NewButton;
