import classNames from "classnames";
import * as React from "react";
import useTheme from "../../src/hooks/useTheme";
import { empty } from "../../src/util/TypeUtil";
interface TextProps {
    paragraph?: true;
    secondary?: boolean;
    bottomSpacing?: number;
    onClick?: () => void;
}

const FormText: React.FunctionComponent<TextProps> = ({
    children,
    paragraph,
    secondary,
    bottomSpacing,
    onClick,
}) => {
    const theme = useTheme();
    const Element = paragraph ? "p" : "span";

    return (
        <>
            <style jsx>{`
                color: ${secondary ? theme.disabledColor : theme.primaryColor};
                font-weight: normal;
                display: block;
                line-height: ${theme.unit > 8 ? 1.5 : 1.25}em;
                margin-bottom: ${theme.spacing(
                    empty(bottomSpacing) ? 1 : bottomSpacing
                )}px;

                p {
                    margin: 0;
                    margin-bottom: ${theme.spacing(2)}px;
                }

                .secondary {
                    font-style: italic;
                }
            `}</style>
            <Element onClick={onClick} className={classNames({ secondary })}>
                {children}
            </Element>
        </>
    );
};

export default FormText;
