import * as React from "react";
import useTheme from "../../src/hooks/useTheme";
interface TextProps {
    paragraph?: true;
    emphasis?: true;
    bottomSpacing?: number
}

const Text: React.FunctionComponent<TextProps> = ({children, paragraph, emphasis, bottomSpacing}) => {
    const theme = useTheme();
    const Element = paragraph ? "p" : "span";
    
    return <>
        <style jsx>{`
            color: ${emphasis ? "black" : theme.primaryColor};
            display: inline-block;
            line-height: 1.25em;
            margin-bottom: ${theme.spacing(bottomSpacing || 1)}px;
            
            p {
                margin: 0;
                margin-bottom: ${theme.spacing(2)}px;
            }
        `}</style>
        <Element>{children}</Element>
    </>;
};

export default Text;
