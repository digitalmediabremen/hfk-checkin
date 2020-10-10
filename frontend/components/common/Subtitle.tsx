import * as React from "react";
import theme from "../../styles/theme";

interface SubtitleProps {}

const Subtitle: React.FunctionComponent<SubtitleProps> = ({ children }) => {
    return (
        <>
            <style jsx>{`
                font-weight: bold;
                font-size: 1em;
                color: ${theme.primaryColor};
                margin: 0;
                margin-bottom: ${theme.spacing(2)}px;
            `}</style>
            <h2>{children}</h2>
        </>
    );
};

export default Subtitle;
