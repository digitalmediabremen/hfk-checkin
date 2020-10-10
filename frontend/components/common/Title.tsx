import * as React from "react";
import theme from "../../styles/theme";

interface TitleProps {
    bold?: true;
}

const Title: React.FunctionComponent<TitleProps> = ({ children, bold }) => {
    return (
        <>
            <style jsx>{`
                font-weight: ${bold ? "bold" : "normal"};
                font-size: 2em;
                color: ${theme.primaryColor};
                margin: 0;
                margin-bottom: ${theme.spacing(2)}px;
            `}</style>
            <h1>{children}</h1>
        </>
    );
};

export default Title;
