import classNames from "classnames";
import * as React from "react";
import useTheme from "../../src/hooks/useTheme";
interface TextProps {
    paragraph?: true;
    secondary?: boolean;
    bottomSpacing?: number
}

const Text: React.FunctionComponent<TextProps> = ({children, paragraph, secondary, bottomSpacing}) => {
    const theme = useTheme();
    const Element = paragraph ? "p" : "span";
    
    return <>
        <style jsx>{`
            color: ${secondary ? theme.disabledColor : theme.primaryColor};
            display: block;
            line-height: ${theme.unit > 8 ? 1.5 : 1.25}em;
            margin-bottom: ${theme.spacing(bottomSpacing || 1)}px;
    
            p {
                margin: 0;
                margin-bottom: ${theme.spacing(2)}px;
            }

            .secondary {
                font-style: italic;
            }
        `}</style>
        <Element className={classNames({ secondary })}>{children}</Element>
    </>;
};

export default Text;
