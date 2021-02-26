import * as React from "react";
import theme from "../../styles/theme";

interface TitleProps {
    bold?: true;
    subtext?: string | React.ReactNode;
}

const Title: React.FunctionComponent<TitleProps> = ({ children, bold, subtext }) => {
    return (
        <>
            <style jsx>{`
                color: ${theme.primaryColor};

                .hyphenize {
                    word-break: break-all;
                    word-break: break-word;
                    hyphens: auto;
                }

                h1 {
                    font-weight: ${bold ? "bold" : "normal"};
                    font-size: 2rem;
                    color: ${theme.primaryColor};
                    margin: 0;
                    margin-bottom: ${subtext ? theme.spacing(0) : theme.spacing(3)}px;
                }

                h2 {
                    font-size: 1.25em;
                    font-weight: normal;
                    margin: 0 0 ${theme.spacing(3)}px 0;
                }
            `}</style>
            <h1 className="hyphenize">{children}</h1>
            {subtext && <h2 className="hyphenize">{subtext}</h2>}
        </>
    );
};

export default Title;
