import * as React from "react";
import theme from "../../styles/theme";

interface SubtitleProps {
    center?: true;
}

const Subtitle: React.FunctionComponent<SubtitleProps> = ({ children, center}) => {
    return (
        <>
            <style jsx>{`
                font-weight: bold;
                font-size: 1em;
                color: ${theme.primaryColor};
                margin: 0;
                margin-bottom: ${theme.spacing(2)}px;
                text-align: ${center ? "center" : "left"}
            `}</style>
            <h2>{children}</h2>
        </>
    );
};

export default Subtitle;
