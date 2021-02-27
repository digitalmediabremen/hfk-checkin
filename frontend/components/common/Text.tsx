import * as React from "react";
import theme from "../../styles/theme";

interface TextProps {
    paragraph?: true;
    emphasis?: true;
}

const Text: React.FunctionComponent<TextProps> = ({children, paragraph, emphasis}) => {
    const Element = paragraph ? "p" : "span";
    
    return <>
        <style jsx>{`
            color: ${emphasis ? "black" : theme.primaryColor};
            display: inline-block;
            line-height: 1.4rem;
            
            p {
                margin: 0;
                margin-bottom: ${theme.spacing(2)}px;
            }
        `}</style>
        <Element>{children}</Element>
    </>;
};

export default Text;
