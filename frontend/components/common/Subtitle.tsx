import * as React from "react";
import useTheme from "../../src/hooks/useTheme";
interface SubtitleProps {
    center?: true;
    bold?: true;
}

const Subtitle: React.FunctionComponent<SubtitleProps> = ({ children, center, bold: _bold}) => {
    const bold = !center ? true : _bold;
    const theme = useTheme();
    return (
        <>
            <style jsx>{`
                font-weight: ${bold ? "bold" : "normal"};
                font-size: 1.0rem;
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
