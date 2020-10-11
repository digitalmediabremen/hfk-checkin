import * as React from "react";
import theme from "../../styles/theme";

interface TitleProps {
    bold?: true;
    subtext?: string;
}

const Title: React.FunctionComponent<TitleProps> = ({ children, bold, subtext }) => {
    return (
        <>
            <style jsx>{`
                color: ${theme.primaryColor};

                h1 {
                    font-weight: ${bold ? "bold" : "normal"};
                    font-size: 2em;
                    color: ${theme.primaryColor};
                    margin: 0;
                    margin-bottom: ${subtext ? theme.spacing(0) : theme.spacing(3)}px;
                }

                h2 {
                    font-size: 1.3em;
                    font-weight: normal;
                    margin: 0 0 ${theme.spacing(3)}px 0;
                }
            `}</style>
            <h1>{children}</h1>
            {subtext && <h2>{subtext}</h2>}
        </>
    );
};

export default Title;
