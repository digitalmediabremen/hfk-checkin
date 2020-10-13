import * as React from "react";
import theme from "../../styles/theme";

interface NoticeProps {}

const Notice: React.FunctionComponent<NoticeProps> = ({ children }) => {
    return (
        <>
            <style jsx>{`
                i {
                    display: inline-block;
                    color: ${theme.primaryColor};
                    margin-bottom: ${theme.spacing(2)}px;
                }
            `}</style>
            <i>{children}</i>
        </>
    );
};

export default Notice;
